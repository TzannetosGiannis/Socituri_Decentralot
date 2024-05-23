#[allow(lint(self_transfer, share_owned))]
module decentralot::lottery {

    use sui::sui::SUI;
    // use sui::event;
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::coin::{Self, Coin};
    use std::option::{Self, Option};
    use std::string::String;

    use decentralot::crowdfunding::{Self, CrowdFunding};
    use decentralot::refund;
    use decentralot::config::{Self, Config, AdminCap};
    use decentralot::incentive_treasury::{Self, IncentiveTreasury};
    use decentralot::lottery_ticket::{Self, LotteryTicket};
    use decentralot::fee_distribution::{Self, FeeDistribution, FeeDistributionTicket};

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
    const EFeeDistributionBuyingPeriodExpired: u64 = 14;
    const EFeeDistributionNotAvailable: u64 = 15;
    const EWrongLottery: u64 = 16;
    const ECampaignMissmatch: u64 = 17;
    const EFDBuyingPeriodStillActive: u64 = 18;
    const ENoFDTicketsRemaining: u64 = 19;

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
        incentives: Balance<SUI>,
        // fixed ticket's price
        ticket_price: u64,
        // total tickets bought for this lottery
        total_tickets: u64,
        // Lottery's end date in ms
        end_date: u64,
        // Lottery's lottery round
        round: u64,
        fee_distribution: Option<FeeDistribution>,
        winner: Option<u64>
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

        let lottery = new_lottery(ticket_price, end_date, 0, object::id(&campaign), ctx);
        campaign.latest_lotery = option::some(object::id(&lottery));

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

        let lottery = new_lottery(ticket_price, end_date, 0, object::id(&campaign), ctx);
        campaign.latest_lotery = option::some(object::id(&lottery));

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
        transfer::public_share_object(new_lottery);
    }

    public fun end_lottery(_: &AdminCap, cfg: &Config, campaign: &mut Campaign, lottery: &mut Lottery, winner:u64, clock: &Clock){
        config::assert_version(cfg);
        
        assert!(!has_active_lottery(campaign), EActiveLotteryExists);
        assert!(object::id(campaign) == lottery.campaign, ECampaignMissmatch);

        assert!(lottery.end_date < clock::timestamp_ms(clock), ELotteryStillActive);
        assert!(option::is_none(&lottery.winner), ELotteryAlreadyEnded);


        lottery.winner = option::some(winner);
        campaign.latest_lotery = option::none();
        campaign.total_tickets = campaign.total_tickets + lottery.total_tickets;
    }

    // ------ Manage Crowdfunding campaigns

    public fun complete_campaign(cfg: &Config, campaign: &mut Campaign, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_cf_campaign(campaign), ECannotRefundNonCFCampaign);
        let beneficiary = crowdfunding::beneficiary(option::borrow(&campaign.crowdfunding));

        assert!(tx_context::sender(ctx) == beneficiary, ENotBeneficiary);
        assert!(!has_active_lottery(campaign), EActiveLotteryExists);
        
        let cf_coin = crowdfunding::close_successful(option::borrow_mut(&mut campaign.crowdfunding), ctx);
        transfer::public_transfer(cf_coin, beneficiary);
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
        campaign.dust = campaign.dust + dust;

        let refund = refund::new_refund(raised_coin, refund_amount_per_ticket);

        dynamic_field::add(&mut campaign.id, REFUND_DFIELD_NAME, refund);
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
            transfer::public_transfer(ticket, tx_context::sender(ctx));
            start = start + 1;
        };
    }

    // If lottery.round < 2, input old_lottery == lottery
    public fun claim_prize(cfg: &Config, campaign: &mut Campaign, old_lottery: &Lottery, lottery: &mut Lottery, ticket: LotteryTicket, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_lottery_over(lottery), EWinnerNotDecided);
        assert!(balance::value(&lottery.bank) != 0, EPrizeAlreadyClaimed);

        let campaign_id = lottery.campaign;

        assert!(object::id(campaign) == campaign_id, ECampaignMissmatch);
        assert!(old_lottery.campaign == campaign_id, ECampaignMissmatch);
        assert!(old_lottery.round + 2 == lottery.round || lottery.round < 2, EWrongLottery);

        let round_number = lottery.round;
        let winner = lottery_winner(lottery);

        assert!(lottery_ticket::is_winning_ticket(&ticket, campaign_id, winner, round_number), ENoLotteryWinner);

        let total_amount = balance::value(&lottery.bank);
        
        let protocol_fee_amount = total_amount *  config::protocol_fee_bps(cfg) / BPS_MAX;
        let protocol_balance = balance::split(&mut lottery.bank, protocol_fee_amount);

        balance::join(&mut campaign.protocol_fees, protocol_balance);

        let prize = coin::take(&mut lottery.bank,  total_amount - protocol_fee_amount, ctx);
        let incentives = balance::value(&lottery.incentives);
        let incentives_coin = coin::take(&mut lottery.incentives,incentives, ctx);
        
        if (is_cf_campaign(campaign)){
            let cf = option::borrow(&campaign.crowdfunding);
            let keep_rate = crowdfunding::keep_rate_bps(cf);
            let keep = (coin::value(&prize) * keep_rate) / BPS_MAX;

            let cf_coin = coin::split(&mut prize, keep, ctx);
            crowdfunding::add_funds(option::borrow_mut(&mut campaign.crowdfunding), cf_coin);
        };

        lottery_ticket::burn(ticket);

        // Initialize the fee_distribution for the current lottery
        let dust = protocol_fee_amount;
        let redeem_reward_per_ticket = 0;
        if (lottery.round > 2){
            let old_fd_total_tickets = fee_distribution::fee_distribution_total_tickets(lottery_fee_distribution(old_lottery));
            redeem_reward_per_ticket = protocol_fee_amount / old_fd_total_tickets;

            // calculate dust
            dust = protocol_fee_amount - redeem_reward_per_ticket * old_fd_total_tickets;
        };
        
        let fd = fee_distribution::new_fee_distribution(protocol_fee_amount, redeem_reward_per_ticket);
        lottery.fee_distribution = option::some(fd);

        campaign.dust = campaign.dust + dust;

        coin::join(&mut prize, incentives_coin);
        transfer::public_transfer(prize, tx_context::sender(ctx));
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
        balance::join(&mut lottery.incentives, coin::into_balance(input_coin));
    }

    public fun pull_treasury_incentives(cfg: &Config, treasury: &mut IncentiveTreasury, lottery: &mut Lottery, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);
        assert!(clock::timestamp_ms(clock) < lottery.end_date, ELotteryExpired);

        let incentive_coin = incentive_treasury::pull_incentives(treasury, lottery.campaign, ctx);
        balance::join(&mut lottery.incentives, coin::into_balance(incentive_coin));
    }

    // -------- Fee Distribution
    // 1. Buy fee distribution ticket
    // 2. Redeem fee distribution ticket
    // 3. Team can claim remaining fee distribution tickets
    public fun buy_fee_distribution_token(cfg: &Config, campaign: &Campaign, lottery: &mut Lottery, input_coin: Coin<SUI>, amount: u64,  ctx: &mut TxContext){
        config::assert_version(cfg);
        
        assert!(option::is_some(&lottery.fee_distribution), EFeeDistributionNotAvailable);
        assert!(object::id(campaign) == lottery.campaign, EObjectMissmatch);
        assert!(campaign.round == lottery.round + 1, EFeeDistributionBuyingPeriodExpired);

        let fd = option::borrow_mut(&mut lottery.fee_distribution);
        
        let ticket = fee_distribution::new_fee_ticket(fd, lottery.campaign, lottery.round + 2, amount, ctx);
    
        let ticket_price = fee_distribution::fee_distribution_ticket_price(fd);
        assert!(coin::value(&input_coin) == ticket_price * amount, EIncorrectPaymentAmount);

        transfer::public_transfer(input_coin, @team);
        transfer::public_transfer(ticket, tx_context::sender(ctx));
    }

    public fun redeem_fee_distribution_ticket(cfg: &Config, campaign: &mut Campaign, lottery: &mut Lottery, ticket: FeeDistributionTicket, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_lottery_over(lottery), ELotteryStillActive);
        assert!(object::id(campaign) == lottery.campaign, ECampaignMissmatch);

        let (campaign_id, redeem_round, amount) = fee_distribution::redeem_fee_ticket(ticket);
        
        assert!(lottery.campaign == campaign_id, ECampaignMissmatch);
        assert!(lottery.round == redeem_round, EWrongLottery);

        let redeem_price_per_ticket = fee_distribution::fee_distribution_reward_per_ticket(lottery_fee_distribution(lottery));

        let reward = amount * redeem_price_per_ticket;

        let reward_coin = coin::take(&mut campaign.protocol_fees, reward, ctx);

        transfer::public_transfer(reward_coin, tx_context::sender(ctx));
    }

    public fun claim_unbought_tickets(cfg: &Config, campaign: &Campaign, lottery: &mut Lottery, ctx: &mut TxContext){
        config::assert_version(cfg);
        
        assert!(option::is_some(&lottery.fee_distribution), EFeeDistributionNotAvailable);
        assert!(object::id(campaign) == lottery.campaign, EObjectMissmatch);
        assert!(campaign.round > lottery.round + 1, EFDBuyingPeriodStillActive);

        let fd = option::borrow_mut(&mut lottery.fee_distribution);
        let unbought_tickets = fee_distribution::fee_distribution_remaining_tickets(fd);
        assert!(unbought_tickets != 0, ENoFDTicketsRemaining);
        
        let ticket = fee_distribution::new_fee_ticket(fd, lottery.campaign, lottery.round + 2, unbought_tickets, ctx);
    
        transfer::public_transfer(ticket, @team);
    }

    // ------- Recycle dust as incentives
    public fun recycle_dust(cfg: &Config, incentives: &mut IncentiveTreasury, campaign: &mut Campaign, ctx: &mut TxContext){
        config::assert_version(cfg);

        let dust_coin = coin::take(&mut campaign.protocol_fees, campaign.dust, ctx);
        campaign.dust = 0;
        incentive_treasury::push_incentives(cfg, incentives, dust_coin);
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
    
    public fun lottery_fee_distribution(lottery: &Lottery): &FeeDistribution {
        option::borrow(&lottery.fee_distribution)
    }
    // ----- Private Functions
    fun new_lottery(ticket_price: u64, end_date: u64, round: u64, campaign_id: ID, ctx: &mut TxContext): Lottery {
        Lottery {
            id: object::new(ctx),
            campaign: campaign_id,
            bank: balance::zero(),
            incentives: balance::zero(),
            ticket_price,
            total_tickets: 0,
            end_date,
            round,
            fee_distribution: option::none(),
            winner: option::none()
        }
    }

}