module decentralot::fee_distribution {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;

    friend decentralot::lottery;

    struct State has store {
        balance: Balance<SUI>
    }

    public(friend) fun new_state(): State {
        State {
            balance: balance::zero()
        }
    }

    public(friend) fun add_funds(state: &mut State, input_coin: Coin<SUI>){
        balance::join(&mut state.balance, coin::into_balance(input_coin));
    }
}