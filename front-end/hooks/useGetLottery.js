import { useSuiClient } from "@mysten/dapp-kit";
import React, { useCallback, useEffect, useState } from "react";

export const useGetLottery = (lotteryId) => {
  const suiClient = useSuiClient();
  const [lottery, setLottery] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLottery = useCallback(() => {
    setIsLoading(true);
    suiClient
      .getObject({
        id: lotteryId,
        options: {
          showContent: true,
        },
      })
      .then((resp) => {
        console.log(resp.data);
        const fields = resp.data.content.fields;
        const lottery = {
          endDate: fields.end_date,
          bank: fields.bank,
          ticketPrice: fields.ticket_price,
          round: fields.round,
          total_rounds: fields.total_rounds,
        };
        setLottery(lottery);
        setIsLoading(false);
      })
      .catch((err) => {
        setLottery(null);
        setIsLoading(false);
      });
  }, [lotteryId]);

  useEffect(() => {
    if (!lotteryId) {
      setLottery(null);
      setIsLoading(false);
    } else {
      fetchLottery();
    }
  }, [lotteryId, fetchLottery]);

  return {
    lottery,
    isLoading,
    fetchLottery,
  };
};
