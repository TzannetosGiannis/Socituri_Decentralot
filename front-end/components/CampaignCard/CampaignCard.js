import React from 'react';
import { useRouter } from 'next/router';

const CampaignCard = ({ campaignId, information }) => {
  const router = useRouter();

  const handleCardClick = () => {
    // Navigate to the specific campaign's active lottery page
    router.push(`/${information.title}/active-lottery?campaignId=${campaignId}`);
  };

  return (
    <div className="p-2 pb-3">
      <div className="border-invisible relative mb-5 h-full rounded-lg border-2 bg-white shadow-md transition-transform hover:-translate-y-3 hover:border-primary hover:shadow-lg">
        <div className="flex h-full cursor-pointer flex-col" onClick={handleCardClick}>
          <div className="relative h-72 overflow-hidden md:h-52 lg:h-44 xl:h-52">
            <img
              alt={`${information.title} campaign banner`}
              loading="lazy"
              width="0"
              height="200"
              decoding="async"
              className="h-full w-full rounded-t-lg object-contain"
              src={information.bannerImage}
            />
          </div>
          <div className="relative flex w-full flex-grow flex-col p-5">
            <div className="flex">
              <h3 className="mb-2 w-5/6 flex-grow text-2xl font-bold tracking-tight text-gray-900">
                {information.title}
              </h3>
              <div className="relative -mt-16 max-h-20 w-20">
                <img
                  alt={`${information.title} campaign icon`}
                  loading="lazy"
                  width="100"
                  height="100"
                  decoding="async"
                  className="rounded-md object-contain shadow-md"
                  src={information.iconImage}
                  style={{ color: 'transparent' }}
                />
              </div>
            </div>
            <div className="mb-3 line-clamp-4 h-20 font-normal text-gray-700">
              {information.description}
            </div>
            <div className="mb-3 space-y-2">
              {information.tags.map((tag, index) => (
                <span key={index} className="mr-2 bg-gray-200 inline-flex items-center rounded-md px-2.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
            <div className="border-t border-gray-200">
              <p className="py-2 pt-2 text-base text-gray-600">{information.status}</p>
            </div>
            <div className="mb-2 overflow-hidden rounded-md border border-gray-300 bg-gray-50">
              <div className="h-3 rounded-md bg-primary" style={{ width: information.progress }}></div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-base text-gray-600">Valuation Cap</p>
                <p className="font-medium">{information.valuation}</p>
              </div>
              <div>
                <p className="text-base text-gray-600">Target</p>
                <p className="font-medium">{information.target}</p>
              </div>
              <div>
                <p className="text-base text-gray-600">Investors</p>
                <p className="font-medium">{information.investors}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
