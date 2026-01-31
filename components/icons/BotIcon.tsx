
import React from 'react';

export const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
        <path d="M12 18c4.411 0 8-3.589 8-8h-2c0 3.309-2.691 6-6 6s-6-2.691-6-6H4c0 4.411 3.589 8 8 8z"></path>
        <path d="M12 6c-3.309 0-6 2.691-6 6h2c0-2.206 1.794-4 4-4s4 1.794 4 4h2c0-3.309-2.691-6-6-6z"></path>
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
    </svg>
);
