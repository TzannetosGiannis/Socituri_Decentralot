import { SuiClient } from "@mysten/sui.js/client";
import dotenv from "dotenv";

dotenv.config();

export const suiClient = new SuiClient({
  url: process.env.SUI_NETWORK,
});
