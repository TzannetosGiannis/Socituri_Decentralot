import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AppNavbar = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const navOptions = ["Active Lottery", "Crowd Funding", "Buy NFT"];

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const isActive = (option) => {
        return router.pathname === `/${option.toLowerCase().replace(/\s/g, '-')}`;
    };

    const buttonStyle = "text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium";
    const buttonGroupStyle = "flex space-x-4";
    const launchButtonStyle = "flex h-[30px] w-[122px] cursor-pointer items-center justify-center rounded-[8px] bg-indigo-500 lg:h-[40px] lg:w-[163px] mr-4";
    const dropdownStyle = "lg:hidden";
    const dropdownItemStyle = "block px-3 py-2 rounded-md text-white text-base font-medium";

    return (
        <nav className="bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/">
                            <img className="block lg:hidden h-8 w-auto" src="/logo.svg" alt="Logo" />
                            <img className="hidden lg:block h-8 w-auto" src="/logo.svg" alt="Logo" />
                        </Link>
                    </div>

                    <div className="hidden lg:flex lg:items-center">
                        <div className={buttonGroupStyle}>
                            {navOptions.map((option, index) => (
                                (<Link
                                    key={index}
                                    href={`/${option.toLowerCase().replace(/\s/g, '-')}`}
                                    className={`${buttonStyle} ${isActive(option) ? 'underline' : ''}`}>

                                    {option}

                                </Link>)
                            ))}
                        </div>
                    </div>

                    <div className="flex lg:hidden items-center">
                        <Link href="/active-lottery" className={launchButtonStyle}>
                            <span className="text-[14px] text-white lg:text-[18px]">Connect to SUI</span>
                        </Link>
                        <button onClick={toggleMenu} className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium focus:outline-none">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center">
                        <button className={launchButtonStyle}>
                            <span className="text-[14px] text-white lg:text-[18px]">Connect to SUI</span>
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className={dropdownStyle}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navOptions.map((option, index) => (
                            (<Link
                                key={index}
                                href={`/${option.toLowerCase().replace(/\s/g, '-')}`}
                                className={`${dropdownItemStyle} ${isActive(option) ? 'underline text-indigo-500' : ''}`}>

                                {option}

                            </Link>)
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AppNavbar;