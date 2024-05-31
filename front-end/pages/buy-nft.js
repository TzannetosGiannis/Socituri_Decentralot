import React, { useEffect, useState } from "react";
import { NextSeo } from "next-seo";
import { useGetLottery } from "@/hooks/useGetLottery";
import { useRouter } from "next/router";
import { fetchCurrentLotteryAndCampaign } from "@/utils/fetchCurrentLotteryAndCampaign";
import { useSuiClient } from "@mysten/dapp-kit";
import NftCard from "@/components/NftCard/NftCard";
import { OwnedTickets } from "@/components/Redeem/OwnedTickets";

const EPOCH_INTERVAL = 604_800_000;

const NftMarketplace = () => {
  const suiClient = useSuiClient();
  const router = useRouter();
  const [nft, setNft] = useState(null);
  const [lotteryId, setLotteryId] = useState(null);
  const [campaignId, setCampaignId] = useState(null);

  const { lottery } = useGetLottery(lotteryId);

  useEffect(() => {
    getEpochConfigNFT()
      .then((epochConfigNFT) => {
        console.log({ epochConfigNFT });
        if (!epochConfigNFT) {
          console.error("Epoch config NFT not found");
          setNft(null);
          return;
        }
        setNft(epochConfigNFT);
      })
      .catch((err) => {
        console.error(err);
        setNft(null);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const resp = await fetchCurrentLotteryAndCampaign();
      setLotteryId(resp.current_lottery_id);
      setCampaignId(resp.campaign_id);
    };

    if (router.isReady) {
      fetchData();
    }
  }, [router.isReady]);

  const getEpochConfigNFT = async () => {
    const previousEpoch = Math.floor(Date.now() / EPOCH_INTERVAL) - 1;

    const epochConfigsTable = await suiClient
      .getObject({
        id: process.env.NEXT_PUBLIC_FEE_DISTRIBUTION,
        options: {
          showContent: true,
          showType: true,
          showDisplay: true,
        },
      })
      .then((resp) => {
        return resp.data.content.fields.config_per_epoch.fields.id.id;
      })
      .catch((err) => {
        console.log(err);
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
      }).catch((error) => {
        const formatted = {
          pricePerTicket: 100000000,
          remainingTickets: 50,
          totalTickets: 50,
        };
        return formatted;
      });
  };

  const seoConfig = {
    title: "NFT Marketplace",
    description:
      "Explore and buy unique NFTs in our marketplace. Find the best deals and rare collectibles here!",
    openGraph: {
      title: "NFT Marketplace",
      description:
        "Explore and buy unique NFTs in our marketplace. Find the best deals and rare collectibles here!",
      images: [
        {
          url: "https://example.com/nft-marketplace-image.jpg", // TODO: Add a real image URL
          width: 800,
          height: 600,
          alt: "NFT Marketplace Image", // TODO: Add a real image alt text
        },
      ],
    },
    additionalMetaTags: [
      {
        name: "keywords",
        content: "NFT, marketplace, buy, collectibles, digital art, blockchain",
      },
      {
        name: "Socituri",
        content: "Socituri Decentralot",
      },
    ],
  };

  const handlePurchaseSuccess = () => {
    getEpochConfigNFT()
      .then((epochConfigNFT) => {
        console.log({ epochConfigNFT });
        if (!epochConfigNFT) {
          console.error("Epoch config NFT not found");
          setNft(null);
          return;
        }
        setNft(epochConfigNFT);
        // Refresh the page to ensure the new NFT is displayed
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        setNft(null);
      });
  };

  console.log({ nft, lottery });

  return (
    <div className="bg-gray-800 flex flex-col items-center p-24 gap-y-[24px]">
      <NextSeo {...seoConfig} />
      {!!nft && !!lottery && (
        <>
        <h1 className="text-4xl text-white font-bold text-center">Buy NFT</h1>
        <NftCard
          image="/assets/logo.webp"
          endTime={1717426800000} // deprecate for now, fixed some days later
          cost={nft.pricePerTicket}
          onPurchaseSuccess={handlePurchaseSuccess} />
        </>
      )}
      <OwnedTickets />
    </div>
  );
};

export default NftMarketplace;
