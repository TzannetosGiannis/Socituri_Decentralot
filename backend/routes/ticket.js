const express = require('express');
const tickets = require('../models/ticket');
const campaigns = require('../models/campaign');

const router = express.Router();

async function get_all_tickets(req,res,next) {
    let allCamps = await tickets.find().select('-__v -_id');
    return res.json(allCamps);
}

async function get_tickets_per_round(req,res,next) {

    let sender = req.params.sender;
    let campaignId = req.params.campaignId;
    let round = req.params.round;

    if( campaignId == 'main' ) {
        campaignId = (await campaigns.findOne({isCrowdFunding:false})).campaignId;
    }

    let ownedTickets = await tickets.find(
        {
            address:sender,
            campaignId,
            round
        }
    ).select('-__v -_id');

    return res.send({
        campaignId,
        ownedTickets,
        round
    });
}

router.get('/fetch_all',get_all_tickets);
router.get('/:sender/:campaignId/:round',get_tickets_per_round);

module.exports = router;