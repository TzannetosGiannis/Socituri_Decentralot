import React from 'react';

const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-800">
            <div className="text-center max-w-md mx-auto">
                <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
                <p className="text-xl text-gray-300 mb-6">We couldn't find what you're looking for.</p>
                <button
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => window.location.href = '/'}
                >
                    Go Back Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;
