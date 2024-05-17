import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/authContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faInfo, faAward } from '@fortawesome/free-solid-svg-icons';

const ActiveLotteryPage = () => {
    const { isLoggedIn } = useAuth();
    const [countdown, setCountdown] = useState(3600); // Example countdown value
    const [totalPool, setTotalPool] = useState(1000); // Example total prize pool
    const [totalTicketsBought, setTotalTicketsBought] = useState(50); // Example total tickets bought
    const [activeTab, setActiveTab] = useState('countdown'); // State to track active tab

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown(prevCountdown => prevCountdown - 1);
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, []);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

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
                                {totalTicketsBought}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold mb-2 text-gray-300">Pool Percentage</h2>
                            <div className="text-lg lg:text-xl font-bold text-indigo-500">
                                {(totalTicketsBought / totalPool * 100).toFixed(2)}%
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
                            <div className="text-2xl lg:text-4xl font-bold text-indigo-500">${totalPool}</div>
                        </div>
                    </div>
                    
                    )}
                    {isLoggedIn && (
                        <div className="text-center mt-6">
                            <button className="inline-block bg-indigo-500 hover:bg-indigo-600 text-lg lg:text-xl text-white font-bold py-4 px-12 lg:px-16 rounded-lg shadow-lg transition duration-300">Buy Your Ticket Now</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveLotteryPage;
