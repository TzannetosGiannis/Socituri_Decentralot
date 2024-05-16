module decentralot::refund {
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

    friend decentralot::router;
    friend decentralot::campaign;

    const ENotEligible: u64 = 0;

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
    
    public fun amount_per_ticket(refund: &mut Refund): u64 {
        refund.amount_per_ticket
    }

    public fun funds_left(refund: &Refund): u64 {
        balance::value(&refund.bank)
    }
}