import React from 'react';

const TestnetContractInfo = () => {
    const contractInfo = [
        { label: 'PACKAGE_ID', value: '0x3c3a91a30e7b6a420558fa39a2592b7a33a0b667e6b4ea58efa140c4269adb27' },
        { label: 'ADMIN_CAP', value: '0x40f811d90c6f8a0554c54be4145387919533d0b5ec7845b2ee7577fe15f6633b' },
        { label: 'CONFIG', value: '0xcf860967b45e23ea18cbd5a7ba18f3608cac5478707539ae40eb639383e0c55c' },
        { label: 'FEE_DISTRIBUTION', value: '0x85d0a3d7837c52827267029dab09110824e137c2a463699be484e38d87349060' },
        { label: 'INCENTIVE_TREASURY', value: '0x8e962aac249c83bbe7f46eb4414f2150de9772b88d2b166c98269313ad7f1d2b' },
    ];

    return (
        <div className="testnet-contract-info bg-gray-800 text-white">
            <h2 className="text-2xl lg:text-4xl font-bold text-center mb-8">Testnet Contract Information</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg">
                    <thead className="bg-gray-700 text-center">
                        <tr>
                            <th className="py-3 px-4">Label</th>
                            <th className="py-3 px-4">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contractInfo.map((info, index) => (
                            <tr key={index} className="text-center border-b border-gray-700">
                                <td className="py-3 px-4">{info.label}</td>
                                <td className="py-3 px-4">{info.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TestnetContractInfo;
