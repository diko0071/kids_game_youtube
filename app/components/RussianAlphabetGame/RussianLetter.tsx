"use client"

import React from 'react';

interface RussianLetterProps {
    letter: string;
    color: string;
    scale?: number;
}

export const RussianLetter: React.FC<RussianLetterProps> = ({ 
    letter, 
    color, 
    scale = 1 
}): JSX.Element => {
    return (
        <div 
            style={{ 
                backgroundColor: color,
                width: `${100 * scale}px`,
                height: `${100 * scale}px`,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: `${48 * scale}px`,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
            }}
            className="hover:transform hover:scale-110"
        >
            {letter}
        </div>
    );
}; 