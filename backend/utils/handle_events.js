// [TODO] understand if we need to find the new campaigns from events 
// [TODO] or create them when they finish
const campaings = require('../models/campaign');
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

    let n_camp = new campaings(newMongoObj);
    await n_camp.save();
    console.log({action:'new_campaign',campaign:event.parsedJson.id})
}

async function new_lottery(event) {
    // identify the campaign
    const campaignId = event.parsedJson.campaign;
    const specificCampaign = await campaings.findOne({campaignId});
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

    const campaign = await campaings.findOne({
        previousLotteries: {
            $elemMatch: { lottery_id: event.parsedJson.id }
        }
    });

    for(let i = 0; i < campaign.previousLotteries.length; i++) {
        if (campaign.previousLotteries[i].lottery_id == event.parsedJson.id) {
            campaign.previousLotteries[i].prize = event.parsedJson.raised;
            campaign.previousLotteries[i].winning_ticket = event.parsedJson.winner;   
            campaign.previousLotteries[i].protocol_fee = event.parsedJson.protocol_fee;   
            break;
        }
    }
    
   await campaign.save();
   console.log({action:'lottery_ended',lottery_id:event.parsedJson.id,winner:event.parsedJson.winner });

}


async function campaign_started(event) {
 // create a new entry in the indexed database that represents this action   
}

async function lottery_claimed(event) {
    // identify the campaign we are refering to

    // identify round that settled 

    // modify it in the database

}


module.exports.buy_ticket = buy_ticket;
module.exports.new_campaign = new_campaign;
module.exports.new_lottery = new_lottery;
module.exports.lottery_finished = lottery_finished;
module.exports.campaign_started = campaign_started;
module.exports.lottery_claimed = lottery_claimed;