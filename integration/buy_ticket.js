import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";
import { getSigner } from "./helpers/getSigner.js";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import dotenv from "dotenv";
import { suiClient } from "./clients.js";
import { getEpochConfigNFT } from "./getEpochConfigNFT.js";

dotenv.config();

const main = async () => {
  const signer = getSigner();

  const epochConfigNFT = await getEpochConfigNFT();
  if (!epochConfigNFT) {
    console.error("Epoch config NFT not found");
    return;
  }

  const amount = 2;

  const tx = new TransactionBlock();

  const coin = tx.splitCoins(tx.gas, [
    tx.pure(2 * epochConfigNFT.pricePerTicket),
  ]);

  tx.moveCall({
    target: `${process.env.PACKAGE_ID}::fee_distribution::buy_ticket`,
    arguments: [
      tx.object(process.env.CONFIG),
      tx.object(process.env.FEE_DISTRIBUTION),
      tx.pure(amount),
      coin,
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
