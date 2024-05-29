import { suiClient } from "./clients.js";
import dotenv from "dotenv";

dotenv.config();

const EPOCH_INTERVAL = 604_800_000;

export const getEpochConfigNFT = async () => {
  const previousEpoch = Math.floor(Date.now() / EPOCH_INTERVAL) - 1;

  const epochConfigsTable = await suiClient
    .getObject({
      id: process.env.FEE_DISTRIBUTION,
      options: {
        showContent: true,
        showType: true,
        showDisplay: true,
      },
    })
    .then((resp) => {
      return resp.data.content.fields.config_per_epoch.fields.id.id;
    });

  return suiClient
    .getDynamicFieldObject({
      parentId: epochConfigsTable,
      name: { type: "u64", value: `${previousEpoch}` },
    })
    .then((resp) => {
      const data = resp.data.content.fields.value.fields;
      console.log(data);
      const formatted = {
        pricePerTicket: Number(data.price_per_ticket),
        remainingTickets: Number(data.remaining_tickets),
        totalTickets: Number(data.total_tickets),
      };
      return formatted;
    });
};

getEpochConfigNFT();
