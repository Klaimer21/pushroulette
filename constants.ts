import { RouletteNumber, Color } from './types';

// American Roulette (0, 00) or European (0)? Let's go European (Single 0) for better odds
export const WHEEL_NUMBERS: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const NUMBER_COLORS: Record<number, Color> = {
  0: Color.GREEN,
  1: Color.RED, 2: Color.BLACK, 3: Color.RED, 4: Color.BLACK, 5: Color.RED, 6: Color.BLACK,
  7: Color.RED, 8: Color.BLACK, 9: Color.RED, 10: Color.BLACK, 11: Color.BLACK, 12: Color.RED,
  13: Color.BLACK, 14: Color.RED, 15: Color.BLACK, 16: Color.RED, 17: Color.BLACK, 18: Color.RED,
  19: Color.RED, 20: Color.BLACK, 21: Color.RED, 22: Color.BLACK, 23: Color.RED, 24: Color.BLACK,
  25: Color.RED, 26: Color.BLACK, 27: Color.RED, 28: Color.BLACK, 29: Color.BLACK, 30: Color.RED,
  31: Color.BLACK, 32: Color.RED, 33: Color.BLACK, 34: Color.RED, 35: Color.BLACK, 36: Color.RED
};

export const getRouletteData = (): RouletteNumber[] => {
  return WHEEL_NUMBERS.map(num => ({
    number: num,
    color: NUMBER_COLORS[num]
  }));
};
