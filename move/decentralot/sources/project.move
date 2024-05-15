module decentralot::project {
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

    use decentralot::lottery;
    use decentralot::config::{Config, AdminCap};

    struct Project has key {
        id: UID,
        total_tickets: u64,
        fee_distribution: u64, 
        latest_lotery: Option<ID>,
    }

    public fun new_project(_: &AdminCap, config: &Config, ticket_price: u64, duration: u64,  clock: &Clock, ctx: &mut TxContext){
        let project = Project{
            id: object::new(ctx),
            total_tickets: 0,
            fee_distribution: 0,
            latest_lotery: option::none(),
        };

        let end_date = clock::timestamp_ms(clock) + duration;

        let lot_id = lottery::new_lottery(ticket_price, end_date, object::id(&project), ctx);
        project.latest_lotery = option::some(lot_id);

        transfer::share_object(project);
    }
}