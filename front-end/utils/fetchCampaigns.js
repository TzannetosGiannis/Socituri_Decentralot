export const fetchCampaigns = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/campaigns/crowdfunding`);
    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('campaigns', data)
    return data;
};
