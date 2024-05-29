export const fetchCurrentLotteryId = async (campaign = "main") => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/campaigns/${campaign}`);
    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.current_lottery_id;
};
