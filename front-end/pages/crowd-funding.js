import React from 'react';
import CampaignCard from '@/components/CampaignCard/CampaignCard';

const campaigns = [
  {
    title: 'Moving Doors',
    description: 'Fully serviced and equipped flexible accommodation for business professionals and digital nomads.',
    bannerImage: 'https://via.placeholder.com/500x200',
    iconImage: 'https://via.placeholder.com/100',
    tags: ['CIE Tax Relief', 'VC-backed', 'PropTech', 'Seed+'],
    status: '112% - 71 days left',
    progress: '111.7%',
    valuation: '€15,000,000',
    target: '€100,000',
    investors: '12',
  },
  {
    title: 'Phi',
    description: '3D Design Software | Reinventing Surface Modeling',
    bannerImage: 'https://via.placeholder.com/500x200',
    iconImage: 'https://via.placeholder.com/100',
    tags: ['Equity', 'Deep Tech', '3D Design', 'Seed+', 'VC-backed'],
    status: 'Coming soon',
    progress: '0%',
    valuation: 'TBD',
    target: 'TBD',
    investors: '0',
  },
];

const CrowdFundingPage = () => {
  return (
    <div className="bg-gray-800 min-h-screen flex justify-center">
      <div className="container mx-auto p-4">
        <div className="max-w-11/12 w-full mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {campaigns.map((campaign, index) => (
              <CampaignCard key={index} campaign={campaign} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdFundingPage;
