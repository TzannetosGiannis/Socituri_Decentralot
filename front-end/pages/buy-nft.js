import React, { useState } from 'react';
import NftCard from '@/components/NftCard/NftCard';

const dummyNfts = [
  {
    image: 'https://via.placeholder.com/300x200',
    endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    cost: '0.51',
    onBuyNow: () => alert('Buy Now clicked for NFT 1'),
  },
  {
    image: 'https://via.placeholder.com/300x200',
    endTime: new Date(new Date().getTime() + 10 * 1000),
    cost: '1.25',
    onBuyNow: () => alert('Buy Now clicked for NFT 2'),
  },
];

const NftMarketplace = () => {
  const [nfts, setNfts] = useState(dummyNfts);

  return (
    <div className="bg-gray-800 min-h-screen p-4 flex flex-wrap justify-center">
      {nfts.map((nft, index) => (
        <div key={index} className="m-4">
          <NftCard
            image={nft.image}
            endTime={nft.endTime}
            cost={nft.cost}
            onBuyNow={nft.onBuyNow}
          />
        </div>
      ))}
    </div>
  );
};

export default NftMarketplace;
