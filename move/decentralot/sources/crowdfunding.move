module decentralot::crowdfunding {
    use sui::sui::SUI;
    use sui::event::{Self};
    use sui::transfer;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::coin::{Self, Coin};

    const MAX_FEE_RATE_BPS: u64 = 3_000; // 30%
    const MAX_DEADLINE: u64 = 6 * 30 * 24 * 60 * 60; // 6 months

    // ---- Errors
    const EFeeRateAboveMax: u64 = 1;
    const EDeadlineAboveMax: u64 = 2;
    const EFundingGoalReached: u64 = 3;
    const EFundingGoalNotReached: u64 = 4;
    const ENotYetExpired: u64 = 5;
    

    struct CrowdFunding has store {
        goal: u64,
        deadline: u64,
        beneficiary: address,
        fee_rate_bps: u64,
        raised: Balance<SUI>
    }

    public(friend) fun new_crowdfunding(goal: u64, deadline: u64, beneficiary: address, fee_rate_bps: u64): CrowdFunding {
        assert!(deadline <= MAX_DEADLINE, EDeadlineAboveMax);
        assert!(fee_rate_bps <= MAX_FEE_RATE_BPS, EFeeRateAboveMax);
        CrowdFunding {
            goal: goal,
            deadline: deadline,
            beneficiary: beneficiary,
            fee_rate_bps: fee_rate_bps,
            raised: balance::zero()
        }
    }

    public(friend) fun close_successful(self: &mut CrowdFunding, ctx: &mut TxContext) {
        let raised = balance::value(&self.raised);
        assert!(raised >= self.goal, EFundingGoalNotReached);
        let coin_raised = coin::take(&mut self.raised, raised, ctx);
        transfer::public_transfer(coin_raised, self.beneficiary);
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

    public fun fee_rate_bps(self: &CrowdFunding): u64 {
        self.fee_rate_bps
    }

    public fun raised(self: &CrowdFunding): u64 {
        balance::value(&self.raised)
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