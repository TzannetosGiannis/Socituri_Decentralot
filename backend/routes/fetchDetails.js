const express = require('express');
const campaigns = require('../models/campaign');

const router = express.Router();

async function get_all_campaigns(req,res,next) {
    let allCamps = await campaigns.find().select('-__v -_id');
    return res.json(allCamps);
}


router.get('/fetch_all',get_all_campaigns);

module.exports = router;