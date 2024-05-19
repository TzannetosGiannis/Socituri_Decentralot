import React, { useState, useEffect } from 'react';

const NftCard = ({ image, endTime, cost, onBuyNow }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endTime) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      if (Object.keys(newTimeLeft).length === 0) {
        clearInterval(timer);
      }
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeLeftString = `${timeLeft.days || '00'} Days ${timeLeft.hours || '00'} Hours ${timeLeft.minutes || '00'} Minutes ${timeLeft.seconds || '00'} Seconds`;

  if (Object.keys(timeLeft).length === 0) {
    return null; // Remove the component when the countdown reaches zero
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-72">
      <img src={image} alt="NFT" className="w-full h-48 object-cover" />
      <div className="p-4">
        <div className="text-center mb-2">
          <p className="text-lg font-semibold">Sale ends in:</p>
          <p className="text-sm text-gray-600">{timeLeftString}</p>
        </div>
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">Current price:</p>
          <p className="text-2xl font-bold text-blue-600">{cost} SUI</p>
        </div>
        <button
          onClick={onBuyNow}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default NftCard;
