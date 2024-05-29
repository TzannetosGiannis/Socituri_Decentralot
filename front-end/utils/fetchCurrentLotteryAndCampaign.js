export const fetchCurrentLotteryAndCampaign = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/campaigns/main`
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};
