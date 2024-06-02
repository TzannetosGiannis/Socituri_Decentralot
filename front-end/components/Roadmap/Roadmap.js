import React from 'react';

const Roadmap = () => {
    // Define an array of roadmap phases and their respective tasks
    const phases = [
        {
            phase: "Phase 1",
            name: "Genesis",
            color: "#e95833",
            tasks: [
                { name: "Developed Contracts", done: true },
                { name: "Launch Dapp v1", done: true },
                { name: "Deployment on testnet", done: true },
                { name: "Contract audits", done: false }
            ]
        },
        {
            phase: "Phase 2",
            name: "Launch",
            color: "#e9b333",
            tasks: [
                { name: "Launch Dapp v2 on mainet", done: false },
                { name: "Reward early supporters", done: false },
                { name: "Decentralot Points launch", done: false },
                { name: "Secure incentives from partners", done: false },
                { name: "Permissionless lottery launchpad", done: false },
                { name: "Democratize protocol fees to community", done: false },
            ]
        },
        {
            phase: "Phase 3",
            name: "Momentum",
            color: "#3d85c6",
            tasks: [
                { name: "Strategic ecosystem partnerships", done: false },
                { name: "Design tokenomics", done: false },
                { name: "DAO launch", done: false },
            ]
        }
        // Add more phases as needed
    ];

    return (
        <div id='roadmap' className="bg-gray-800 py-8 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-3xl lg:text-4xl font-bold text-center text-white mb-4 lg:mb-8">ROADMAP</div>
                <div className="text-lg lg:text-xl font-semibold text-center text-white mb-4 lg:mb-8">The road ahead</div>
                {/* Map through each phase and render tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {phases.map((phase, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-4 lg:p-6">
                            {/* Phase tag */}
                            <div className="flex items-center mb-2">
                                <div className={`rounded-full px-2 py-1 text-sm text-center mr-2`} style={{ backgroundColor: phase.color, color: 'white' }}>{phase.phase}</div>
                                <div className={`text-xl lg:text-2xl font-bold`} style={{ color: phase.color }}>{phase.name}</div>
                            </div>
                            {/* List of tasks */}
                            <div className="mt-2">
                                {phase.tasks.map((task, idx) => (
                                    <div key={idx} className="flex items-center mb-2">
                                        {/* Task status checkbox */}
                                        <div className={`w-6 h-6 mr-2 rounded-full flex items-center justify-center ${task.done ? 'bg-green-500' : 'bg-gray-400'}`}>
                                            {task.done && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>}
                                        </div>
                                        {/* Task title */}
                                        <div className={`text-base ${task.done ? 'line-through text-gray-500' : 'text-white'}`}>{task.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Roadmap;
