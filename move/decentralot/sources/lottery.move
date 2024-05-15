module decentralot::lottery {
    use sui::sui::SUI;
    use sui::event::{Self};
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::coin::{Self, Coin};


    use decentralot::config::{Self, Config, AdminCap};
    use decentralot::fee_distribution::{State, Self};

    friend decentralot::project;

    const BPS: u64 = 10000;
    const VERSION: u64 = 1;
    const TICKET_WINNING_DFIELD_NAME: vector<u8> = b"winning_ticket";

    // ----- Errors
    const ELotteryExpired: u64 = 0;
    const EIncorrectPaymentAmount: u64 = 1;
    const ELotteryStillActive: u64 = 2;
    const ELotteryAlreadyEnded: u64 = 3;
    const EPrizeAlreadyClaimed: u64 = 4;


    struct Lottery has key, store {
        id: UID,
        // Project this lottery belongs to
        project: ID,
        // bank for the lottery
        bank: Balance<SUI>,
        // incentives for the lottery
        incentives: Balance<SUI>,
        // fixed ticket's price
        ticket_price: u64,
        // total tickets bought for this lottery
        total_tickets: u64,
        // Lottery's end date in ms
        end_date: u64,
        // Fee Distribution State
        state:  State,
        // Lottery's lottery round
        round: u64
    }

    public(friend) fun new_lottery(ticket_price: u64, end_date: u64, pool_id: ID, ctx: &mut TxContext): ID {

        let lottery = Lottery {
            id: object::new(ctx),
            project: pool_id,
            bank: balance::zero(),
            incentives: balance::zero(),
            ticket_price,
            total_tickets: 0,
            end_date,
            state: fee_distribution::new_state(),
            round: 0
        };

        let lot_id = object::id(&lottery);

        transfer::share_object(lottery);
        lot_id
    }

    public fun buy_ticket(lottery: &mut Lottery, config: &Config, input_coin: Coin<SUI>, amount: u64, clock: &Clock, ctx: &mut TxContext) {
        config::assert_version(config);

        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);

        let total_price = amount * lottery.ticket_price;
        assert!(coin::value(&input_coin) == total_price, EIncorrectPaymentAmount);
        balance::join(&mut lottery.bank, coin::into_balance(input_coin));
        lottery.total_tickets = lottery.total_tickets + amount;
    }

    public fun incentivize(lottery: &mut Lottery, config: &Config, input_coin: Coin<SUI>, clock: &Clock, ctx: &mut TxContext) {
        config::assert_version(config);

        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);
        balance::join(&mut lottery.incentives, coin::into_balance(input_coin));

    }

    public(friend) fun end_lottery(_: &AdminCap, lottery: &mut Lottery, config: &Config, winner: u64,  clock: &Clock, ctx: &mut TxContext) {
        config::assert_version(config);

        // check that lottery has ended
        assert!(lottery.end_date < clock::timestamp_ms(clock), ELotteryStillActive);
        assert!(!dynamic_field::exists_(&lottery.id, TICKET_WINNING_DFIELD_NAME), ELotteryAlreadyEnded);

        dynamic_field::add(&mut lottery.id, TICKET_WINNING_DFIELD_NAME, winner);
    }   

    #[allow(lint(self_transfer))]
    public fun claim_prize(lottery: &mut Lottery, config: &Config, ctx: &mut TxContext) {
        config::assert_version(config);

        assert!(dynamic_field::exists_(&lottery.id, TICKET_WINNING_DFIELD_NAME), ELotteryStillActive);
        assert!(balance::value(&lottery.bank) == 0, EPrizeAlreadyClaimed);

        let total_amount = balance::value(&lottery.bank);
        
        let protocol_fee_amount = total_amount * config::protocol_fee_bps(config) / BPS;
        let protocol_coin = coin::take(&mut lottery.bank, protocol_fee_amount, ctx);

        let prize = coin::take(&mut lottery.bank,  total_amount - protocol_fee_amount, ctx);
        let incentives = balance::value(&lottery.incentives);
        coin::join(&mut prize, coin::take(&mut lottery.incentives,incentives, ctx));

        fee_distribution::add_funds(&mut lottery.state, protocol_coin);

        transfer::public_transfer(prize, tx_context::sender(ctx));
        
        
    }


 
}