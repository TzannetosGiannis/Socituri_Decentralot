import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faTrophy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useCurrentAccount } from '@mysten/dapp-kit';

const LotteriesTable = ({ lotteries }) => {

    console.log({ lotteries })
    const currentAccount = useCurrentAccount();

    const handleClaimPrize = (round) => {
        console.log(`Claiming prize for round ${round}`);
        // Implement the logic to claim the prize here
    };

    const shouldShowActionColumn = lotteries.some(lottery => 
        !lottery.claimed && lottery.winner_address === currentAccount?.address
    );

    return (
        <div className="lotteries-table my-8 bg-gray-800 text-white">
            <h2 className="text-2xl lg:text-4xl font-bold text-center mb-8">Previous Lotteries</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg">
                    <thead className="bg-gray-700 text-center">
                        <tr>
                            <th className="py-3 px-4">Round</th>
                            <th className="py-3 px-4">Prize</th>
                            <th className="py-3 px-4">Winning Ticket</th>
                            <th className="py-3 px-4">Claimed</th>
                            {shouldShowActionColumn && (
                                <th className="py-3 px-4">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {lotteries.map((lottery, index) => (
                            <tr key={index} className="text-center border-b border-gray-700">
                                <td className="py-3 px-4">
                                    <FontAwesomeIcon icon={faTicket} className="mr-2 text-indigo-500" />
                                    {lottery.round}
                                </td>
                                <td className="py-3 px-4">
                                    <FontAwesomeIcon icon={faTrophy} className="mr-2 text-yellow-500" />
                                    {lottery.prize} SUI
                                </td>
                                <td className="py-3 px-4">{lottery.winning_ticket}</td>
                                <td className="py-3 px-4">
                                    {lottery.claimed ? (
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                                    ) : (
                                        <span className="text-red-500">No</span>
                                    )}
                                </td>
                                {shouldShowActionColumn && (
                                    <td className="py-3 px-4">
                                        {!lottery.claimed && lottery.winner_address === currentAccount?.address && (
                                            <button
                                                onClick={() => handleClaimPrize(lottery.round)}
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                                            >
                                                Claim Prize
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LotteriesTable;
