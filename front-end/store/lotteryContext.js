import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { fetchCurrentLotteryId } from '@/utils/fetchCurrentLotteryId';
import { fetchPreviousLotteries } from '@/utils/fetchPreviousLotteries';
import { useGetConfig } from '@/hooks/useGetConfig';

const LotteryContext = createContext();

export const LotteryProvider = ({ children, campaignId, name }) => {
    const [lotteryId, setLotteryId] = useState(null);
    const [previousLotteries, setPreviousLotteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const config = useGetConfig();  // Fetch the config

    const fetchLotteryData = useCallback(async () => {
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
    }, [campaignId, name]);

    useEffect(() => {
        fetchLotteryData();

        const intervalId = setInterval(() => {
            fetchLotteryData();
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }, [fetchLotteryData]);

    return (
        <LotteryContext.Provider value={{ lotteryId, previousLotteries, fetchLotteryData, loading, error, config }}>
            {children}
        </LotteryContext.Provider>
    );
};

export const useLottery = () => {
    return useContext(LotteryContext);
};
