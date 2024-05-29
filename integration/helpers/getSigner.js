import { fromB64 } from "@mysten/sui.js/utils";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

export const getSigner = (secretKey = "AFypeg5PRbTSPkr8OrdB6etUaskUaXUqkJFEYJpVYZzD") => {
  let privKeyArray = Uint8Array.from(Array.from(fromB64(secretKey)));
  const keypair = Ed25519Keypair.fromSecretKey(
    Uint8Array.from(privKeyArray).slice(1)
  );
  return keypair;
};
