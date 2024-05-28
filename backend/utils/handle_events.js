// [TODO] understand if we need to find the new campaigns from events 
// [TODO] or create them when they finish
const campaings = require('../models/campaign');


function buy_ticket(event) {
    console.log({user:event.sender,action:'buy_ticket',ticket_id:event.parsedJson.ticket_id})
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
    console.log('new campaign in mongo =>',JSON.stringify(newMongoObj));
}

async function lottery_finished(event) {
    
    // identify the campaign we are refering to

    // construct object of the form

        //         {
        //             round: 1,
        //             price: 1000,
        //             winning_ticket: 123,
        //             claimed: false
        //         },

    // push it to mongo model in previous Lotteries

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
module.exports.lottery_finished = lottery_finished;
module.exports.campaign_started = campaign_started;
module.exports.lottery_claimed = lottery_claimed;