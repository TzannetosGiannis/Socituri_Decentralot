const express = require('express');
const tickets = require('../models/ticket');

const router = express.Router();

async function get_all_tickets(req,res,next) {
    let allCamps = await tickets.find().select('-__v -_id');
    return res.json(allCamps);
}


router.get('/fetch_all',get_all_tickets);

module.exports = router;