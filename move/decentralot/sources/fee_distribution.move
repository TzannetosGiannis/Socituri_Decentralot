#[allow(lint(self_transfer))]
module decentralot::fee_distribution {
    use sui::sui::SUI;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    use sui::event;
    
    use decentralot::config::{Self, Config};
    use decentralot::incentive_treasury::{Self, IncentiveTreasury};


    const FIFTY_SUI: u64 = 50_000000000; // 50 SUI
    const ONE_WEEK: u64 = 604_800_000; // 1 week in ms

    // ----- Errors
    const ENotEnoughTickets: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const ECannotBuyTicket: u64 = 3;
    const ECannotClaimTicketsForEpoch: u64 = 4;
    const ENoTicketsToClaim: u64 = 5;
    const EEpochDoesNotExist: u64 = 6;
    
    
    struct FeeDistribution has key, store {
        id: UID,
        bank: Balance<SUI>,
        current_epoch_fees: u64,
        last_recorded_epoch: u64,
        config_per_epoch: Table<u64, EpochConfig>,
        dust: u64
    }

    struct EpochConfig has store {
        // Total fee distribution tickets for current epoch
        total_tickets: u64,
        // Unbought fee distribution tickets for current epoch
        remaining_tickets: u64,
        // Price per ticket for current epoch
        price_per_ticket: u64,
        // Price per ticket for tickets to be redeemed this epoch
        redeem_price_per_ticket: u64
    }
    
    struct FeeDistributionTicket has key, store {
        id: UID,
        redeem_epoch: u64,
        amount: u64
    }

    // ------- Events
    struct AdvancedEpoch has copy, drop {
        epoch: u64,
        last_epoch_fees: u64,
        last_epoch_ticket_price: u64,
        redeem_price_per_ticket: u64
    }

    struct FeesAdded has copy, drop {
        epoch: u64,
        fees_added: u64
    }

    struct TicketsBought has copy, drop {
        id: ID,
        epoch: u64,
        redeem_epoch: u64,
        amount: u64,
    }

    struct TicketRedeemed has copy, drop {
        id: ID,
        reward: u64
    }

    struct UnboughtTicketsClaimed has copy, drop {
        id: ID,
        amount: u64,
        epoch: u64,
    }

    struct DustAccumulated has copy, drop {
        dust_amount: u64,
    }

    struct DustRecycled has copy, drop {
        amount: u64
    }

    fun init(ctx: &mut TxContext) {
        let fd = FeeDistribution {
            id: object::new(ctx),
            bank: balance::zero(),
            current_epoch_fees: 0,
            last_recorded_epoch: 0,
            config_per_epoch: table::new(ctx), 
            dust: 0
        };

        transfer::share_object(fd);
    }

    public fun advance_epoch(cfg: &Config, fd: &mut FeeDistribution, clock: &Clock){
        config::assert_version(cfg);

        let curr_epoch = current_epoch(clock);
        if (curr_epoch == fd.last_recorded_epoch || fd.current_epoch_fees == 0) {
            return
        };
        
        let prev_epoch = curr_epoch - 1;
        let last_epoch_fees = fd.current_epoch_fees; 
        
        // If the config for epoch `prev_epoch - 2` does note exist, then the prev epoch's fees cannot be distributed.
        // Thus, the whole amount is recycled as `dust` and epoch's redeem price is 0.
        let dust = last_epoch_fees;
        let redeem_price_per_ticket = 0;

        if (table::contains(&fd.config_per_epoch, prev_epoch - 2)) {
            let old_epoch_cfg = table::borrow(&fd.config_per_epoch, prev_epoch - 2);
            let old_total_tickets = old_epoch_cfg.total_tickets;

            // The redeem_price_per_ticket for previous epoch will be `current_epoch_fees / old_total_tickets`
            redeem_price_per_ticket = last_epoch_fees / old_total_tickets;

            dust = last_epoch_fees - old_total_tickets * redeem_price_per_ticket;
        };

        add_dust(fd, dust);

        let epoch_cfg = new_epoch_cfg(fd.current_epoch_fees, redeem_price_per_ticket);
        let price_per_ticket = epoch_cfg.price_per_ticket;


        table::add(&mut fd.config_per_epoch, prev_epoch, epoch_cfg);
        
        fd.current_epoch_fees = 0;
        fd.last_recorded_epoch = curr_epoch;

        
        event::emit(AdvancedEpoch{
            epoch: curr_epoch,
            last_epoch_fees,
            last_epoch_ticket_price: price_per_ticket,
            redeem_price_per_ticket
        }); 
    }

    public fun add_fees(cfg: &Config, fd: &mut FeeDistribution, fee_coin: Coin<SUI>, clock: &Clock){
        config::assert_version(cfg);
        advance_epoch(cfg, fd, clock);
        
        let amount = coin::value(&fee_coin);
        fd.current_epoch_fees = fd.current_epoch_fees + amount;
        balance::join(&mut fd.bank, coin::into_balance(fee_coin));
        
        event::emit(FeesAdded{
            epoch: current_epoch(clock),
            fees_added: amount
        });
    }

    public fun buy_ticket(cfg: &Config, fd: &mut FeeDistribution, amount: u64, input_coin: Coin<SUI>, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);
        advance_epoch(cfg, fd, clock);

        // During epoch N, one buys tickets on epoch N-1 to be redeemed on epoch N+1
        let curr_epoch = current_epoch(clock);
        let prev_epoch = curr_epoch - 1;
        assert!(table::contains(&fd.config_per_epoch, prev_epoch), ECannotBuyTicket);
        let epoch_cfg = table::borrow_mut(&mut fd.config_per_epoch, prev_epoch);

        let price = epoch_cfg.price_per_ticket * amount;
        assert!(coin::value(&input_coin) == price, EInsufficientPayment);

        let ticket = new_fd_ticket(epoch_cfg, curr_epoch + 1, amount, ctx);
        let ticket_id = object::id(&ticket);

        transfer::public_transfer(input_coin, @team);
        transfer::transfer(ticket, tx_context::sender(ctx));

        event::emit(TicketsBought{
            id: ticket_id,
            epoch: prev_epoch,
            redeem_epoch: curr_epoch + 1,
            amount
        });
    }

    public fun redeem_ticket(cfg: &Config, fd: &mut FeeDistribution, ticket: FeeDistributionTicket, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);
        advance_epoch(cfg, fd, clock);

        let redeemed_ticket_id = object::id(&ticket);

        let (redeem_epoch, amount) = redeem_fee_ticket(ticket);
        assert!(table::contains(&fd.config_per_epoch, redeem_epoch), EEpochDoesNotExist);
        
        let epoch_cfg = table::borrow(&fd.config_per_epoch, redeem_epoch);
    
        let reward = amount * epoch_cfg.redeem_price_per_ticket;
        let reward_coin = coin::take(&mut fd.bank, reward, ctx);
        transfer::public_transfer(reward_coin, tx_context::sender(ctx));

        event::emit(TicketRedeemed{
            id:redeemed_ticket_id,
            reward
        });
    }

    // Admin can claim any remaining/unbought tickets for past epochs
    public fun claim_remaining_tickets_for_epoch(cfg: &Config, fd: &mut FeeDistribution, epoch: u64, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);
        advance_epoch(cfg, fd, clock);
        
        let curr_epoch = current_epoch(clock);
        assert!(epoch < curr_epoch - 1, ECannotClaimTicketsForEpoch);

        let epoch_cfg = table::borrow_mut(&mut fd.config_per_epoch, epoch);
        let remaining_tickets = epoch_cfg.remaining_tickets;
        assert!(remaining_tickets != 0, ENoTicketsToClaim);
        let ticket = new_fd_ticket(epoch_cfg, epoch + 2, remaining_tickets, ctx);
        let ticket_id = object::id(&ticket);

        transfer::transfer(ticket, @team);

        event::emit(UnboughtTicketsClaimed{
            id: ticket_id,
            amount: remaining_tickets,
            epoch
        });
    }

    public fun recycle_dust(cfg: &Config, incentives: &mut IncentiveTreasury, fd: &mut FeeDistribution, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);
        advance_epoch(cfg, fd, clock);

        let dust_coin = coin::take(&mut fd.bank, fd.dust, ctx);
        let dust_collected = fd.dust;
        fd.dust = 0;
        incentive_treasury::push_incentives(cfg, incentives, dust_coin);
        event::emit(DustRecycled{
            amount: dust_collected
        });
    }


    // ----- View functions
    public fun current_epoch(clock: &Clock): u64 {
        clock::timestamp_ms(clock) / ONE_WEEK
    }

    // ----- Internal functions
    fun new_epoch_cfg(epoch_fees: u64, redeem_price_per_ticket: u64): EpochConfig {
        let total_tickets = epoch_fees / FIFTY_SUI;
        if (total_tickets < 50) {
            total_tickets = 50
        };

        let price_per_ticket = ceil_div(epoch_fees, total_tickets);
        
        EpochConfig {
            total_tickets,
            remaining_tickets: total_tickets,
            price_per_ticket,
            redeem_price_per_ticket
        }
    }


    fun new_fd_ticket(epoch_cfg: &mut EpochConfig, redeem_epoch: u64, amount: u64, ctx: &mut TxContext): FeeDistributionTicket {
        assert!(epoch_cfg.remaining_tickets >= amount, ENotEnoughTickets);
        epoch_cfg.remaining_tickets = epoch_cfg.remaining_tickets - amount;
        FeeDistributionTicket {
            id: object::new(ctx),
            redeem_epoch, 
            amount
        }
    }

    fun redeem_fee_ticket(ticket: FeeDistributionTicket): (u64, u64){
        let FeeDistributionTicket {id, redeem_epoch, amount} = ticket;
        object::delete(id);
        (redeem_epoch, amount)
    }

    fun add_dust(fd: &mut FeeDistribution, dust: u64){
        fd.dust = fd.dust + dust;
        event::emit(DustAccumulated {
            dust_amount: dust
        });
    }

    fun ceil_div(x: u64, y: u64): u64 {
        // `y` will never be 0.
        if (x == 0) {
            0
        }
        else (x - 1) / y + 1
    }
}