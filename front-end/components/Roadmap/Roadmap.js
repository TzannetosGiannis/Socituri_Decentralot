import React from 'react';

const Roadmap = () => {
    // Define an array of roadmap phases and their respective tasks
    const phases = [
        {
            phase: "Phase 1",
            name: "Genesis",
            color: "#FF6B6B",
            tasks: [
                { name: "Trail of Bits audit", done: true },
                { name: "Lending alpha launch", done: true },
                { name: "Lending analytics", done: true }
            ]
        },
        {
            phase: "Phase 2",
            name: "Expansion",
            color: "#4FD1C5",
            tasks: [
                { name: "Lending mainnet launch", done: true },
                { name: "Nostra Points launch", done: true },
                { name: "Nostra Pools launch", done: true },
                { name: "Nostra Swap launch", done: true },
                { name: "Nostra mobile support", done: true },
                { name: "DeFi Spring", done: true },
                { name: "Nostra Staked STRK", done: true },
                { name: "UNO stablecoin", done: true },
                { name: "Nostra Bridge launch", done: false },
                { name: "Permissionless pool deployment", done: false }
            ]
        },
        {
            phase: "Phase 3",
            name: "Momentum",
            color: "#FFD166",
            tasks: [
                { name: "Nostra iOS App", done: false },
                { name: "Continue partnerships and integrations", done: false },
                { name: "Prepaid credit card integration", done: false },
                { name: "Famiglia Hackathon", done: false },
                { name: "AI integration", done: false },
                { name: "Embedded wallet", done: false },
                { name: "Governance", done: false }
            ]
        }
        // Add more phases as needed
    ];

    return (
        <div id='roadmap' className="bg-gray-800 py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-4xl lg:text-5xl font-bold text-center mb-8 lg:mb-12">ROADMAP</div>
                <div className="text-xl lg:text-2xl font-semibold text-center mb-8 lg:mb-12">The road ahead</div>
                {/* Map through each phase and render tasks */}
                <div className="grid grid-cols-3 gap-8">
                    {phases.map((phase, index) => (
                        <div key={index}>
                            {/* Phase tag */}
                            <div className="flex items-center mb-2">
                                <div className={`rounded-full px-2 py-1 text-sm text-center mr-2`} style={{ backgroundColor: phase.color, color: 'white' }}>{phase.phase}</div>
                                <div className={`text-2xl lg:text-3xl font-bold`} style={{ color: phase.color }}>{phase.name}</div>
                            </div>
                            {/* Separator line */}
                            <div className={`border-t border-gray-300 mb-4`} style={{ borderColor: phase.color }}></div>
                            {/* List of tasks */}
                            <div className="grid grid-cols-1 gap-2">
                                {phase.tasks.map((task, idx) => (
                                    <div key={idx} className="flex items-center">
                                        {/* Task status checkbox */}
                                        <div style={{ backgroundColor: task.done ? phase.color : 'white', color: 'white' }} className={`w-6 h-6 rounded-sm mr-2 flex items-center justify-center`}>
                                            {task.done && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>}
                                        </div>
                                        {/* Task title */}
                                        <div className={`text-lg ${task.done ? 'line-through text-gray-500' : ''}`}>{task.name}</div>
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
