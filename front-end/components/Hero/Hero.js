import Link from 'next/link';

const Hero = () => {
    const launchButtonStyle = "flex h-[30px] w-[122px] cursor-pointer items-center justify-center rounded-[8px] bg-indigo-500 lg:h-[40px] lg:w-[163px] mr-4";

    return (
        <div className="bg-gray-800 min-h-screen flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center">
                {/* Left column */}
                <div className="lg:w-1/2 lg:pr-8">
                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 lg:mb-8">Your <span className="text-indigo-500">Revolutionary</span> Solution</h1>
                    <p className="text-lg lg:text-xl text-gray-300 mb-8 lg:mb-12">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut auctor magna ut tellus eleifend, eget suscipit neque congue. Vivamus ac lorem quis magna dictum vehicula.</p>
                    <div className="flex justify-center lg:justify-start">
                        <Link
                            href="#"
                            className={`${launchButtonStyle} transition duration-300 ease-in-out`}>
                            Launch App
                        </Link>
                    </div>
                </div>
                {/* Right column */}
                <div className="lg:w-1/2 lg:pl-8 mt-8 lg:mt-0">
                    <img className="mx-auto lg:mx-0 rounded-lg shadow-lg" src="/placeholder-image.jpg" alt="Product Image" />
                </div>
            </div>
        </div>
    );
};

export default Hero;