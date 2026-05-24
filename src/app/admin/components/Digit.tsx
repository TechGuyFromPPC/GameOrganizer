// FILE: src/app/admin/components/Digit.tsx
'use client';

import React from 'react';

interface DigitProps {
  digit: number | string;
  color?: string; // Optional: Allows custom colors like cyan, amber, etc.
}

const Digit: React.FC<DigitProps> = ({ digit, color }) => {
  const digitMap: { [key: string]: boolean[] } = {
    '0': [true, true, true, false, true, true, true],
    '1': [false, false, true, false, false, true, false],
    '2': [true, false, true, true, true, false, true],
    '3': [true, false, true, true, false, true, true],
    '4': [false, true, true, true, false, true, false],
    '5': [true, true, false, true, false, true, true],
    '6': [true, true, false, true, true, true, true],
    '7': [true, false, true, false, false, true, false],
    '8': [true, true, true, true, true, true, true],
    '9': [true, true, true, true, false, true, true],
    ':': [false, false, false, false, false, false, false], // Placeholder for colon
    '-': [false, false, false, true, false, false, false], // Optional: for minus sign
  };

  const segments = digitMap[String(digit)] || digitMap['0']; // Default to '0' if digit not found
  
  // Use provided color or default based on digit
  const segmentColor = color || (digit === ':' ? '#44D' : '#FFD700'); 

  return (
    <div className="digit-container relative aspect-[3/4] grid grid-cols-[1fr,3fr,1fr] grid-rows-[1fr,3fr,1fr,3fr,1fr] gap-[1%] bg-[#1a1a1a] p-[1%] rounded-sm">
      
      {/* Top Segment */}
      <div className={`segment col-start-2 row-start-1 h-[2%] ${segments[0] ? 'visible' : 'invisible'}`} style={{ backgroundColor: segmentColor }}/>

      {/* Top Left, Top Right */}
      <div className={`segment col-start-1 row-start-2 w-[2%] ${segments[1] ? 'visible' : 'invisible'}`} style={{ backgroundColor: segmentColor }}/>
      <div className={`segment col-start-3 row-start-2 w-[2%] ${segments[2] ? 'visible' : 'invisible'}`} style={{ backgroundColor: segmentColor }}/>

      {/* Middle Segment */}
      <div className={`segment col-start-2 row-start-3 h-[2%] ${segments[3] ? 'visible' : 'invisible'}`} style={{ backgroundColor: segmentColor }}/>

      {/* Bottom Left, Bottom Right */}
      <div className={`segment col-start-1 row-start-4 w-[2%] ${segments[4] ? 'visible' : 'invisible'}`} style={{ backgroundColor: segmentColor }}/>
      <div className={`segment col-start-3 row-start-4 w-[2%] ${segments[5] ? 'visible' : 'invisible'}`} style={{ backgroundColor: segmentColor }}/>

      {/* Bottom Segment */}
      <div className={`segment col-start-2 row-start-5 h-[2%] ${segments[6] ? 'visible' : 'invisible'}`} style={{ backgroundColor: segmentColor }}/>

      {/* Colon placeholder */}
      {digit === ':' && (
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-4xl" style={{ color: '#00F' }}>:</div>
      )}

    </div>
  );
};

export default Digit;