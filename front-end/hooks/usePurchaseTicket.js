import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useState } from "react";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";

export const usePurchaseTicket = (lotteryId) => {
  const { mutateAsync: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = ({ ticketPrice, amount, onSuccess }) => {

    console.log({ ticketPrice, amount});
    const tx = new TransactionBlock();

    const coin = tx.splitCoins(tx.gas, [amount * ticketPrice]);

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::lottery::buy_ticket`,
      arguments: [
        tx.object(process.env.NEXT_PUBLIC_CONFIG_ID),
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
