const {fromB64} = require('@mysten/sui.js/utils')
const { Ed25519Keypair } = require("@mysten/sui.js/keypairs/ed25519");
const { SUI_CLOCK_OBJECT_ID } =  require("@mysten/sui.js/utils");
const { TransactionBlock } = require("@mysten/sui.js/transactions");
const { SuiClient,getFullnodeUrl } = require("@mysten/sui.js/client");

const campaigns = require('../models/campaign');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getSigner = (secretKey = "AFypeg5PRbTSPkr8OrdB6etUaskUaXUqkJFEYJpVYZzD") => {
  let privKeyArray = Uint8Array.from(Array.from(fromB64(secretKey)));
  const keypair = Ed25519Keypair.fromSecretKey(
    Uint8Array.from(privKeyArray).slice(1)
  );
  return keypair;
};

const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet')
});
  
async function submit_tx(tx) {
    const signer = getSigner();
    const executionResult = await suiClient
    .signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showType: true,
      },
      requestType: "WaitForLocalExecution",
    });

    // console.log(executionResult);
}

async function __end__lottery(campaign_id,lottery_id) {
    
    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${process.env.package_id}::lottery::end_lottery`,
        arguments: [
        tx.object(process.env.CONFIG),
        tx.object(campaign_id),
        tx.object(lottery_id),
        tx.object(process.env.FEE_DISTRIBUTION),
        tx.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    await submit_tx(tx);
   
}

async function __start__lottery(campaign_id) {
    
    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${process.env.package_id}::lottery::new_round`,
        arguments: [
          tx.object(process.env.CONFIG),
          tx.object(campaign_id),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });

    await submit_tx(tx);
   
}

async function endLottery() {
    
    while (true) {
        const camps = await campaigns.find({isCrowdFunding:false});

        for(let i = 0; i < camps.length; i++ ) {
            for (let j = 0; j < camps[i].previousLotteries.length; j++) {
                if(camps[i].previousLotteries[j].winning_ticket == -1 ) {
                    try {
                        await __end__lottery(camps[i].campaignId,camps[i].previousLotteries[j].lottery_id)
                    } catch (e) {
                        console.log('lottery id =>',camps[i].previousLotteries[j].lottery_id,' failed to finish')
                        if(e.message.includes('Some("end_lottery_no_random") }, 7)')) {
                            console.log('reason => already finished');
                        }
                    }
                    break;
                }
            }
        }
        await sleep(20 * 60 * 1000);
    }
}

async function startLottery(objectId) {
    while (true) {
        const camps = await campaigns.find({isCrowdFunding:false});

        for(let i = 0; i < camps.length; i++ ) {
            try {
                await __start__lottery(camps[i].campaignId);
            } catch (e) {
                console.log('campaign id =>',camps[i].campaignId,' failed to start')
                // if(e.message.includes('Some("end_lottery_no_random") }, 7)')) {
                //     console.log('reason => already finished');
                // }
                console.log(e);
            }
        }
        await sleep(20 * 60 * 1000);
    }
}


async function newRoundLottery() {
    
    while (true) {
        const camps = await campaigns.find({isCrowdFunding:false});

        for(let i = 0; i < camps.length; i++ ) {
            for (let j = 0; j < camps[i].previousLotteries.length; j++) {
                if(camps[i].previousLotteries[j].winning_ticket == -1 ) {
                    try {
                        await __end__lottery(camps[i].campaignId,camps[i].previousLotteries[j].lottery_id)
                        
                    } catch (e) {
                        console.log(e);
                    }

                    try {
                        await __start__lottery(camps[i].campaignId);
                        
                    } catch (e) {
                        console.log(e);
                    }
                    
                    break;
                }
            }
        }
        await sleep(3 * 60 * 1000);
    }
}

async function startLottery(objectId) {
    while (true) {
        const camps = await campaigns.find({isCrowdFunding:false});

        for(let i = 0; i < camps.length; i++ ) {
            try {
                await __start__lottery(camps[i].campaignId);
            } catch (e) {
                console.log('campaign id =>',camps[i].campaignId,' failed to start')
                // if(e.message.includes('Some("end_lottery_no_random") }, 7)')) {
                //     console.log('reason => already finished');
                // }
                console.log(e);
            }
        }
        await sleep(20 * 60 * 1000);
    }
}

module.exports.endLottery = endLottery;
module.exports.startLottery = startLottery;
module.exports.newRoundLottery = newRoundLottery;