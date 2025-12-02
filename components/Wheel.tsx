import React, { useEffect, useState, useRef } from 'react';
import { WHEEL_NUMBERS, NUMBER_COLORS } from '../constants';
import { Color } from '../types';

interface WheelProps {
  spinning: boolean;
  resultNumber: number | null;
  onSpinComplete: () => void;
}

const Wheel: React.FC<WheelProps> = ({ spinning, resultNumber, onSpinComplete }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Calculate segment angle
  const segmentAngle = 360 / WHEEL_NUMBERS.length;

  useEffect(() => {
    if (spinning && resultNumber !== null) {
      // Find index of the result number
      const resultIndex = WHEEL_NUMBERS.indexOf(resultNumber);
      
      // We want the result to be at the TOP (0 degrees)
      // If index 0 is at 0 deg, index 1 is at -segmentAngle deg.
      // Target rotation is such that current rotation + extra spins + alignment lands correctly.
      
      const numberOfSpins = 5;
      const targetAngle = -(resultIndex * segmentAngle); 
      // Add randomness within the segment for realism? Simplified here to center.
      
      const currentRotationMod = rotation % 360;
      const totalRotation = rotation + (360 * numberOfSpins) + (targetAngle - currentRotationMod);
      
      setRotation(totalRotation);

      const timer = setTimeout(() => {
        onSpinComplete();
      }, 5000); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [spinning, resultNumber, onSpinComplete, rotation, segmentAngle]);

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-lg"></div>
      
      {/* Outer Rim */}
      <div className="w-full h-full rounded-full border-8 border-gray-800 bg-gray-900 shadow-[0_0_50px_rgba(116,58,213,0.3)] relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.1, 0, 0.2, 1)"
           style={{ transform: `rotate(${rotation}deg)` }}
           ref={wheelRef}>
        
        {WHEEL_NUMBERS.map((num, index) => {
          const angle = index * segmentAngle;
          const color = NUMBER_COLORS[num];
          let bgColor = '#171717';
          if (color === Color.RED) bgColor = '#dc2626';
          if (color === Color.GREEN) bgColor = '#059669';

          return (
            <div
              key={num}
              className="absolute top-0 left-1/2 h-1/2 w-[28px] -ml-[14px] origin-bottom pt-2 text-center"
              style={{
                transform: `rotate(${angle}deg)`,
              }}
            >
              <div 
                className="h-full w-full"
                style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                    backgroundColor: bgColor
                }}
              >
                  <span className="block pt-2 text-white font-bold text-xs transform scale-x-[-1]" style={{ writingMode: 'vertical-rl' }}>{num}</span>
              </div>
            </div>
          );
        })}
        
        {/* Center Cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-surface-card border-4 border-gray-700 z-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-push-pink to-push-purple animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Wheel;
