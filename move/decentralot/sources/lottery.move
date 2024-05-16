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
    use std::option::{Self, Option};


    use decentralot::config::{Self, Config, AdminCap};

    friend decentralot::campaign;
    friend decentralot::router;

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
        // bank for the lottery
        project: ID,
        bank: Balance<SUI>,
        // incentives for the lottery
        incentives: Balance<SUI>,
        // fixed ticket's price
        ticket_price: u64,
        // total tickets bought for this lottery
        total_tickets: u64,
        // Lottery's end date in ms
        end_date: u64,
        // Lottery's lottery round
        round: u64,
        winner: Option<u64>
    }


    public(friend) fun new_lottery(ticket_price: u64, end_date: u64, pool_id: ID, ctx: &mut TxContext): Lottery {
        Lottery {
            id: object::new(ctx),
            project: pool_id,
            bank: balance::zero(),
            incentives: balance::zero(),
            ticket_price,
            total_tickets: 0,
            end_date,
            round: 0,
            winner: option::none()
        }
    }

    public(friend) fun new_round(lottery: &Lottery, end_date: u64, ctx: &mut TxContext): Lottery {
        Lottery {
            id: object::new(ctx),
            project: lottery.project,
            bank: balance::zero(),
            incentives: balance::zero(),
            ticket_price: lottery.ticket_price,
            total_tickets: 0,
            end_date,
            round: lottery.round + 1,
            winner: option::none()
        }
    }

    public(friend) fun buy_ticket(lottery: &mut Lottery, input_coin: Coin<SUI>, amount: u64, clock: &Clock, ctx: &mut TxContext): u64 {
        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);

        let total_price = amount * lottery.ticket_price;
        assert!(coin::value(&input_coin) == total_price, EIncorrectPaymentAmount);
        balance::join(&mut lottery.bank, coin::into_balance(input_coin));

        let start_ticket_number = lottery.total_tickets;
        lottery.total_tickets = lottery.total_tickets + amount;

        start_ticket_number

    }

    public fun incentivize(config: &Config, lottery: &mut Lottery,input_coin: Coin<SUI>, clock: &Clock, ctx: &mut TxContext) {
        config::assert_version(config);

        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);
        balance::join(&mut lottery.incentives, coin::into_balance(input_coin));

    }

    public(friend) fun end_lottery(lottery: &mut Lottery, winner: u64,  clock: &Clock, ctx: &mut TxContext) {
        // check that lottery has ended
        assert!(lottery.end_date < clock::timestamp_ms(clock), ELotteryStillActive);
        assert!(option::is_none(&lottery.winner), ELotteryAlreadyEnded);

        lottery.winner = option::some(winner);
    }   

    #[allow(lint(self_transfer))]
    public(friend) fun claim_prize(lottery: &mut Lottery, protocol_fee_bps: u64, ctx: &mut TxContext): (Coin<SUI>, Coin<SUI>) {

        assert!(option::is_some(&lottery.winner), ELotteryStillActive);
        assert!(balance::value(&lottery.bank) == 0, EPrizeAlreadyClaimed);

        let total_amount = balance::value(&lottery.bank);
        
        let protocol_fee_amount = total_amount * protocol_fee_bps / BPS;
        let protocol_coin = coin::take(&mut lottery.bank, protocol_fee_amount, ctx);

        let prize = coin::take(&mut lottery.bank,  total_amount - protocol_fee_amount, ctx);
        let incentives = balance::value(&lottery.incentives);
        let incentives_coin = coin::take(&mut lottery.incentives,incentives, ctx);

        transfer::public_transfer(protocol_coin, @team);

        (prize, incentives_coin)
    }


    // ---- View

    public fun campaign_id(lottery: &Lottery): ID {
        lottery.project
    }

    public fun round(lottery: &Lottery): u64 {
        lottery.round
    }

    public fun is_over(lottery: &Lottery): bool{
        option::is_some(&lottery.winner)
    }

    public fun winner(lottery: &Lottery): u64 {
        *option::borrow(&lottery.winner)
    }
    


 
}