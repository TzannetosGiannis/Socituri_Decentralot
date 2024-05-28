const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    campaignId: {
        type: String,
        required: true,
        uniques: true
    },
    previousLotteries: {
        type: Array,
        default: []
    },
    isCrowdFunding: {
        type: Boolean,
        required:true
    },
    information: {
        type : Object
    }
    
});

const campaign = mongoose.model('campaigns', campaignSchema);

module.exports = scenario;


// campaignID: {
//     previousLotteries: [
//         {
//             round: 1,
//             price: 1000,
//             winning_ticket: 123,
//             claimed: false
//         },
//         {
//             round: 2,
//             price: 1000,
//             winning_ticket: 123,
//             claimed: false
//         },
//     ]
// }