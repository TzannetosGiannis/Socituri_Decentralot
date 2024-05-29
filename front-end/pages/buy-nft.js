import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
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

  const seoConfig = {
    title: 'NFT Marketplace',
    description: 'Explore and buy unique NFTs in our marketplace. Find the best deals and rare collectibles here!',
    openGraph: {
      title: 'NFT Marketplace',
      description: 'Explore and buy unique NFTs in our marketplace. Find the best deals and rare collectibles here!',
      images: [
        {
          url: 'https://example.com/nft-marketplace-image.jpg', // TODO: Add a real image URL
          width: 800,
          height: 600,
          alt: 'NFT Marketplace Image', // TODO: Add a real image alt text
        },
      ],
      site_name: 'NFT Marketplace', // TODO: Add your site name
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: 'NFT, marketplace, buy, collectibles, digital art, blockchain',
      },
      {
        name: 'author', // TODO: Add your company name
        content: 'Your Company Name', // TODO: Add your company name
      },
    ],
  };

  return (
    <div className="bg-gray-800 min-h-screen p-4 flex flex-wrap justify-center">
      <NextSeo {...seoConfig} />
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