#[allow(lint(self_transfer, share_owned))]
module decentralot::lottery {

    use sui::sui::SUI;
    use sui::event;
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::coin::{Self, Coin};
    use std::option::{Self, Option};
    use std::string::{String, utf8};

    use decentralot::crowdfunding::{Self, CrowdFunding};
    use decentralot::refund;
    use decentralot::config::{Self, Config, AdminCap};
    use decentralot::incentive_treasury::{Self, IncentiveTreasury};
    use decentralot::lottery_ticket::{Self, LotteryTicket};
    use decentralot::fee_distribution::{Self, FeeDistribution};

    const BPS_MAX: u64 = 10_000;

    const REFUND_DFIELD_NAME: vector<u8> = b"refund";

    const ECannotRefundNonCFCampaign: u64 = 1;
    const EActiveLotteryExists: u64 = 2;
    const ECrowdfundingDeadlinePassed: u64 = 3;
    const EObjectMissmatch: u64 = 4;
    const ELotteryExpired: u64 = 5;
    const EIncorrectPaymentAmount: u64 = 6;
    const ELotteryStillActive: u64 = 7;
    const ELotteryAlreadyEnded: u64 = 8;
    const EPrizeAlreadyClaimed: u64 = 9;
    const EWinnerNotDecided: u64 = 10;
    const ENoLotteryWinner: u64 = 11;
    const ENotRefundEligible: u64 = 12;
    const ENotBeneficiary : u64 = 13;
    const ECampaignMissmatch: u64 = 14;

    struct Campaign has key {
        id: UID,
        total_tickets: u64,
        duration: u64,
        round: u64,
        dust: u64,
        protocol_fees: Balance<SUI>,
        latest_lotery: Option<ID>,
        crowdfunding: Option<CrowdFunding>
    }

    struct Lottery has key, store {
        id: UID,
        // Project this lottery belongs to
        // bank for the lottery
        campaign: ID,
        bank: Balance<SUI>,
        // incentives for the lottery
        incentives: u64,
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

    // ----- Events

    // If the campaign is not Crowdfunding, last 4 fields will be empty.
    struct NewCampaign has copy, drop {
        id: ID,
        duration: u64,
        ticket_price: u64,
        goal: u64,
        deadline: u64,
        keep_rate_bps: u64,
        project_url: String,
    }

    struct NewLottery has copy, drop {
        id: ID,
        campaign: ID,
        ticket_price: u64,
        end_date: u64,
        round: u64,
    }

    struct LotteryEnded has copy, drop {
        id: ID,
        winner: u64,
        protocol_fee: u64,
        raised: u64,
    }

    struct CampaignCompleted has copy, drop {
        id: ID,
        raised: u64
    }

    struct CampaignRefunded has copy, drop {
        id: ID,
        refund_amount: u64,
        incentives_amount: u64,
        refund_per_ticket: u64
    }

    struct TicketBought has copy, drop {
        lottery: ID,
        ticket_id: ID,
        campaign: ID,
        round: u64,
        number: u64
    }

    struct PrizeClaimed has copy, drop {
        lottery: ID,
        winner: address,
        prize: u64,
    }

    struct DustAccumuldated has copy, drop {
        campaign: ID,
        dust: u64,
    }

    struct DustRecycled has copy, drop {
        campaign: ID,
        amount: u64,
    }

    struct IncentivesAdded has copy, drop {
        campaign: ID,
        lottery: ID,
        amount: u64,
    }


    // ------- New lotteries
    public fun new_campaign(_: &AdminCap, cfg: &Config, ticket_price: u64, duration: u64, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        let campaign = Campaign{
            id: object::new(ctx),
            total_tickets: 0,
            duration,
            round: 0,
            dust: 0,
            protocol_fees: balance::zero(),
            latest_lotery: option::none(),
            crowdfunding: option::none(),
        };

        let end_date = clock::timestamp_ms(clock) + duration;
        let campaign_id = object::id(&campaign);

        let lottery = new_lottery(ticket_price, end_date, 0, campaign_id, ctx);
        campaign.latest_lotery = option::some(object::id(&lottery));
        
        event::emit(NewCampaign{
            id: campaign_id,
            duration,
            ticket_price,
            goal: 0,
            deadline: 0,
            keep_rate_bps: 0,
            project_url: utf8(b""),
        });

        event::emit(NewLottery{
            id: object::id(&lottery),
            campaign: campaign_id,
            ticket_price,
            end_date,
            round: 0
        });

        transfer::share_object(campaign);
        transfer::public_share_object(lottery);
    }

    public fun new_crowdfunding_campaing(_: &AdminCap, cfg: &Config, ticket_price: u64, duration: u64,  goal:u64 , deadline:u64 , beneficiary: address, fee_rate_bps:u64, project_url: String, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        let cf = crowdfunding::new_crowdfunding(goal, deadline, beneficiary, fee_rate_bps, project_url);
        
        let campaign = Campaign{
            id: object::new(ctx),
            total_tickets: 0,
            duration,
            round: 0,
            dust: 0,
            protocol_fees: balance::zero(),
            latest_lotery: option::none(),
            crowdfunding: option::some(cf)
        };

        let end_date = clock::timestamp_ms(clock) + duration;
        let campaign_id = object::id(&campaign);

        let lottery = new_lottery(ticket_price, end_date, 0, campaign_id, ctx);
        campaign.latest_lotery = option::some(object::id(&lottery));

        event::emit(NewCampaign{
            id: campaign_id,
            duration,
            ticket_price,
            goal,
            deadline,
            keep_rate_bps: fee_rate_bps,
            project_url,
        });

        event::emit(NewLottery{
            id: object::id(&lottery),
            campaign: campaign_id,
            ticket_price,
            end_date,
            round: 0
        });

        transfer::share_object(campaign);
        transfer::public_share_object(lottery);
    }

    public fun new_round(cfg: &Config, campaign: &mut Campaign, lottery: &Lottery, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(!has_active_lottery(campaign), EActiveLotteryExists);
        assert!(object::id(campaign) == lottery.campaign, EObjectMissmatch);
        assert!(*option::borrow(&campaign.latest_lotery) == object::id(lottery), EObjectMissmatch);
        let now_ms = clock::timestamp_ms(clock);
        if (is_cf_campaign(campaign)){
            assert!(crowdfunding::deadline(option::borrow(&campaign.crowdfunding)) > now_ms, ECrowdfundingDeadlinePassed);
        };

        let end_date = now_ms + campaign.duration;
        let new_lottery = new_lottery(lottery.ticket_price, end_date, lottery.round + 1, lottery.campaign, ctx);
        campaign.latest_lotery = option::some(object::id(&new_lottery));
        campaign.round = campaign.round + 1;

        
        event::emit(NewLottery{
            id: object::id(&new_lottery),
            campaign: lottery.campaign,
            ticket_price: lottery.ticket_price,
            end_date,
            round: campaign.round
        });
        
        transfer::public_share_object(new_lottery);
    }

    public fun end_lottery(_: &AdminCap, cfg: &Config, campaign: &mut Campaign, lottery: &mut Lottery, winner:u64, fd: &mut FeeDistribution, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);
        
        assert!(object::id(campaign) == lottery.campaign, ECampaignMissmatch);

        assert!(lottery.end_date < clock::timestamp_ms(clock), ELotteryStillActive);
        assert!(option::is_none(&lottery.winner), ELotteryAlreadyEnded);

        // Protocol fee is only claimed on the tickets - not the incentives
        let protocol_fee_amount = (balance::value(&lottery.bank) - lottery.incentives) *  config::protocol_fee_bps(cfg) / BPS_MAX;
        let protocol_coin = coin::take(&mut lottery.bank, protocol_fee_amount, ctx);
        fee_distribution::add_fees(cfg, fd, protocol_coin, clock);
        let cf_amount = 0;

        if (is_cf_campaign(campaign)){
            let cf = option::borrow(&campaign.crowdfunding);
            let keep_rate = crowdfunding::keep_rate_bps(cf);
            let keep = ((balance::value(&lottery.bank) - lottery.incentives) * keep_rate) / BPS_MAX;

            let cf_coin = coin::take(&mut lottery.bank, keep, ctx);
            crowdfunding::add_funds(option::borrow_mut(&mut campaign.crowdfunding), cf_coin);
        };

        lottery.winner = option::some(winner);
        campaign.latest_lotery = option::none();
        campaign.total_tickets = campaign.total_tickets + lottery.total_tickets;

        event::emit(LotteryEnded{
            id: object::id(lottery),
            winner,
            protocol_fee: protocol_fee_amount,
            raised: cf_amount,
        });
    }

    // ------ Manage Crowdfunding campaigns

    public fun complete_campaign(cfg: &Config, campaign: &mut Campaign, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_cf_campaign(campaign), ECannotRefundNonCFCampaign);
        let beneficiary = crowdfunding::beneficiary(option::borrow(&campaign.crowdfunding));

        assert!(tx_context::sender(ctx) == beneficiary, ENotBeneficiary);
        assert!(!has_active_lottery(campaign), EActiveLotteryExists);
        
        let cf_coin = crowdfunding::close_successful(option::borrow_mut(&mut campaign.crowdfunding), ctx);
        let raised = coin::value(&cf_coin);
        transfer::public_transfer(cf_coin, beneficiary);

        event::emit(CampaignCompleted{
            id: object::id(campaign),
            raised
        });
    }

    public fun refund_campaign(cfg: &Config, campaign: &mut Campaign, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_cf_campaign(campaign), ECannotRefundNonCFCampaign);
        assert!(!has_active_lottery(campaign), EActiveLotteryExists);

        let raised_coin = crowdfunding::close_unsuccessful(option::borrow_mut(&mut campaign.crowdfunding), clock, ctx);
        let total_raised = coin::value(&raised_coin);

        // 90% of the raised funds are refunded to the backers, split equally
        let refund_amount = 9_000 * total_raised / 10_000;
        let refund_amount_per_ticket = refund_amount / campaign.total_tickets;
        
        // The remaining amount is incentive portion (10%) and dust
        let dust = total_raised - (campaign.total_tickets * refund_amount_per_ticket);
        add_dust(campaign, dust);

        let refund = refund::new_refund(raised_coin, refund_amount_per_ticket);

        dynamic_field::add(&mut campaign.id, REFUND_DFIELD_NAME, refund);

        event::emit(CampaignRefunded{
            id: object::id(campaign),
            refund_amount: refund_amount,
            incentives_amount: dust,
            refund_per_ticket: refund_amount_per_ticket,
        });
    }

    // --------- Buy/Redeem/Refund Tickets

    public fun buy_ticket(cfg: &Config, lottery: &mut Lottery, input_coin: Coin<SUI>, amount: u64, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);

        let total_price = amount * lottery.ticket_price;
        assert!(coin::value(&input_coin) == total_price, EIncorrectPaymentAmount);
        balance::join(&mut lottery.bank, coin::into_balance(input_coin));

        let start = lottery.total_tickets;
        lottery.total_tickets = lottery.total_tickets + amount;

        let campaign = lottery.campaign;
        let round_number = lottery.round;
        
        while (start < lottery.total_tickets){
            let ticket = lottery_ticket::new_ticket(campaign, start, round_number, ctx);
            event::emit(TicketBought{
                lottery: object::id(lottery),
                campaign,
                ticket_id: object::id(&ticket),
                round: round_number,
                number: start,
            });
            transfer::public_transfer(ticket, tx_context::sender(ctx));
            start = start + 1;
        };
    }

    // If lottery.round < 2, input old_lottery == lottery
    public fun claim_prize(cfg: &Config, campaign: &mut Campaign, lottery: &mut Lottery, ticket: LotteryTicket, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_lottery_over(lottery), EWinnerNotDecided);
        let amount_earned = balance::value(&lottery.bank);

        assert!(amount_earned != 0, EPrizeAlreadyClaimed);

        let campaign_id = lottery.campaign;

        assert!(object::id(campaign) == campaign_id, ECampaignMissmatch);

        let round_number = lottery.round;
        let winning_number = lottery_winner(lottery);

        assert!(lottery_ticket::is_winning_ticket(&ticket, campaign_id, winning_number, round_number), ENoLotteryWinner);

        lottery_ticket::burn(ticket);
        let prize = coin::take(&mut lottery.bank, amount_earned, ctx);

        let winner = tx_context::sender(ctx);

        transfer::public_transfer(prize,winner);

        event::emit(PrizeClaimed{
            lottery: object::id(lottery),
            winner,
            prize: amount_earned,
        });
    }

    public fun refund(cfg: &Config, campaign: &mut Campaign, ticket: LotteryTicket, ctx: &mut TxContext){
        config::assert_version(cfg);
        
        assert!(lottery_ticket::is_refund_eligible(&ticket, object::id(campaign)), ENotRefundEligible);
        
        let reimburshment = refund::refund(dynamic_field::borrow_mut(&mut campaign.id, REFUND_DFIELD_NAME), ctx);
        lottery_ticket::burn(ticket);

        transfer::public_transfer(reimburshment, tx_context::sender(ctx));
    }


    // ------- Incentivizing functions

    public fun incentivize(config: &Config, lottery: &mut Lottery,input_coin: Coin<SUI>, clock: &Clock) {
        config::assert_version(config);

        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);
        let coin_value = coin::value(&input_coin);
        balance::join(&mut lottery.bank, coin::into_balance(input_coin));
        lottery.incentives = lottery.incentives + coin_value;

        event::emit(IncentivesAdded{
            campaign: lottery.campaign,
            lottery: object::id(lottery),
            amount: coin_value,
        })
    }

    public fun pull_treasury_incentives(cfg: &Config, treasury: &mut IncentiveTreasury, lottery: &mut Lottery, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);
        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);

        let incentive_coin = incentive_treasury::pull_incentives(treasury, lottery.campaign, ctx);
        let coin_value = coin::value(&incentive_coin);

        balance::join(&mut lottery.bank, coin::into_balance(incentive_coin));
        lottery.incentives = lottery.incentives + coin_value;
        
        event::emit(IncentivesAdded{
            campaign: lottery.campaign,
            lottery: object::id(lottery),
            amount: coin_value,
        });
    }

    // ------- Recycle dust as incentives
    public fun recycle_dust(cfg: &Config, incentives: &mut IncentiveTreasury, campaign: &mut Campaign, ctx: &mut TxContext){
        config::assert_version(cfg);

        let dust_coin = coin::take(&mut campaign.protocol_fees, campaign.dust, ctx);
        let dust_collected = campaign.dust;
        campaign.dust = 0;
        incentive_treasury::push_incentives(cfg, incentives, dust_coin);
        event::emit(DustRecycled{
            campaign: object::id(campaign),
            amount: dust_collected
        });
    }

    // ----- View Functions
    public fun lottery_campaign_id(lottery: &Lottery): ID {
        lottery.campaign
    }

    public fun lottery_round(lottery: &Lottery): u64 {
        lottery.round
    }

    public fun is_lottery_over(lottery: &Lottery): bool{
        option::is_some(&lottery.winner)
    }

    public fun lottery_winner(lottery: &Lottery): u64 {
        *option::borrow(&lottery.winner)
    }

    public fun total_campaign_tickets(campaign: &Campaign): u64 {
        campaign.total_tickets
    }

    public fun latest_campaign_lottery(campaign: &Campaign): Option<ID> {
        campaign.latest_lotery
    }

    public fun has_active_lottery(campaign: &Campaign): bool {
        option::is_some(&campaign.latest_lotery)
    }

    public fun is_cf_campaign(campaign: &Campaign): bool {
        option::is_some(&campaign.crowdfunding)
    }



    // ----- Private Functions
    fun new_lottery(ticket_price: u64, end_date: u64, round: u64, campaign_id: ID, ctx: &mut TxContext): Lottery {
        Lottery {
            id: object::new(ctx),
            campaign: campaign_id,
            bank: balance::zero(),
            incentives: 0,
            ticket_price,
            total_tickets: 0,
            end_date,
            round,
            winner: option::none()
        }
    }

    fun add_dust(campaign: &mut Campaign, dust: u64){
        campaign.dust = campaign.dust + dust;
        event::emit(DustAccumuldated{
            campaign: object::id(campaign),
            dust
        });
    }

}