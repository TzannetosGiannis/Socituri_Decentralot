import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/authContext';
import { useGetLottery } from '@/hooks/useGetLottery';
import { usePurchaseTicket } from '@/hooks/usePurchaseTicket';
import { useGetConfig } from '@/hooks/useGetConfig';
import Lottery from '@/components/Lottery/Lottery';
import LotteriesTable from '@/components/LotteriesTable/LotteriesTable';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import NotFound from '@/components/NotFound/NotFound';
import { fetchCurrentLotteryId } from '@/utils/fetchCurrentLotteryId';
import { fetchPreviousLotteries } from '@/utils/fetchPreviousLotteries';
import { useCurrentAccount } from '@mysten/dapp-kit';

const ActiveLotteryPage = () => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const { name, campaignId } = router.query;

    const [lotteryId, setLotteryId] = useState(null);
    const [previousLotteries, setPreviousLotteries] = useState([]);
    const [ownedTickets, setOwnedTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const config = useGetConfig();
    const currentAccount = useCurrentAccount();

    const {
        lottery,
        isLoading: isLotteryLoading,
        fetchLottery,
    } = useGetLottery(lotteryId);

    const {
        handlePurchase,
        isLoading: isPurchaseLoading,
    } = usePurchaseTicket(lotteryId);

    const fetchOwnedTickets = useCallback(async () => {
        if (currentAccount?.address && lottery?.round) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/tickets/${currentAccount.address}/${campaignId || "main"}/${lottery.round}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const data = await response.json();
                console.log('tickets', data);
                setOwnedTickets(data.ownedTickets);
            } catch (err) {
                setError(err);
            }
        }
    }, [currentAccount, lottery?.round, campaignId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const id = name && name !== 'socituri' ? await fetchCurrentLotteryId(campaignId) : await fetchCurrentLotteryId();
                setLotteryId(id);
                const prevLotteries = campaignId ? await fetchPreviousLotteries(campaignId) : await fetchPreviousLotteries();
                setPreviousLotteries(prevLotteries);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (router.isReady) {
            fetchData();
        }
    }, [router.isReady, name, campaignId]);

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

    return (
        <div className="bg-gray-800 min-h-screen flex flex-col justify-center items-center">
            <div className="container mx-auto p-4">
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

export default ActiveLotteryPage;
