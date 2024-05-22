module decentralot::refund {
    use sui::sui::SUI;
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};

    friend decentralot::lottery;

    struct Refund has store {
        bank: Balance<SUI>,
        amount_per_ticket: u64,
    }

    public(friend) fun new_refund(refund_coin: Coin<SUI>, amount_per_ticket: u64): Refund {
        Refund {
            bank: coin::into_balance(refund_coin),
            amount_per_ticket,
        }
    }

    public(friend) fun refund(refund: &mut Refund, ctx: &mut TxContext): Coin<SUI> {
        coin::take(&mut refund.bank, refund.amount_per_ticket, ctx)
    }

    // ----- View Functions
    
    public fun amount_per_ticket(refund: &Refund): u64 {
        refund.amount_per_ticket
    }

    public fun funds_left(refund: &Refund): u64 {
        balance::value(&refund.bank)
    }
}