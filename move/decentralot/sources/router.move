module decentralot::router {
    use sui::sui::SUI;
    use sui::event::{Self};
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::coin::{Self, Coin};
    use std::string::{Self, String, utf8};

    use decentralot::lottery::{Lottery, Self};
    use decentralot::config::{Self, Config, AdminCap};
    use decentralot::campaign::{Self, Campaign};
    use decentralot::crowdfunding;
    use decentralot::refund;
    use decentralot::lottery_ticket::{Self, LotteryTicket};

    const BPX_MAX:  u64 = 10_000;

    const EActiveLotteryExists: u64 = 0;
    const EOnlyCFCampaignsCanClose: u64 = 1;
    const ENotRefundEligible: u64 = 2;
    const EWinnerNotDecided: u64 = 3;
    const ENoLotteryWinner: u64 = 4;


    public fun buy_ticket(cfg: &Config, lottery: &mut Lottery, input_coin: Coin<SUI>, amount: u64, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        let start = lottery::buy_ticket(lottery, input_coin, amount, clock, ctx);
        let end = start + amount;
        let campaign = lottery::campaign_id(lottery);
        let round_number = lottery::round(lottery);
        
        while (start < end){
            let ticket = lottery_ticket::new_ticket(campaign, start, round_number, ctx);
            transfer::public_transfer(ticket, tx_context::sender(ctx));
        };

    }

    public fun claim_prize(cfg: &Config, campaign: &mut Campaign, lottery: &mut Lottery, ticket: LotteryTicket, clock: &Clock, ctx: &mut TxContext){
        config::assert_version(cfg);

        assert!(lottery::is_over(lottery), EWinnerNotDecided);
        
        let campaign_id = lottery::campaign_id(lottery);

        assert!(object::id(campaign) == campaign_id, 5);

        let round_number = lottery::round(lottery);
        let winner = lottery::winner(lottery);

        assert!(lottery_ticket::is_winning_ticket(&ticket, campaign_id, winner, round_number), ENoLotteryWinner);

        let protocol_fee = config::protocol_fee_bps(cfg);

        let (prize, incentives) = lottery::claim_prize(lottery, protocol_fee, ctx);

        
        if (campaign::is_cf_campaign(campaign)){
            prize = campaign::add_raised_funds(campaign, prize, ctx);
        };

        lottery_ticket::burn(ticket, ctx);

        coin::join(&mut prize, incentives);
        transfer::public_transfer(prize, tx_context::sender(ctx));



    }

    public fun refund(cfg: &Config, campaign: &mut Campaign, ticket: LotteryTicket, ctx: &mut TxContext){
        config::assert_version(cfg);
        
        assert!(lottery_ticket::is_refund_eligible(&ticket, object::id(campaign)), ENotRefundEligible);
        
        let reimburshment = refund::refund(campaign::refund_mut(campaign), ctx);
        lottery_ticket::burn(ticket, ctx);

        transfer::public_transfer(reimburshment, tx_context::sender(ctx));
    }




}