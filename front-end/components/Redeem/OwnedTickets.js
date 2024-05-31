import {
    useCurrentAccount,
    useSignAndExecuteTransactionBlock,
    useSuiClient,
  } from "@mysten/dapp-kit";
  import { SUI_CLOCK_OBJECT_ID, formatAddress } from "@mysten/sui.js/utils";
  import { TransactionBlock } from "@mysten/sui.js/transactions";
  import React, { useEffect, useState } from "react";
  
  export const OwnedTickets = () => {
    const suiClient = useSuiClient();
    const currentAccount = useCurrentAccount();
    const [ownedTickets, setOwnedTickets] = useState([]);
    const { mutateAsync: signAndExecuteTransactionBlock } =
      useSignAndExecuteTransactionBlock();
  
    useEffect(() => {
      if (!currentAccount?.address) {
        setOwnedTickets([]);
        return;
      }
      suiClient
        .getOwnedObjects({
          owner: currentAccount?.address,
          filter: {
            StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::fee_distribution::FeeDistributionTicket`,
          },
          options: {
            showContent: true,
          },
        })
        .then((resp) => {
          console.log(resp);
          setOwnedTickets(
            resp.data.map(({ data }) => {
              const fields = data.content.fields;
              return {
                id: fields.id.id,
                amount: fields.amount,
                redeemEpoch: fields.redeem_epoch,
              };
            })
          );
          // keep only the fields that you need
        })
        .catch((err) => {
          console.log(err);
        });
    }, [currentAccount?.address, suiClient]);
  
    const handleRedeemTicket = (ticketId) => {
      const tx = new TransactionBlock();
  
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::fee_distribution::redeem_ticket`,
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_CONFIG_ID),
          tx.object(process.env.NEXT_PUBLIC_FEE_DISTRIBUTION),
          tx.object(ticketId),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
  
      signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
        },
        requestType: "WaitForLocalExecution",
      })
        .then((resp) => {
          if (resp.effects.status.status === "success") {
            console.log("Bought ticket successfully");
            // bad practice to reload the page, but it's the easiest way to update the UI
            window.location.reload();
          }
          // if the status != success, throw an error, so that we handle the error only in one place, the catch block
        })
        .catch((err) => {
          console.log("Error redeeming ticket...");
          console.log(err);
        });
    };
  
    return (
      <div className="text-white flex flex-col gap-y-[32px] items-center">
        <h1 className="text-4xl font-bold text-center">Owned Tickets</h1>
        {!ownedTickets.length && <div>No tickets owned</div>}
        <div className="flex flex-wrap gap-[12px]">
          {ownedTickets.map((ticket, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden w-72"
            >
              <img
                src="/assets/logo.webp"
                alt="NFT"
                className="w-full h-[200px] object-cover"
              />
              <div className="p-4 text-gray-800">
                <div className="text-center mb-2">
                  <p className="text-lg font-semibold">Ticket ID:</p>
                  <p className="text-sm text-gray-600">
                    {formatAddress(ticket.id)}
                  </p>
                </div>
                <div className="text-center mb-4">
                  <p className="text-lg font-semibold">Amount:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {ticket.amount}
                  </p>
                </div>
                <button
                  onClick={() => handleRedeemTicket(ticket.id)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Redeem Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };