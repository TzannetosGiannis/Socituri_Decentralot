import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { MIST_PER_SUI } from '@mysten/sui.js/utils';

const AppNavbar = () => {
    const currentAccount = useCurrentAccount();
    const suiClient = useSuiClient();
    const [balance, setBalance] = useState(0);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const navOptions = ["Active Lottery", "Crowd Funding", "Buy NFT"];

    useEffect(() => {
        const fetchBalance = async () => {
            if (currentAccount?.address) {
                try {
                    const resp = await suiClient.getBalance({ owner: currentAccount.address });
                    const bal = resp.totalBalance / Number(MIST_PER_SUI);
                    setBalance(bal.toFixed(2));
                } catch (error) {
                    console.error("Failed to fetch balance:", error);
                }
            }
        };

        fetchBalance(); // Initial fetch

        const intervalId = setInterval(fetchBalance, 500); // Fetch balance every 60 seconds

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, [currentAccount, suiClient]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const getLinkPath = (option) => {
        return option === 'Active Lottery' ? '/socituri/active-lottery' : `/${option.toLowerCase().replace(/\s/g, '-')}`;
    };

    const isActive = (option) => {
        const path = getLinkPath(option);
        return router.pathname === path || (option === 'Active Lottery' && router.pathname.includes('/active-lottery'));
    };

    const buttonStyle = "text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium";
    const buttonGroupStyle = "flex space-x-4";
    const dropdownStyle = "lg:hidden";
    const dropdownItemStyle = "block px-3 py-2 rounded-md text-white text-base font-medium";

    const renderSuiWalletButton = () => {
        if (!currentAccount?.address) {
            return <ConnectButton />;
        }
        return (
            <div className='flex items-center gap-x-[12px]'>
                <ConnectButton />
                {currentAccount?.address && (
                    <div className='text-white'>
                        {balance} SUI
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav className="bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/">
                            <img className="block lg:hidden h-14 w-auto" src="/assets/logo.webp" alt="Logo" />
                            <img className="hidden lg:block h-14 w-auto" src="/assets/logo.webp" alt="Logo" />
                        </Link>
                    </div>

                    <div className="hidden lg:flex lg:items-center">
                        <div className={buttonGroupStyle}>
                            {navOptions.map((option, index) => (
                                <Link
                                    key={index}
                                    href={getLinkPath(option)}
                                    className={`${buttonStyle} ${isActive(option) ? 'underline' : ''}`}
                                >
                                    {option}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex lg:hidden items-center">
                        {renderSuiWalletButton()}

                        <button onClick={toggleMenu} className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium focus:outline-none">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center">
                        {renderSuiWalletButton()}
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className={dropdownStyle}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navOptions.map((option, index) => (
                            <Link
                                key={index}
                                href={getLinkPath(option)}
                                className={`${dropdownItemStyle} ${isActive(option) ? 'underline text-indigo-500' : ''}`}
                            >
                                {option}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AppNavbar;
