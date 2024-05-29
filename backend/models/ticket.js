const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    campaignId: {
        type: String,
        required: true
    },
    lotteryId: {
        type: String,
        required: true
    },
    ticketId: {
        type: String,
        required: true
    },
    round: {
        type: Number,
        required:true
    },
    number: {
        type: Number,
        required:true
    }
    
});

const ticket = mongoose.model('tickets', ticketSchema);

module.exports = ticket;