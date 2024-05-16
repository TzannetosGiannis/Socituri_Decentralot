import React from 'react';
import { Link as ScrollLink } from 'react-scroll';

const FeatureHighlight = () => {
    // Define an array of features with their respective details
    const features = [
        {
            title: "Efficient AMM",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut auctor magna ut tellus eleifend.",
            icon: "/icons/efficient-amm.svg",
        },
        {
            title: "Low Gas Fees",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut auctor magna ut tellus eleifend.",
            icon: "/icons/low-gas-fees.svg",
        },
        {
            title: "One-click Rebalance",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut auctor magna ut tellus eleifend.",
            icon: "/icons/one-click-rebalance.svg",
        },
        // Add more features as needed
    ];

    return (
        <div id="goal" className="bg-gray-800 py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <h2 className="text-4xl text-white lg:text-5xl font-bold text-center mb-8 lg:mb-12">Goals</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Map through each feature and render a card */}
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform transition duration-300 hover:scale-105">
                            <img src={feature.icon} alt={feature.title} className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 text-center mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600 text-center">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureHighlight;
