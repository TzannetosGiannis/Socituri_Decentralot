import { NextSeo } from 'next-seo';
import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/authContext';
import { useGetLottery } from '@/hooks/useGetLottery';
import { usePurchaseTicket } from '@/hooks/usePurchaseTicket';
import Lottery from '@/components/Lottery/Lottery';
import LotteriesTable from '@/components/LotteriesTable/LotteriesTable';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import NotFound from '@/components/NotFound/NotFound';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { LotteryProvider, useLottery } from '@/store/lotteryContext';

const ActiveLotteryPageContent = () => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const { name, campaignId } = router.query;

    const { lotteryId, previousLotteries, loading, error, config } = useLottery();  // Add config here
    const { lottery, isLoading: isLotteryLoading, fetchLottery } = useGetLottery(lotteryId);
    const { handlePurchase, isLoading: isPurchaseLoading } = usePurchaseTicket(lotteryId);

    const currentAccount = useCurrentAccount();
    const [ownedTickets, setOwnedTickets] = useState([]);

    const fetchOwnedTickets = useCallback(async () => {
        if (currentAccount?.address && lottery?.round) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/tickets/${currentAccount.address}/${campaignId || "main"}/${lottery.round}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const data = await response.json();
                setOwnedTickets(data.ownedTickets);
            } catch (err) {
                console.error(err);
            }
        }
    }, [currentAccount, lottery?.round, campaignId]);

    useEffect(() => {
        if (currentAccount && lottery) {
            fetchOwnedTickets();
        }
    }, [currentAccount, lottery, fetchOwnedTickets]);

    if (!router.isReady || loading || isLotteryLoading || isPurchaseLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    if (!lottery) {
        return <NotFound />;
    }

    const seoConfig = {
        title: name ? `${name} Lottery` : 'Active Lottery',
        description: lottery ? `Join the ${lottery.name} lottery and win big!` : 'Participate in our exciting lottery events and win amazing prizes!',
        openGraph: {
            title: name ? `${name} Lottery` : 'Active Lottery',
            description: lottery ? `Join the ${lottery.name} lottery and win big!` : 'Participate in our exciting lottery events and win amazing prizes!',
            images: [
                {
                    url: 'https://example.com/lottery-image.jpg', // TODO: Add a real image URL
                    width: 800,
                    height: 600,
                    alt: 'Lottery Image', // TODO: Add a real image alt text
                },
            ],
        },
        additionalMetaTags: [
            {
                name: 'keywords',
                content: 'lottery, tickets, win, prizes, gaming, luck',
            },
            {
              name: "Socituri",
              content: "Socituri Decentralot",
            },
        ],
    };
    
    return (
        <div className="bg-gray-800 flex flex-col justify-center items-center">
            <NextSeo {...seoConfig} />
            <div className="container">
                <Lottery
                    isLoggedIn={isLoggedIn}
                    config={config}
                    ownedTickets={ownedTickets}
                    lottery={lottery}
                    isLoading={isLotteryLoading}
                    handlePurchase={handlePurchase}
                    fetchLottery={fetchLottery}
                    {...(name && name !== 'socituri' && { lotteryName: name })} // Conditionally pass lotteryName
                />
                {previousLotteries.length !== 0 && <LotteriesTable lotteries={previousLotteries} ownedTickets={ownedTickets} />}
            </div>
        </div>
    );
};

const ActiveLotteryPage = () => {
    const router = useRouter();
    const { name, campaignId } = router.query;

    return (
        <LotteryProvider campaignId={campaignId} name={name}>
            <ActiveLotteryPageContent />
        </LotteryProvider>
    );
};

export default ActiveLotteryPage;
