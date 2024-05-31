import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faCoffee, faHeart } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2">Socituri</h2>
                        <p>Participation in Sui Overflow<br />Designed and Implemented with <FontAwesomeIcon icon={faCoffee} style={{ color: 'beige' }}/> and <FontAwesomeIcon icon={faHeart} style={{ color: 'red' }}/></p>
                        <p className="text-gray-400">Contest Dates: April 21, 2024 - June 15, 2024</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="mb-4 md:mb-0 md:mr-4">
                            <a href="/assets/files/Socituri-Pitch.pptx" download="Socituri-Pitch.pptx" className="hover:text-gray-400">Pitch</a>
                        </div>
                        <div className="mb-4 md:mb-0 md:mr-4">
                            <a href="/about" className="hover:text-gray-400">About Us</a>
                        </div>
                        <div className="flex space-x-4">
                            <a href="https://github.com/TzannetosGiannis/Socituri_Decentralot" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                                <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
