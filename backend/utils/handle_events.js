// [TODO] understand if we need to find the new campaigns from events 
// [TODO] or create them when they finish
const campaigns = require('../models/campaign');
const ticket = require('../models/ticket');
const tickets = require('../models/ticket')


async function buy_ticket(event) {

   
    let ticketObj = {
        address: event.sender,
        campaignId:event.parsedJson.campaign,
        lotteryId:event.parsedJson.lottery,
        ticketId:event.parsedJson.ticket_id,
        round: event.parsedJson.round,
        number: event.parsedJson.number,
    }

    let n_tick = new ticket(ticketObj);
    await n_tick.save()
    // find the correspoding campaign
    console.log({action:'buy_ticket',user:event.sender,ticket_id:event.parsedJson.ticket_id})
}

async function new_campaign(event) {
    // extract the associated id
    const campaign_id = event.parsedJson.id;
    const isCrowdFunding = event.parsedJson.goal == 0 ? false : true;
    const information = {
        ticket_price: event.parsedJson.ticket_price
    };

    const newMongoObj = {
        campaignId:campaign_id,
        isCrowdFunding,
        information
    };

    let n_camp = new campaigns(newMongoObj);
    await n_camp.save();
    console.log({action:'new_campaign',campaign:event.parsedJson.id})
}

async function new_lottery(event) {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    await sleep(5000);
    // identify the campaign
    const campaignId = event.parsedJson.campaign;
    const specificCampaign = await campaigns.findOne({campaignId});
    specificCampaign.previousLotteries.push({
        lottery_id:event.parsedJson.id,
        round: event.parsedJson.round,
        price: specificCampaign.information.ticket_price,
        winning_ticket: -1,
        claimed: false
    });

    await specificCampaign.save();
    console.log({action:'new_lottery',lottery_id:event.parsedJson.id,campaign:event.parsedJson.campaign})

}

async function lottery_finished(event) {

    // identify the campaign from the lottery
    const winning_ticket = await tickets.findOne({
        lotteryId: event.parsedJson.id,
        number: event.parsedJson.winner
    });

    // If the winning ticket is found, get the address
    const winner_address = winning_ticket ? winning_ticket.address : null;
    
    // Update the campaign's previousLotteries array with the new data
    const updateResult = await campaigns.updateOne(
        {
            "previousLotteries.lottery_id": event.parsedJson.id
        },
        {
            $set: {
                "previousLotteries.$.prize": event.parsedJson.raised,
                "previousLotteries.$.winning_ticket": event.parsedJson.winner,
                "previousLotteries.$.protocol_fee": event.parsedJson.protocol_fee,
                "previousLotteries.$.winner_address": winner_address
            }
        }
    );


   console.log({action:'lottery_ended',lottery_id:event.parsedJson.id,winner:event.parsedJson.winner });

}


async function lottery_claimed(event) {

    // Update the campaign's previousLotteries array with the new data
    const updateResult = await campaigns.updateOne(
        {
            "previousLotteries.lottery_id": event.parsedJson.lottery
        },
        {
            $set: {
                "previousLotteries.$.claimed": true
            }
        }
    );
    
    console.log({action:'lottery claimed',lottery:event.parsedJson.lottery,winner:event.parsedJson.winner})
}


module.exports.buy_ticket = buy_ticket;
module.exports.new_campaign = new_campaign;
module.exports.new_lottery = new_lottery;
module.exports.lottery_finished = lottery_finished;
module.exports.lottery_claimed = lottery_claimed;