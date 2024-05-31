import React, { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import CampaignCard from '@/components/CampaignCard/CampaignCard';
import { fetchCampaigns } from '@/utils/fetchCampaigns';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import NotFound from '@/components/NotFound/NotFound';

const CrowdFundingPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCampaigns = async () => {
      try {
        const data = await fetchCampaigns();
        setCampaigns(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getCampaigns();
  }, []);

  const seoConfig = {
    title: 'CrowdFunding Campaigns',
    description: 'Discover and support our crowdfunding campaigns to bring innovative projects to life. Join us and make a difference!',
    openGraph: {
      title: 'CrowdFunding Campaigns',
      description: 'Discover and support our crowdfunding campaigns to bring innovative projects to life. Join us and make a difference!',
      images: [
        {
          url: 'https://example.com/crowdfunding-image.jpg', // TODO: Add a real image URL
          width: 800,
          height: 600,
          alt: 'Crowdfunding Image', // TODO: Add a real image alt text
        },
      ],
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: 'crowdfunding, campaigns, support, innovation, projects',
      },
      {
        name: 'Socituri',
        content: 'Socituri Decentralot',
      },
    ],
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (campaigns.length === 0) {
    return <NotFound />;
  }

  return (
    <div className="bg-gray-800 min-h-screen flex justify-center">
      <NextSeo {...seoConfig} />
      <div className="container mx-auto p-4">
        <div className="max-w-11/12 w-full mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
            {campaigns.map((campaign, index) => (
              <CampaignCard key={index} campaignId={campaign.campaign_id} information={campaign.information} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdFundingPage;
