import React from 'react';
import CampaignCard from '@/components/CampaignCard/CampaignCard';

const CrowdFundingPage = () => {
  return (
    <div className="bg-gray-800 min-h-screen flex justify-center">
      <div className="container mx-auto p-4">
        <div className="w-11/12 mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            <CampaignCard />
            <CampaignCard />
            <CampaignCard />
            <CampaignCard />
            <CampaignCard />
            <CampaignCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdFundingPage;
