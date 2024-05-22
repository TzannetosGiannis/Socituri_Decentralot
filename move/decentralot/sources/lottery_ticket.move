module decentralot::lottery_ticket {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;


    friend decentralot::lottery;
    
    struct LotteryTicket has key, store {
        id: UID,
        campaign: ID,
        ticket_number: u64,
        lottery_round: u64,
    }

    public(friend) fun new_ticket(campaign: ID, ticket_number: u64, lottery_round: u64, ctx: &mut TxContext): LotteryTicket {
        LotteryTicket{
            id: object::new(ctx),
            campaign,
            ticket_number,
            lottery_round,
        }
    }

    public fun is_winning_ticket(ticket: &LotteryTicket, campaign: ID, number: u64, round: u64): bool {
        ticket.ticket_number == number && ticket.lottery_round == round && ticket.campaign == campaign
    }

    public fun is_refund_eligible(ticket: &LotteryTicket, campaign: ID): bool {
        ticket.campaign == campaign
    }

    public(friend) fun burn(ticket: LotteryTicket) {
        let LotteryTicket {id, campaign: _, ticket_number: _, lottery_round: _} = ticket;
        object::delete(id);
    }

}