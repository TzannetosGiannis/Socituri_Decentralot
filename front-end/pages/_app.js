// _app.js
import "@/styles/globals.css";
import { AuthProvider } from "@/store/authContext";
import AppNavbar from "@/components/AppNavbar/AppNavbar";
import { useRouter } from "next/router";

import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@mysten/dapp-kit/dist/index.css";

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl("localnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect>
            {isHome ? (
              <Component {...pageProps} />
            ) : (
              <>
                <AppNavbar />
                <Component {...pageProps} />
              </>
            )}
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
