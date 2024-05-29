export const fetchPreviousLotteries = async (campaign = "main") => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/campaigns/${campaign}`);
    console.log(response)
    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.previousLotteries;
};
