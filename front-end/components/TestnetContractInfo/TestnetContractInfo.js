import React from 'react';

const TestnetContractInfo = () => {
    const contractInfo = [
        { label: 'PACKAGE_ID', value: '0xff820a72e725cb117437b8108a895ac6decf6f0ecd1ca98129516e0654124a1c' },
        { label: 'ADMIN_CAP', value: '0x86210a1a6ade8326cd95fda9653e26142518eff599d33e84190457c1ec1d2715' },
        { label: 'CONFIG', value: '0x05f1e1750e4d2799ed36cc1fc2c07e0118b1a6f22b5e2afaa5e41d3169dd0c96' },
        { label: 'FEE_DISTRIBUTION', value: '0xbfd9df3883f65e399f9829e0352d43853b0cf389a57b760a83571bab5231c968' },
        { label: 'INCENTIVE_TREASURY', value: '0x300fd7bd984857fb44638f3d59bd6578b3f42732cd930f951163c7330b5255f0' },
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
