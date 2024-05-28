module decentralot::crowdfunding {
    use sui::sui::SUI;
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use std::string::String;

    friend decentralot::lottery;

    const MAX_FEE_RATE_BPS: u64 = 3_000; // 30%
    const MAX_DEADLINE: u64 = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in ms

    // ---- Errors
    const EFeeRateAboveMax: u64 = 1;
    const EDeadlineAboveMax: u64 = 2;
    const EFundingGoalReached: u64 = 3;
    const EFundingGoalNotReached: u64 = 4;
    const ENotYetExpired: u64 = 5;
    const EInvalidCFParam: u64 = 6;
    

    struct CrowdFunding has store {
        goal: u64,
        deadline: u64,
        beneficiary: address,
        fee_rate_bps: u64,
        project_url: String,
        raised: Balance<SUI>
    }

    public(friend) fun new_crowdfunding(goal: u64, deadline: u64, beneficiary: address, fee_rate_bps: u64, project_url: String, clock: &Clock): CrowdFunding {
        assert!(goal > 0, EInvalidCFParam);
        assert!(deadline > 0, EInvalidCFParam);
        assert!(fee_rate_bps > 0, EInvalidCFParam);
        assert!(deadline <= clock::timestamp_ms(clock) + MAX_DEADLINE, EDeadlineAboveMax);
        assert!(fee_rate_bps <= MAX_FEE_RATE_BPS, EFeeRateAboveMax);
        CrowdFunding {
            goal,
            deadline,
            beneficiary,
            fee_rate_bps,
            project_url,
            raised: balance::zero()
        }
    }

    public(friend) fun close_successful(self: &mut CrowdFunding, ctx: &mut TxContext): Coin<SUI> {
        let raised = balance::value(&self.raised);
        assert!(raised >= self.goal, EFundingGoalNotReached);
        coin::take(&mut self.raised, raised, ctx)
    }

    public(friend) fun close_unsuccessful(self: &mut CrowdFunding, clock: &Clock, ctx: &mut TxContext): Coin<SUI> {
        let raised = balance::value(&self.raised);
        assert!(raised < self.goal, EFundingGoalReached);
        assert!(clock::timestamp_ms(clock) > self.deadline, ENotYetExpired);

        coin::take(&mut self.raised, raised, ctx)
    }

    public(friend) fun add_funds(self: &mut CrowdFunding, input_coin: Coin<SUI>){
        balance::join(&mut self.raised, coin::into_balance(input_coin));
    }

    // ---- View functions
    public fun get_goal(self: &CrowdFunding): u64 {
        self.goal
    }

    public fun deadline(self: &CrowdFunding): u64 {
        self.deadline
    }

    public fun beneficiary(self: &CrowdFunding): address {
        self.beneficiary
    }

    public fun keep_rate_bps(self: &CrowdFunding): u64 {
        self.fee_rate_bps
    }

    public fun raised(self: &CrowdFunding): u64 {
        balance::value(&self.raised)
    }

    public fun goal_reached(self: &CrowdFunding): bool {
        balance::value(&self.raised) >= self.goal
    }

    public fun project_url(self: &CrowdFunding): String {
        self.project_url
    }

    public fun need_till_goal(self: &CrowdFunding): u64 {
        let raised = balance::value(&self.raised);
        if (raised >= self.goal) {
            0
        } else {
            self.goal - raised
        }
    }

}