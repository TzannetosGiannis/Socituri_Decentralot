const {getFullnodeUrl, SuiClient ,SuiHTTPTransport} = require('@mysten/sui.js/client');
const WebSocket = require('ws')
const {buy_ticket,new_campaign,new_lottery,lottery_finished} = require('./handle_events');

// use getFullnodeUrl to define Devnet RPC location
const rpcUrl = getFullnodeUrl('testnet');

const client = new SuiClient({
	transport: new SuiHTTPTransport({
		url: rpcUrl,
		// The typescript definitions may not match perfectly, casting to never avoids these minor incompatibilities
		WebSocketConstructor: WebSocket,
	}),
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function connectSUI() {
    while (true) {
        try {
            console.log(process.env.package_id,rpcUrl);
            
            const unsubscribe = await client.subscribeEvent({
                filter: { Package:process.env.package_id },
                onMessage: async (event) => {
                    console.log("subscribeEvent", JSON.stringify(event, null, 2))
                    const eventType = event.type;
                    
                    // handle buyTicket
                    if(eventType.endsWith("::lottery::TicketBought")) {
                        await buy_ticket(event);
                    }

                    // handle the creation of a new campaign
                    if(eventType.endsWith("::lottery::NewCampaign")) {
                        await new_campaign(event);
                    }

                    // handle new lottery generation with respect to a campaign
                    if(eventType.endsWith("::lottery::NewLottery")) {
                        await new_lottery(event);
                    }

                    // handle lottery finished
                    if(eventType.endsWith("::lottery::LotteryEnded")) {
                        await lottery_finished(event);
                    }


                    // handle campaignh started

                    // handle winner claimed
                }
            });
            break;
        } catch (e) {
            console.log('connection failed');
            await sleep(3000);
        }
    }
    console.log('connected to SUI');
}


module.exports = connectSUI;


