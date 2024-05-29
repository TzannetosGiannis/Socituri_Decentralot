import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";
import { getSigner } from "./helpers/getSigner.js";
import { suiClient } from "./clients.js";
import dotenv from "dotenv";

dotenv.config();

const main = () => {

  const signer = getSigner();

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${process.env.PACKAGE_ID}::lottery::new_campaign`,
    arguments: [
      tx.object(process.env.ADMIN_CAP),
      tx.object(process.env.CONFIG),
      tx.pure("1000"),
      tx.pure("100000000000000"),
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
