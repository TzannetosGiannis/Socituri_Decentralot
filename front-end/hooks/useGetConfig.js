import { useSuiClient } from "@mysten/dapp-kit";
import React, { useEffect, useState } from "react";

export const useGetConfig = () => {
  const suiClient = useSuiClient();
  const [bps, setBps] = useState(null);

  useEffect(() => {
    suiClient
      .getObject({
        id: process.env.NEXT_PUBLIC_CONFIG_ID,
        options: {
          showContent: true,
        },
      })
      .then((resp) => {
        console.log(resp.data);
        setBps(resp.data.content.fields.protocol_fee_bps);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [suiClient]);

  return {
    bps,
  };
};
