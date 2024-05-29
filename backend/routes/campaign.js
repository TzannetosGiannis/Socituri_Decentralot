const express = require('express');
const campaigns = require('../models/campaign');

const router = express.Router();

async function get_all_campaigns(req,res,next) {
    let allCamps = await campaigns.find().select('-__v -_id');
    return res.json(allCamps);
}


async function fetch_campaign(req,res,next) {
    
    let requestId = req.params.campaignId;
    // identify query based on user input
    let specificQuery = requestId == 'main' ? {isCrowdFunding:false} : {isCrowdFunding:true,campaignId:requestId};

    let mainCampaign = await campaigns.findOne(specificQuery).select('-__v -_id');
    let campaign_id = mainCampaign.campaignId;
    let current_lottery_id;
    let toBeDeleted;

    // identify current lottery for main page
    for(let i = 0; i < mainCampaign.previousLotteries.length; i++) {
        if ( mainCampaign.previousLotteries[i].winning_ticket == -1 ) {
            toBeDeleted = i;
            current_lottery_id = mainCampaign.previousLotteries[i].lottery_id;
            break;
        }  
    }
    // send only the previous lotteries
    let previousLotteries =  mainCampaign.previousLotteries.filter((_, i) => i !== toBeDeleted);
    return res.send({campaign_id,current_lottery_id,previousLotteries});

}


async function crowdfunding_campaigns(req,res,next) {
  let crowd_campaigns = await campaigns.find({isCrowdFunding:true}).select('-__v -_id');

  let resultList = [];
  for (let j = 0; j < crowd_campaigns.length; j++) {
    let campaign_id = crowd_campaigns[j].campaignId;
    resultList.push({
        campaign_id,
        information:crowd_campaigns[j].information
    })
  }

  return res.send(resultList);
}


router.get('/fetch_all',get_all_campaigns);
router.get('/crowdfunding',crowdfunding_campaigns);
router.get('/:campaignId',fetch_campaign);


module.exports = router;