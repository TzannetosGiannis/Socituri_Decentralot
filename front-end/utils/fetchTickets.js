export const fetchTickets = async (account, campaignId, round) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/tickets/${account.address}/${campaignId}/${round}`);
    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('tickets', data);
    return data;
};
