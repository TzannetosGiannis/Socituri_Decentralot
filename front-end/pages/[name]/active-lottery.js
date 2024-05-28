import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/authContext';
import { useGetLottery } from '@/hooks/useGetLottery';
import { usePurchaseTicket } from '@/hooks/usePurchaseTicket';
import { useGetMyInformationForLottery } from '@/hooks/useGetMyInformationForLottery';
import { useGetConfig } from '@/hooks/useGetConfig';
import Lottery from '@/components/Lottery/Lottery';

const ActiveLotteryPage = () => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const { name } = router.query;

    // If there's no campaign name, use a default name and lottery ID
    const defaultName = 'socituri';
    const lotteryId = name && name != 'socituri' ? `lottery_${name}` : process.env.NEXT_PUBLIC_LOTTERY_ID;
    
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

    return (
        <Lottery 
            isLoggedIn={isLoggedIn}
            config={config}
            ownedTickets={ownedTickets}
            lottery={lottery}
            isLoading={isLoading}
            handlePurchase={handlePurchase}
            fetchLottery={fetchLottery}
            {...(name && name !== defaultName && { lotteryName: name })} // Conditionally pass lotteryName
        />
    );
};

export default ActiveLotteryPage;
