import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faInfo, faAward } from '@fortawesome/free-solid-svg-icons';

const Lottery = ({
    isLoggedIn,
    config,
    ownedTickets,
    lottery,
    isLoading,
    handlePurchase,
    fetchLottery,
    lotteryName, // New prop for the lottery name
}) => {
    const [countdown, setCountdown] = useState(0);
    const [activeTab, setActiveTab] = useState('countdown');
    const [amount, setAmount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (lottery) {
            setCountdown(Math.max(lottery.endDate - Date.now(), 0));
        }
    }, [lottery]);

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown(prevCountdown => Math.max(prevCountdown - 1, 0));
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, []);

    const handleClickPurchase = () => {
        if (!amount || amount <= 0) return;
        handlePurchase({
            ticketPrice: lottery.ticketPrice,
            amount,
            onSuccess: () => {
                fetchLottery();
                setAmount(0);
                setIsModalOpen(false);
            }
        });
    };

    const formatTime = (seconds) => {    
        const years = Math.floor(seconds / (3600 * 24 * 365));
        seconds %= 3600 * 24 * 365;
        const months = Math.floor(seconds / (3600 * 24 * 30));
        seconds %= 3600 * 24 * 30;
        const days = Math.floor(seconds / (3600 * 24));
        seconds %= 3600 * 24;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
    
        const timeParts = [
            { value: years, label: 'Y' },
            { value: months, label: 'M' },
            { value: days, label: 'D' },
            { value: hours, label: 'H' },
            { value: minutes, label: 'M' },
            { value: remainingSeconds, label: 'S' },
        ];
    
        // Remove leading zero parts but keep at least one part
        const significantTimeParts = timeParts.slice(timeParts.findIndex(part => part.value > 0));
        return significantTimeParts.length ? significantTimeParts : [timeParts[timeParts.length - 1]];
    };    

    if (isLoading) {
        return <div className='bg-gray-800 text-white'>
            Loading...
        </div>;
    }

    if (!lottery) {
        return <div className='bg-gray-800 text-white'>
            Lottery not found.
        </div>;
    }

    const formattedTime = formatTime(countdown);

    return (
        <div className="h-screen flex justify-center items-center bg-gray-800 text-white">
            <div className="container mx-auto max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-2">
                        {lotteryName ? lotteryName : (
                            <>Active <span className="text-indigo-500">Lottery</span></>
                        )}
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
                                {formattedTime.map(part => (
                                    <div key={part.label} className="bg-indigo-500 text-lg lg:text-4xl font-bold p-2 lg:p-4 rounded-md">
                                        {part.value}{part.label}
                                    </div>
                                ))}
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
                        <div className="text-center mt-6">
                            <button onClick={() => setIsModalOpen(true)} className="h-14 inline-block bg-indigo-500 hover:bg-indigo-600 text-lg lg:text-xl text-white font-bold py-4 px-12 lg:px-16 rounded-lg shadow-lg transition duration-300">Buy Your Tickets Now</button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-gray-900 text-white p-8 rounded-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Purchase Tickets</h2>
                        <p className="mb-4">Join the lottery and increase your chances of winning big! The current ticket price is <span className="text-indigo-500 font-bold">{lottery.ticketPrice}</span>.</p>
                        <div className="mb-4">
                            <label htmlFor="amount" className="block mb-2">Number of Tickets:</label>
                            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="bg-gray-800 text-white w-full p-2 rounded-lg" />
                        </div>
                        <div className="flex justify-between items-center">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleClickPurchase} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">Buy Tickets</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lottery;
