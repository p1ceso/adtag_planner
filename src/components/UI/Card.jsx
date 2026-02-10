import React from 'react';

export const Card = ({ children, className = "", noPadding = false }) => (
    <div className={`glass-panel rounded-3xl overflow-hidden border-white/5 ${className}`}>
        <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
);

