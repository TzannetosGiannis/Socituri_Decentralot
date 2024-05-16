import React from 'react';

const Services = () => {
    // Define an array of services with their respective details
    const services = [
        {
            image: "/service1.jpg",
            title: "Service 1",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut auctor magna ut tellus eleifend.",
        },
        {
            image: "/service2.jpg",
            title: "Service 2",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut auctor magna ut tellus eleifend.",
        },
        {
            image: "/service3.jpg",
            title: "Service 3",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut auctor magna ut tellus eleifend.",
        },
        // Add more services as needed
    ];

    return (
        <div id='services' className="bg-gray-800 py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-center mb-8 lg:mb-12">Services</h2>
                {services.map((service, index) => (
                    <div key={index} className={`flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''} mb-8 lg:mb-12`}>
                        <div className="lg:w-1/2 lg:pr-8">
                            <img src={service.image} alt={service.title} className="rounded-lg shadow-lg mb-4 lg:mb-0 lg:mr-8" />
                        </div>
                        <div className="lg:w-1/2 lg:pl-8">
                            <h3 className="text-2xl lg:text-3xl font-semibold mb-2">{service.title}</h3>
                            <p className="text-sm lg:text-base text-gray-600">{service.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Services;
