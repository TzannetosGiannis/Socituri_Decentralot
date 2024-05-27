import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import React, { useCallback, useEffect, useState } from "react";

export const useGetMyInformationForLottery = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [ownedTickets, setOwnedTickets] = useState([]);

  const fetchOwnedTickets = useCallback(() => {
    suiClient
      .getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::lottery_ticket::LotteryTicket`,
        },
        options: {
            showContent: true,
        }
      })
      .then((resp) => {
        console.log("owned tickets:");
        console.log(resp.data);
        // we can filter the fields that we need
        setOwnedTickets(resp.data);
      })
      .catch((err) => {});
  }, [currentAccount, suiClient]);

  useEffect(() => {
    if (currentAccount?.address) {
      fetchOwnedTickets();
    }
  }, [currentAccount]);

  return {
    ownedTickets,
    fetchOwnedTickets,
  };
};
