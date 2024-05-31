import React from 'react';
import { teamMembers } from '@/data/teamMembers';
import TestnetContractInfo from '@/components/TestnetContractInfo/TestnetContractInfo';

const AboutPage = () => {
    return (
        <><div className="bg-gray-800 text-white py-24 flex flex-col">
            <div className="container mx-auto px-4 flex-grow">
                <h1 className="text-4xl font-bold text-center mb-10">Meet Our Team</h1>
                <div className="flex flex-wrap justify-center gap-y-4">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 flex justify-center">
                            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg w-full max-w-xs mx-auto">
                                <img className="w-full h-70 object-cover" src={member.photo} alt={`${member.name}'s photo`} />
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
                                    <h3 className="text-xl font-semibold text-gray-300 mb-4">{member.role}</h3>
                                    <p className="text-gray-200 mb-4">{member.description}</p>
                                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="container mx-auto px-4 mb-8 mt-12">
            <TestnetContractInfo />    
        </div>
        </>
    );
};

export default AboutPage;
