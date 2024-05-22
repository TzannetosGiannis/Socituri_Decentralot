module decentralot::incentive_treasury {
    use sui::sui::SUI;
    use sui::event;
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use std::option::{Self, Option};

    use decentralot::config::{Self, Config, AdminCap };
    
    friend decentralot::lottery;

    const DEFAULT_MIN_AMOUNT: u64 = 1_000_000000000; // 1000 SUI
    const MAX_AMOUNT: u64 = 100_000_000000000; // 100_000 SUI
    const MIN_AMOUNT: u64 = 100_000000000; // 100 SUI


    // ------ Errors
    const EMinAmountAboveMax: u64 = 1;
    const EMinAmountBelowMin: u64 = 2;
    const ECollectedIncentivesBelowMin: u64 = 3;
    const ENoCampaignToIncentivize: u64 = 4;
    const EWrongCampaign: u64 = 5;

    struct IncentiveTreasury has key, store {
        id: UID,
        bank: Balance<SUI>,
        // Campaign's ID to incentivize next
        campaign_to_incentivize: Option<ID>,
        // Minimum amount of SUI collected to incentivize
        min_amount: u64
    }

    // ----- Events
    struct IncentiveAdded has drop, copy {
        amount: u64
    }

    struct IncentivizedCampaign has drop, copy {
        campaign_id: ID,
        amount: u64
    }

    struct MinAmountUpdated has drop, copy  {
        old_min_amount: u64,
        new_min_amount: u64
    }

    struct NextCampaignSet has drop, copy  {
        previous_campaign_id: ID,
        next_campaign_id: ID
    }

    fun init(ctx: &mut TxContext){
        let incentive_treasury = IncentiveTreasury{
            id: object::new(ctx),
            bank: balance::zero(),
            campaign_to_incentivize: option::none(),
            min_amount: DEFAULT_MIN_AMOUNT
        };

        transfer::share_object(incentive_treasury);
    }

    public(friend) fun pull_incentives(incentives: &mut IncentiveTreasury, campaign_id: ID, ctx: &mut TxContext) : Coin<SUI> {
        let amount = balance::value(&incentives.bank);
        assert!(amount > incentives.min_amount, ECollectedIncentivesBelowMin);
        assert!(option::is_some(&incentives.campaign_to_incentivize), ENoCampaignToIncentivize);
        assert!(*option::borrow(&incentives.campaign_to_incentivize) == campaign_id, EWrongCampaign);

        event::emit(IncentivizedCampaign{
            campaign_id: campaign_id,
            amount: amount
        });
        
        coin::take(&mut incentives.bank, amount, ctx)

    }

    public fun push_incentives(cfg: &Config, incentives: &mut IncentiveTreasury, incentive: Coin<SUI>){
        config::assert_version(cfg);
        let added_value = coin::value(&incentive);
        balance::join(&mut incentives.bank, coin::into_balance(incentive));

        event::emit(IncentiveAdded{
            amount: added_value
        });
    }


    public fun set_min_amount(_: &AdminCap, cfg: &Config, incentives: &mut IncentiveTreasury, min_amount: u64){
        config::assert_version(cfg);
        assert!(min_amount <= MAX_AMOUNT, EMinAmountAboveMax);
        assert!(min_amount >= MIN_AMOUNT, EMinAmountBelowMin);
        let old_min_amount = incentives.min_amount;
        incentives.min_amount = min_amount;

        event::emit(MinAmountUpdated{
            old_min_amount: old_min_amount,
            new_min_amount: min_amount
        });
    }

    public fun set_next_campaign_id(_: &AdminCap, cfg: &Config, incentives: &mut IncentiveTreasury, campaign_id: ID){
        config::assert_version(cfg);
        let old_campaign_id = *option::borrow(&incentives.campaign_to_incentivize);
        incentives.campaign_to_incentivize = option::some(campaign_id);

        event::emit(NextCampaignSet{
            previous_campaign_id: old_campaign_id,
            next_campaign_id: campaign_id
        });
    }
}