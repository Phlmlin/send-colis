import React from 'react';

interface FeatureStepProps {
    step: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}

export const FeatureStep = ({ step, title, description, icon, index }: FeatureStepProps) => {
    return (
        <div
            className="glass rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                <div className="w-8 h-8">
                    {icon}
                </div>
            </div>
            <div className="text-sm font-bold text-blue-600 mb-2">ÉTAPE {step}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};
