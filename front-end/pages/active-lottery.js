import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/authContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faInfo, faAward } from '@fortawesome/free-solid-svg-icons';
import { useGetLottery } from '@/hooks/useGetLottery';
import { usePurchaseTicket } from '@/hooks/usePurchaseTicket';
import { useGetMyInformationForLottery } from '@/hooks/useGetMyInformationForLottery';
import { useGetConfig } from '@/hooks/useGetConfig';


const ActiveLotteryPage = () => {
    const { isLoggedIn } = useAuth();
    const [countdown, setCountdown] = useState(0); // Example countdown time in seconds
    const [activeTab, setActiveTab] = useState('countdown'); // State to track active tab

    const config = useGetConfig();
    const { ownedTickets } = useGetMyInformationForLottery();
    const [amount, setAmount] = useState(0);

    const {
        lottery,
        isLoading,
        fetchLottery,
    } = useGetLottery(process.env.NEXT_PUBLIC_LOTTERY_ID);

    const {
        handlePurchase,
        isLoading: isPurchaseLoading,
    } = usePurchaseTicket(process.env.NEXT_PUBLIC_LOTTERY_ID);

    useEffect(() => {
        if (lottery) {
            setCountdown(lottery.endDate - Date.now());
        }
    }, [lottery])

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown(prevCountdown => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, []);


    const handleClickPurchase = () => {
        console.log({lottery})
        if (!amount || amount < 0) return;
        handlePurchase({
            ticketPrice: lottery.ticketPrice,
            amount,
            onSuccess: () => {
                fetchLottery();
                setAmount(0);
            }
        });
    }

    const formatTime = (seconds) => {
        const formatNum = (num) => String(num).padStart(2, '0');

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${formatNum(hours)}h:${formatNum(minutes)}m:${formatNum(remainingSeconds)}s`;
    };

    if (isLoading) {
        return <div className='bg-gray-800 text-white'>
            Loading...
        </div>
    }

    if (!lottery) {
        return <div className='bg-gray-800 text-white'>
            Lottery not found.
        </div>
    }

    console.log({ bank: lottery.bank, bps: config.bps })

    return (
        <div className="h-screen flex justify-center items-center bg-gray-800 text-white">
            <div className="container mx-auto max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-2">
                        Active <span className="text-indigo-500">Lottery</span>
                    </h1>
                    <p className="text-gray-300">Join the excitement and win big!</p>
                </div>
                <div className="p-8 rounded-lg">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <ul className="flex flex-wrap -mb-px justify-center text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                            <li className="me-2">
                                <a href="#" className={`inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg ${activeTab === 'countdown' ? 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group' : ''}`} onClick={() => setActiveTab('countdown')}>
                                    <FontAwesomeIcon icon={faTicket} className="w-5 h-5 mr-2" /> Lottery
                                </a>
                            </li>
                            {isLoggedIn && (
                                <li className="me-2">
                                    <a href="#" className={`inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg ${activeTab === 'stats' ? 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group' : ''}`} onClick={() => setActiveTab('stats')}>
                                        <FontAwesomeIcon icon={faInfo} className="w-5 h-5 mr-2" /> My Information
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                    {activeTab === 'countdown' && (
                        <div className="text-center mb-6 my-8">
                            <h2 className="text-2xl lg:text-4xl font-bold mb-2">Countdown</h2>
                            <div className="flex justify-center space-x-2 lg:space-x-4">
                                <div className="bg-indigo-500 text-lg lg:text-4xl font-bold p-2 lg:p-4 rounded-md">{formatTime(countdown).split(':')[0]}</div>
                                <div className="bg-indigo-500 text-lg lg:text-4xl font-bold p-2 lg:p-4 rounded-md">{formatTime(countdown).split(':')[1]}</div>
                                <div className="bg-indigo-500 text-lg lg:text-4xl font-bold p-2 lg:p-4 rounded-md">{formatTime(countdown).split(':')[2]}</div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'stats' && isLoggedIn && (
                        <div className="rounded-lg p-6 mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold mb-2 text-gray-300">Tickets Owned</h2>
                            <div className="text-lg lg:text-xl font-bold text-indigo-500">
                                <FontAwesomeIcon icon={faTicket} className="w-5 h-5 mr-2" />
                                {ownedTickets.length}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold mb-2 text-gray-300">Pool Percentage</h2>
                            <div className="text-lg lg:text-xl font-bold text-indigo-500">
                                {lottery.bank === 0
                                    ? 0
                                    : ((ownedTickets.length * lottery.ticketPrice) / lottery.bank * 100).toFixed(2)
                                }%
                            </div>
                        </div>
                    </div>
                    
                    )}
                    {activeTab === 'countdown' && (
                        <div className="flex items-center justify-center mb-6">
                        <div className="bg-indigo-500 text-gray-100 rounded-full p-3 mr-8">
                            <FontAwesomeIcon icon={faAward} className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold mb-2 text-gray-300">Price Pool</h2>
                            <div className="text-2xl lg:text-4xl font-bold text-indigo-500">{(Number(lottery.bank) * (1 - (Number(config.bps) / 10_000))).toFixed(2)} SUI</div>
                        </div>
                    </div>
                    
                    )}
                    {isLoggedIn && (
                        <div className="flex items-center gap-x-[12px] text-center mt-6">
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-gray-800 text-white text-center w-20 h-14 rounded-lg border border-gray-300 dark:border-gray-700" />
                            <button onClick={handleClickPurchase} className="h-14 inline-block bg-indigo-500 hover:bg-indigo-600 text-lg lg:text-xl text-white font-bold py-4 px-12 lg:px-16 rounded-lg shadow-lg transition duration-300">Buy Your Tickets Now</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveLotteryPage;
