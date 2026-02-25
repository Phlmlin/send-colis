import React from 'react';

interface TrustBadgeProps {
    icon: React.ReactNode;
    text: string;
}

export const TrustBadge = ({ icon, text }: TrustBadgeProps) => {
    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 text-blue-600">
                {icon}
            </div>
            <span className="text-gray-700 font-medium">{text}</span>
        </div>
    );
};
