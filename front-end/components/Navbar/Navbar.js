import { useState } from 'react';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navOptions = ["Goal", "Services", "Roadmap"];

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const appPage = "/socituri/active-lottery";

    // Shared Tailwind CSS strings as constants
    const buttonStyle = "text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium";
    const buttonGroupStyle = "flex space-x-4";
    const launchButtonStyle = "flex h-[30px] w-[122px] cursor-pointer items-center justify-center rounded-[8px] bg-indigo-500 lg:h-[40px] lg:w-[163px] mr-4";
    const dropdownStyle = "lg:hidden";
    const dropdownItemStyle = "text-white block hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium";

    return (
        <nav className="bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    {/* Left side */}
                    <div className="flex-shrink-0 flex items-center">
                        {/* Replace 'logo.svg' with your actual logo image */}
                        <img className="block lg:hidden h-14 w-auto" src="/assets/logo.webp" alt="Logo" />
                        <img className="hidden lg:block h-14 w-auto" src="/assets/logo.webp" alt="Logo" />
                    </div>

                    {/* Right side for larger screens */}
                    <div className="hidden lg:flex lg:items-center">
                        {/* Navigation elements */}
                        <div className={buttonGroupStyle}>
                            {navOptions.map((option, index) => (
                                <ScrollLink
                                    key={index}
                                    to={option.toLowerCase()}
                                    smooth={true}
                                    duration={500}
                                    className={buttonStyle}>
                                    {option}
                                </ScrollLink>
                            ))}
                        </div>
                    </div>

                    {/* Right side for smaller screens */}
                    <div className="flex lg:hidden items-center">
                        {/* Launch app button for smaller screens */}
                        <Link href={appPage} className={launchButtonStyle}>

                            <span className="text-[14px] text-white lg:text-[18px]">Launch app</span>

                        </Link>
                        {/* Burger menu icon */}
                        <button onClick={toggleMenu} className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium focus:outline-none">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>
                    {/* Launch app button for larger screens */}
                    <div className="hidden lg:flex items-center">
                        <Link href={appPage} className={launchButtonStyle}>

                            <span className="text-[14px] text-white lg:text-[18px]">Launch app</span>

                        </Link>
                    </div>
                </div>
            </div>

            {/* Dropdown for smaller screens */}
            {isOpen && (
                <div className={dropdownStyle}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navOptions.map((option, index) => (
                            <ScrollLink
                                key={index}
                                to={option.toLowerCase()}
                                smooth={true}
                                duration={500}
                                className={dropdownItemStyle}>
                                {option}
                            </ScrollLink>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
