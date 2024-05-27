import { SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_CLOCK_OBJECT_ID, fromB64 } from "@mysten/sui.js/utils";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const getSigner = (secretKey) => {
  let privKeyArray = Uint8Array.from(Array.from(fromB64(secretKey)));
  const keypair = Ed25519Keypair.fromSecretKey(
    Uint8Array.from(privKeyArray).slice(1)
  );
  return keypair;
};

const SECRET_KEY = "AFypeg5PRbTSPkr8OrdB6etUaskUaXUqkJFEYJpVYZzD";
const PACKAGE_ID =
  "0x9fd30146da4cad83dc0ff03a1cce9e599e901327c0df2877f1f6ac9331901f5e";

const suiClient = new SuiClient({
  url: "https://fullnode.testnet.sui.io:443",
});

const main = () => {
  console.log("Hello World");
  const signer = getSigner(SECRET_KEY);

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::lottery::new_campaign`,
    arguments: [
      tx.object(
        "0x4a9dd3e71ce7c81ec8d36a80c0746007db330b8fee61c40532b9d484e1acb668"
      ),
      tx.object(
        "0x8803d061208d8ba2dd3cc4f61a2919b5583affa6d92abb19ffe952683d3153a6"
      ),
      tx.pure("10000"),
      tx.pure("10000000"),
      tx.pure(SUI_CLOCK_OBJECT_ID),
    ],
  });

  suiClient
    .signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showType: true,
      },
    })
    .then((resp) => {
      //   console.log(resp.effects);
      const createdObjects = resp.objectChanges.filter(
        ({ type }) => type === "created"
      );
      const campaign = createdObjects.find(({ objectType }) =>
        objectType.endsWith("::lottery::Campaign")
      );
      const lottery = createdObjects.find(({ objectType }) =>
        objectType.endsWith("::lottery::Lottery")
      );
      console.log("Campaign ID: ", campaign.objectId);
      console.log("Lottery ID: ", lottery.objectId);
    });
};

main();
