import { useState } from 'react';

const CampaignCard = ({ campaign }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCardClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target.id === 'popup-background') {
      handleClosePopup();
    }
  };

  return (
    <div className="p-2 pb-3">
      <div className="border-invisible relative mb-5 h-full rounded-lg border-2 bg-white shadow-md transition-transform hover:-translate-y-3 hover:border-primary hover:shadow-lg">
        <div className="flex h-full cursor-pointer flex-col" onClick={handleCardClick}>
          <div className="relative h-72 overflow-hidden md:h-52 lg:h-44 xl:h-52">
            <img
              alt={`${campaign.title} campaign banner`}
              loading="lazy"
              width="500"
              height="200"
              decoding="async"
              className="h-full w-full rounded-t-lg object-cover object-top"
              src={campaign.bannerImage}
              style={{ color: 'transparent' }}
            />
          </div>
          <div className="relative flex w-full flex-grow flex-col p-5">
            <div className="flex">
              <h3 className="mb-2 w-5/6 flex-grow text-2xl font-bold tracking-tight text-gray-900">
                {campaign.title}
              </h3>
              <div className="relative -mt-16 max-h-20 w-20">
                <img
                  alt={`${campaign.title} campaign icon`}
                  loading="lazy"
                  width="100"
                  height="100"
                  decoding="async"
                  className="rounded-md object-contain shadow-md"
                  src={campaign.iconImage}
                  style={{ color: 'transparent' }}
                />
              </div>
            </div>
            <div className="mb-3 line-clamp-4 h-20 font-normal text-gray-700">
              {campaign.description}
            </div>
            <div className="mb-3 space-y-2">
              {campaign.tags.map((tag, index) => (
                <span key={index} className="mr-2 bg-gray-200 inline-flex items-center rounded-md px-2.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
            <div className="border-t border-gray-200">
              <p className="py-2 pt-2 text-base text-gray-600">{campaign.status}</p>
            </div>
            <div className="mb-2 overflow-hidden rounded-md border border-gray-300 bg-gray-50">
              <div className="h-3 rounded-md bg-primary" style={{ width: campaign.progress }}></div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-base text-gray-600">Valuation Cap</p>
                <p className="font-medium">{campaign.valuation}</p>
              </div>
              <div>
                <p className="text-base text-gray-600">Target</p>
                <p className="font-medium">{campaign.target}</p>
              </div>
              <div>
                <p className="text-base text-gray-600">Investors</p>
                <p className="font-medium">{campaign.investors}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <div
          id="popup-background"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Fund with SUI</h2>
            <p>Here will be the form to fund the campaign using SUI.</p>
            <button
              className="mt-4 bg-primary text-white px-4 py-2 rounded"
              onClick={handleClosePopup}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCard;
