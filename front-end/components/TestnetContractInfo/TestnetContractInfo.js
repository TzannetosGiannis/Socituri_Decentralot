import React from 'react';

const TestnetContractInfo = () => {
    const contractInfo = [
        { label: 'PACKAGE_ID', value: '0x8db09a6e61c6ea8ea1e4c4676120d6e772871ea006bbbee7c2481cd24c88b51d' },
        { label: 'ADMIN_CAP', value: '0xf0d35843150e5e613ab33de5becc7a79363e37acea30773a854ee293240a320f' },
        { label: 'CONFIG', value: '0xc1671c4ec98c6aabc4aa340fc4dfd8ca02ca2d348cc56d202d3fe4f5927bac4b' },
        { label: 'FEE_DISTRIBUTION', value: '0x0b6466366cd09266ea94f0ae9bd5a50219349768e7073f3682aa1290232c0652' },
        { label: 'INCENTIVE_TREASURY', value: '0x86d6ef94ea1050e49f4dbbc96fe2db182fefb5431c43b2e72f82a9e4a711f744' },
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
