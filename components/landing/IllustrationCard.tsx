import React from 'react';

interface IllustrationCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: 'blue' | 'green' | 'indigo';
    children?: React.ReactNode;
}

export const IllustrationCard = ({ icon, title, subtitle, color, children }: IllustrationCardProps) => {
    const colorClasses = {
        blue: {
            bg: "bg-blue-100",
            text: "text-blue-600"
        },
        green: {
            bg: "bg-green-100",
            text: "text-green-600"
        },
        indigo: {
            bg: "bg-indigo-100",
            text: "text-indigo-600"
        }
    };

    const colors = colorClasses[color];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className={`flex items-center gap-4 ${children ? 'mb-4' : ''}`}>
                <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <div className={`${colors.text} w-6 h-6`}>
                        {icon}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{title}</p>
                    <p className="text-sm text-gray-600 truncate">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    );
};
