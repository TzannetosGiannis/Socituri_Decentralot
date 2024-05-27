import { MIST_PER_SUI, SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import React, { useState } from "react";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";

const PACKAGE_ID =
  "0x9fd30146da4cad83dc0ff03a1cce9e599e901327c0df2877f1f6ac9331901f5e";

export const usePurchaseTicket = (lotteryId) => {
  const { mutateAsync: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = ({ ticketPrice, amount, onSuccess }) => {

    console.log({ ticketPrice, amount});
    const tx = new TransactionBlock();

    const coin = tx.splitCoins(tx.gas, [amount * ticketPrice]);

    tx.moveCall({
      target: `${PACKAGE_ID}::lottery::buy_ticket`,
      arguments: [
        tx.object(
          "0x8803d061208d8ba2dd3cc4f61a2919b5583affa6d92abb19ffe952683d3153a6"
        ),
        tx.object(lotteryId),
        coin,
        tx.pure(amount),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEffects: true,
      },
    })
      .then((resp) => {
        console.log(resp);
        !!onSuccess && onSuccess();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return {
    isLoading,
    handlePurchase,
  };
};
