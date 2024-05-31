import React from 'react';
import { teamMembers } from '@/data/teamMembers';

const AboutPage = () => {
    return (
        <div className="bg-gray-800 text-white h-screen py-10" style={{ height: '80vh' }}>
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center mb-10">Meet Our Team</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                            <img className="w-full h-48 object-cover" src={member.photo} alt={`${member.name}'s photo`} />
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
                                <h3 className="text-xl font-semibold text-gray-300 mb-4">{member.role}</h3>
                                <p className="text-gray-200 mb-4">{member.description}</p>
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
