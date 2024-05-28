// [TODO] understand if we need to find the new campaigns from events 
// [TODO] or create them when they finish
const campaings = require('../models/campaign');

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


module.exports.lottery_finished = lottery_finished;
module.exports.campaign_started = campaign_started;
module.exports.lottery_claimed = lottery_claimed;