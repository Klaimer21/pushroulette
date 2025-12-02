import React from 'react';
import { NUMBER_COLORS } from '../constants';
import { BetType, Color, Bet } from '../types';

interface BettingBoardProps {
  onPlaceBet: (type: BetType, value: string | number) => void;
  currentBets: Bet[];
  disabled: boolean;
}

const BettingBoard: React.FC<BettingBoardProps> = ({ onPlaceBet, currentBets, disabled }) => {
  
  const getBetAmount = (type: BetType, value: string | number) => {
    const bet = currentBets.find(b => b.type === type && b.value === value);
    return bet ? bet.amount : 0;
  };

  const renderNumberBtn = (num: number) => {
    const color = NUMBER_COLORS[num];
    let bgClass = 'bg-roulette-black hover:bg-gray-800';
    if (color === Color.RED) bgClass = 'bg-roulette-red hover:bg-red-700';
    if (color === Color.GREEN) bgClass = 'bg-roulette-green hover:bg-emerald-700';

    const amount = getBetAmount(BetType.NUMBER, num);

    return (
      <button
        key={num}
        onClick={() => !disabled && onPlaceBet(BetType.NUMBER, num)}
        disabled={disabled}
        className={`${bgClass} relative h-12 w-full flex items-center justify-center text-white font-display font-bold border border-gray-800 rounded transition-all active:scale-95 disabled:opacity-50`}
      >
        {num}
        {amount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            {amount}
          </span>
        )}
      </button>
    );
  };

  // Generate grid numbers 1-36
  const gridNumbers = Array.from({ length: 36 }, (_, i) => i + 1);
  // Rows for standard layout (3 rows)
  const rows = [
    gridNumbers.filter(n => n % 3 === 0).reverse(), // 3, 6, 9...
    gridNumbers.filter(n => n % 3 === 2).reverse(), // 2, 5, 8...
    gridNumbers.filter(n => n % 3 === 1).reverse(), // 1, 4, 7...
  ];

  // Fix: standard roulette board usually has 3 rows: 
  // Row 1: 3, 6, 9...
  // Row 2: 2, 5, 8...
  // Row 3: 1, 4, 7...
  // However, rendering visually often goes 1-36 sequentially if mobile. 
  // Let's do a simple grid for responsiveness.

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-surface-card rounded-xl border border-gray-800 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-2">
        {/* Zero */}
        <div className="md:w-16 flex-shrink-0">
           {renderNumberBtn(0)}
        </div>

        {/* Numbers Grid */}
        <div className="flex-grow grid grid-cols-6 md:grid-cols-12 gap-1">
           {Array.from({length: 36}, (_, i) => i + 1).map(num => renderNumberBtn(num))}
        </div>
      </div>

      {/* Outside Bets */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <button 
          onClick={() => !disabled && onPlaceBet(BetType.RANGE, '1-18')}
          disabled={disabled}
          className="h-12 bg-surface-dark border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 rounded disabled:opacity-50 relative"
        >
          1 - 18
          {getBetAmount(BetType.RANGE, '1-18') > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full"></span>}
        </button>
        
        <button 
          onClick={() => !disabled && onPlaceBet(BetType.PARITY, 'EVEN')}
          disabled={disabled}
          className="h-12 bg-surface-dark border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 rounded disabled:opacity-50 relative"
        >
          EVEN
          {getBetAmount(BetType.PARITY, 'EVEN') > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full"></span>}
        </button>

        <button 
          onClick={() => !disabled && onPlaceBet(BetType.COLOR, 'RED')}
          disabled={disabled}
          className="h-12 bg-red-900/50 border border-red-800 text-red-100 font-bold hover:bg-red-900 rounded disabled:opacity-50 relative"
        >
          RED
          {getBetAmount(BetType.COLOR, 'RED') > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full"></span>}
        </button>

        <button 
          onClick={() => !disabled && onPlaceBet(BetType.COLOR, 'BLACK')}
          disabled={disabled}
          className="h-12 bg-gray-900 border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 rounded disabled:opacity-50 relative"
        >
          BLACK
          {getBetAmount(BetType.COLOR, 'BLACK') > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full"></span>}
        </button>

        <button 
          onClick={() => !disabled && onPlaceBet(BetType.RANGE, '19-36')}
          disabled={disabled}
          className="h-12 bg-surface-dark border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 rounded disabled:opacity-50 relative"
        >
          19 - 36
          {getBetAmount(BetType.RANGE, '19-36') > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full"></span>}
        </button>

        <button 
          onClick={() => !disabled && onPlaceBet(BetType.PARITY, 'ODD')}
          disabled={disabled}
          className="h-12 bg-surface-dark border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 rounded disabled:opacity-50 relative"
        >
          ODD
          {getBetAmount(BetType.PARITY, 'ODD') > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full"></span>}
        </button>
      </div>
    </div>
  );
};

export default BettingBoard;
