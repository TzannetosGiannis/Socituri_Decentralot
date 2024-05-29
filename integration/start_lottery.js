import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";
import { getSigner } from "./helpers/getSigner.js";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import dotenv from "dotenv";
import { suiClient } from "./clients.js";

dotenv.config();

const main = () => {
  const signer = getSigner();

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${process.env.PACKAGE_ID}::lottery::new_round`,
    arguments: [
      tx.object(process.env.CONFIG),
      tx.object(process.env.CAMPAIGN_ID),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });

  suiClient
    .signAndExecuteTransactionBlock({
      signer,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showType: true,
      },
      requestType: "WaitForLocalExecution",
    })
    .then((resp) => {
      console.log(resp.effects);
    })
    .catch((err) => {
      console.log(err);
    });
};

main();
