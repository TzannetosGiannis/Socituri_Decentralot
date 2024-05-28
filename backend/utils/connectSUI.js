const {getFullnodeUrl, SuiClient ,SuiHTTPTransport} = require('@mysten/sui.js/client');
const WebSocket = require('ws')
// use getFullnodeUrl to define Devnet RPC location
const rpcUrl = getFullnodeUrl('testnet');

const client = new SuiClient({
	transport: new SuiHTTPTransport({
		url: rpcUrl,
		// The typescript definitions may not match perfectly, casting to never avoids these minor incompatibilities
		WebSocketConstructor: WebSocket,
	}),
});

async function connectSUI() {
    const unsubscribe = await client.subscribeEvent({
        filter: { Package:process.env.package_id },
        onMessage: (event) => {
            console.log("subscribeEvent", JSON.stringify(event, null, 2))

            if(false) {
                // handle lottery finished

                // handle campaignh started

                // handle winner claimed
            }
        }
    });
    console.log('connected to SUI');
}


module.exports = connectSUI;

