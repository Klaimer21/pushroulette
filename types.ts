export enum BetType {
  NUMBER = 'NUMBER',
  COLOR = 'COLOR',
  PARITY = 'PARITY', // Even/Odd
  RANGE = 'RANGE' // 1-18, 19-36
}

export enum Color {
  RED = 'RED',
  BLACK = 'BLACK',
  GREEN = 'GREEN'
}

export interface Bet {
  id: string;
  type: BetType;
  value: string | number; // "RED", 17, "EVEN"
  amount: number;
}

export interface RouletteNumber {
  number: number;
  color: Color;
}

export type GameStatus = 'IDLE' | 'SPINNING' | 'RESULT';

export interface HistoryItem {
  number: number;
  color: Color;
  timestamp: number;
}
