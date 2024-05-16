module decentralot::campaign {
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
    use std::string::{Self, String, utf8};



    use decentralot::lottery;
    use decentralot::crowdfunding::{Self, CrowdFunding};
    use decentralot::refund::{Self, Refund};
    use decentralot::config::{Config, AdminCap, Self};

    friend decentralot::router;

    const BPS_MAX: u64 = 10_000;

    const REFUND_DFIELD_NAME: vector<u8> = b"refund";

    const ECannotRefundNonCFCampaign: u64 = 0;
    const EActiveLotteryExists: u64 = 1;

    struct Campaign has key {
        id: UID,
        total_tickets: u64,
        fee_distribution: u64, 
        latest_lotery: Option<ID>,
        crowdfunding: Option<CrowdFunding>
    }

    public fun new_campaign(_: &AdminCap, cfg: &Config, ticket_price: u64, duration: u64,  clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        let campaign = Campaign{
            id: object::new(ctx),
            total_tickets: 0,
            fee_distribution: 0,
            latest_lotery: option::none(),
            crowdfunding: option::none()
        };

        let end_date = clock::timestamp_ms(clock) + duration;

        let lottery = lottery::new_lottery(ticket_price, end_date, object::id(&campaign), ctx);
        campaign.latest_lotery = option::some(object::id(&lottery));

        transfer::share_object(campaign);
        transfer::public_share_object(lottery);
    }

    public fun new_crowdfunding_campaing(_: &AdminCap, cfg: &Config, ticket_price: u64,duration: u64,  goal:u64 , deadline:u64 , beneficiary: address, fee_rate_bps:u64, project_url: String, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        let cf = crowdfunding::new_crowdfunding(goal, deadline, beneficiary, fee_rate_bps, project_url);
        
        let campaign = Campaign{
            id: object::new(ctx),
            total_tickets: 0,
            fee_distribution: 0,
            latest_lotery: option::none(),
            crowdfunding: option::some(cf)
        };

        let end_date = clock::timestamp_ms(clock) + duration;

        let lottery = lottery::new_lottery(ticket_price, end_date, object::id(&campaign), ctx);
        campaign.latest_lotery = option::some(object::id(&lottery));

        transfer::share_object(campaign);
        transfer::public_share_object(lottery);
    }

    public fun complete_campaign(cfg: &Config, campaign: &mut Campaign, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_cf_campaign(campaign), ECannotRefundNonCFCampaign);
        assert!(!has_active_lottery(campaign), EActiveLotteryExists);
        
        crowdfunding::close_successful(option::borrow_mut(&mut campaign.crowdfunding), ctx);
    }

    public fun refund_campaign(cfg: &Config, campaign: &mut Campaign, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(is_cf_campaign(campaign), ECannotRefundNonCFCampaign);
        assert!(!has_active_lottery(campaign), EActiveLotteryExists);

        let raised_coin = crowdfunding::close_unsuccessful(option::borrow_mut(&mut campaign.crowdfunding), clock, ctx);
        let total_raised = coin::value(&raised_coin);
        
        let refund_amount_per_ticket = total_raised / campaign.total_tickets;
        
        let dust = total_raised - (campaign.total_tickets * refund_amount_per_ticket);
        
        if (dust != 0){
            let dust_coin = coin::split(&mut raised_coin, dust, ctx);
            transfer::public_transfer(dust_coin, @team);
        };

        let refund = refund::new_refund(raised_coin, refund_amount_per_ticket);

        dynamic_field::add(&mut campaign.id, REFUND_DFIELD_NAME, refund);
    }

    public(friend) fun add_raised_funds(campaign: &mut Campaign, prize: Coin<SUI>, ctx: &mut TxContext): Coin<SUI>{
            let cf = option::borrow(&campaign.crowdfunding);
            let keep_rate = crowdfunding::keep_rate_bps(cf);
            let keep = (coin::value(&prize) * keep_rate) / BPS_MAX;

            let cf_coin = coin::split(&mut prize, keep, ctx);
            crowdfunding::add_funds(option::borrow_mut(&mut campaign.crowdfunding), cf_coin);
            prize
    }

    public(friend) fun refund_mut(campaign: &mut Campaign): &mut Refund {
        dynamic_field::borrow_mut(&mut campaign.id, REFUND_DFIELD_NAME)
    }

    public(friend) fun crowdfunding_mut(campaign: &mut Campaign): &mut CrowdFunding {
        option::borrow_mut(&mut campaign.crowdfunding)
    }


    // ----- View functions
    public fun get_total_tickets(campaign: &Campaign): u64 {
        campaign.total_tickets
    }

    public fun get_latest_lottery(campaign: &Campaign): Option<ID> {
        campaign.latest_lotery
    }

    public fun has_active_lottery(campaign: &Campaign): bool {
        option::is_some(&campaign.latest_lotery)
    }

    public fun is_cf_campaign(campaign: &Campaign): bool {
        option::is_some(&campaign.crowdfunding)
    }

}