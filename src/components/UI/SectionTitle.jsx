import React from 'react';

export const SectionTitle = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-blue rounded-lg text-white shadow-lg shadow-blue-200">
                <Icon size={22} strokeWidth={2} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{title}</h2>
                {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
            </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
);

