import React from 'react';
import { useAuth } from '@/store/authContext';
import { useGetLottery } from '@/hooks/useGetLottery';
import { usePurchaseTicket } from '@/hooks/usePurchaseTicket';
import { useGetMyInformationForLottery } from '@/hooks/useGetMyInformationForLottery';
import { useGetConfig } from '@/hooks/useGetConfig';
import Lottery from '@/components/Lottery/Lottery';

const ActiveLotteryPage = () => {
    const { isLoggedIn } = useAuth();

    const config = useGetConfig();
    const { ownedTickets } = useGetMyInformationForLottery();
    
    const {
        lottery,
        isLoading,
        fetchLottery,
    } = useGetLottery(process.env.NEXT_PUBLIC_LOTTERY_ID);

    const {
        handlePurchase,
        isLoading: isPurchaseLoading,
    } = usePurchaseTicket(process.env.NEXT_PUBLIC_LOTTERY_ID);

    return (
        <Lottery 
            isLoggedIn={isLoggedIn}
            config={config}
            ownedTickets={ownedTickets}
            lottery={lottery}
            isLoading={isLoading}
            handlePurchase={handlePurchase}
            fetchLottery={fetchLottery}
        />
    );
};

export default ActiveLotteryPage;