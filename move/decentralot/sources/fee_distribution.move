module decentralot::fee_distribution {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;

    const FIFTY_SUI: u64 = 50_000000000; // 50 SUI
    
    struct FeeDistribution has store {
        total_tickets: u64,
        remaining_tickets: u64,
        price_per_ticket: u64,
    }
    
    struct FeeDistributionTicket has key, store {
        id: UID,
        campaign: ID,
        redeem_round: u64,
        amount: u64
    }

    

    public(friend) fun new_fee_distribution(total_fees: u64): FeeDistribution {
        let total_tickets = total_fees / FIFTY_SUI;
        if (total_tickets < 50) {
            total_tickets = 50
        };

        // @TODO round up
        let price_per_ticket = total_fees / total_tickets;
        
        FeeDistribution {
            total_tickets,
            remaining_tickets: total_tickets,
            price_per_ticket
        }
    }

    // @TODO this is just a mock for now
    public(friend) fun new_fee_ticket(campaing_id: ID, redeem_round: u64, amount: u64, ctx: &mut TxContext): FeeDistributionTicket {
        FeeDistributionTicket {
            id: object::new(ctx),
            campaign: campaing_id,
            redeem_round, 
            amount
        }
    }

}