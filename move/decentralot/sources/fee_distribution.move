module decentralot::fee_distribution {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;

    friend decentralot::lottery;

    const FIFTY_SUI: u64 = 50_000000000; // 50 SUI

    // ----- Errors
    const ENotEnoughTickets: u64 = 1;
    
    
    struct FeeDistribution has store, drop {
        total_tickets: u64,
        remaining_tickets: u64,
        price_per_ticket: u64,
        redeem_reward_per_ticket: u64
    }
    
    struct FeeDistributionTicket has key, store {
        id: UID,
        campaign: ID,
        redeem_round: u64,
        amount: u64
    }
    

    public(friend) fun new_fee_distribution(total_fees: u64, redeem_reward_per_ticket: u64): FeeDistribution {
        // @TODO What if total_tickets == 0?
        let total_tickets = total_fees / FIFTY_SUI;
        if (total_tickets < 50) {
            total_tickets = 50
        };

        let price_per_ticket = ceil_div(total_fees, total_tickets);
        
        FeeDistribution {
            total_tickets,
            remaining_tickets: total_tickets,
            price_per_ticket,
            redeem_reward_per_ticket
        }
    }

    public(friend) fun new_fee_ticket(fee_distribution: &mut FeeDistribution, campaing_id: ID, redeem_round: u64, amount: u64, ctx: &mut TxContext): FeeDistributionTicket {
        assert!(fee_distribution.remaining_tickets >= amount, ENotEnoughTickets);
        fee_distribution.remaining_tickets = fee_distribution.remaining_tickets - amount;
        FeeDistributionTicket {
            id: object::new(ctx),
            campaign: campaing_id,
            redeem_round, 
            amount
        }
    }

    public(friend) fun redeem_fee_ticket(ticket: FeeDistributionTicket): (ID, u64, u64){
        let FeeDistributionTicket {id, campaign, redeem_round, amount} = ticket;
        object::delete(id);
        (campaign, redeem_round, amount)
    }

    // ----- View functions

    public fun fee_distribution_ticket_details(ticket: &FeeDistributionTicket): (ID, u64, u64) {
        (ticket.campaign, ticket.redeem_round, ticket.amount)
    }

    public fun fee_distribution_total_tickets(fd: &FeeDistribution): u64 {
        fd.total_tickets
    }

    public fun fee_distribution_ticket_price(fd: &FeeDistribution): u64 {
        fd.price_per_ticket
    }

    public fun fee_distribution_remaining_tickets(fd: &FeeDistribution): u64 {
        fd.remaining_tickets
    }

    public fun fee_distribution_reward_per_ticket(fd: &FeeDistribution): u64 {
        fd.redeem_reward_per_ticket
    }


    fun ceil_div(x: u64, y: u64): u64 {
        // `y` will never be 0.
        if (x == 0) {
            0
        }
        else (x - 1) / y + 1
    }
}