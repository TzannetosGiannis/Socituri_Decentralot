import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/authContext';
import { useGetLottery } from '@/hooks/useGetLottery';
import { usePurchaseTicket } from '@/hooks/usePurchaseTicket';
import { useGetMyInformationForLottery } from '@/hooks/useGetMyInformationForLottery';
import { useGetConfig } from '@/hooks/useGetConfig';
import Lottery from '@/components/Lottery/Lottery';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import NotFound from '@/components/NotFound/NotFound';

const ActiveLotteryPage = () => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const { name } = router.query;

    const [lotteryId, setLotteryId] = useState(null);

    useEffect(() => {
        // Wait for the router to be ready before setting the lotteryId
        if (router.isReady) {
            const defaultName = 'socituri';
            const id = name && name !== defaultName ? `lottery_${name}` : process.env.NEXT_PUBLIC_LOTTERY_ID;
            setLotteryId(id);
        }
    }, [router.isReady, name]);

    const config = useGetConfig();
    const { ownedTickets } = useGetMyInformationForLottery();

    const {
        lottery,
        isLoading,
        fetchLottery,
    } = useGetLottery(lotteryId);

    const {
        handlePurchase,
        isLoading: isPurchaseLoading,
    } = usePurchaseTicket(lotteryId);

    if (!router.isReady || !lotteryId || isLoading || isPurchaseLoading) {
        return <LoadingSpinner />;
    }

    if (!lottery) {
        return <NotFound />;
    }

    return (
        <Lottery
            isLoggedIn={isLoggedIn}
            config={config}
            ownedTickets={ownedTickets}
            lottery={lottery}
            isLoading={isLoading}
            handlePurchase={handlePurchase}
            fetchLottery={fetchLottery}
            {...(name && name !== 'socituri' && { lotteryName: name })} // Conditionally pass lotteryName
        />
    );
};

export default ActiveLotteryPage;
