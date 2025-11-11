import { CHALDEAN_MAP, VOWELS } from '../constants';
import type { UserData, CoreNumbers, CompoundNumbers, KarmicDebtNumbers } from '../types';

const getCompoundNumber = (num: number): number => {
    let sum = num;
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum;
}

export const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) return num;
  let sum = num;
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    if (sum === 11 || sum === 22 || sum === 33) return sum;
  }
  return sum;
};

const getKarmicDebtNumber = (compoundNumber: number): number | null => {
    const karmicDebtNumbers = [13, 14, 16, 19];
    if (karmicDebtNumbers.includes(compoundNumber)) {
        return compoundNumber;
    }
    return null;
};

const calculateNameSum = (name: string, characterSet: 'all' | 'vowels' | 'consonants'): number => {
  const lowerCaseName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  for (const char of lowerCaseName) {
    const isVowel = VOWELS.includes(char);
    if (characterSet === 'all' || (characterSet === 'vowels' && isVowel) || (characterSet === 'consonants' && !isVowel)) {
      sum += CHALDEAN_MAP[char] || 0;
    }
  }
  return sum;
};

export const calculateNameNumbers = (name: string): { expression: number; soulUrge: number; compoundExpression: number; compoundSoulUrge: number; } => {
    const expressionSum = calculateNameSum(name, 'all');
    const soulUrgeSum = calculateNameSum(name, 'vowels');
    return {
        expression: reduceNumber(expressionSum),
        soulUrge: reduceNumber(soulUrgeSum),
        compoundExpression: getCompoundNumber(expressionSum),
        compoundSoulUrge: getCompoundNumber(soulUrgeSum)
    };
};

const calculateLifePathSum = (dob: string): number => {
  const digits = dob.replace(/-/g, '');
  return digits.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
};

export const calculateInitialNumbers = (userData: UserData): { core: CoreNumbers, compound: CompoundNumbers, karmicDebt: KarmicDebtNumbers } => {
  const { fullName, dob } = userData;
  
  const lifePathSum = calculateLifePathSum(dob);
  const expressionSum = calculateNameSum(fullName, 'all');
  const soulUrgeSum = calculateNameSum(fullName, 'vowels');
  const personalitySum = calculateNameSum(fullName, 'consonants');
  const maturitySum = lifePathSum + expressionSum;

  const [year, month, day] = dob.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  const personalYearSum = day + month + currentYear;

  const compoundLifePath = getCompoundNumber(lifePathSum);
  const compoundExpression = getCompoundNumber(expressionSum);
  const compoundSoulUrge = getCompoundNumber(soulUrgeSum);
  const compoundPersonality = getCompoundNumber(personalitySum);
  const compoundMaturity = getCompoundNumber(maturitySum);

  return {
    core: {
      lifePath: reduceNumber(lifePathSum),
      expression: reduceNumber(expressionSum),
      soulUrge: reduceNumber(soulUrgeSum),
      personality: reduceNumber(personalitySum),
      maturity: reduceNumber(maturitySum),
      personalYear: reduceNumber(personalYearSum),
    },
    compound: {
      lifePath: compoundLifePath,
      expression: compoundExpression,
      soulUrge: compoundSoulUrge,
      personality: compoundPersonality,
      maturity: compoundMaturity,
    },
    karmicDebt: {
      lifePath: getKarmicDebtNumber(compoundLifePath),
      expression: getKarmicDebtNumber(compoundExpression),
      soulUrge: getKarmicDebtNumber(compoundSoulUrge),
      personality: getKarmicDebtNumber(compoundPersonality),
      maturity: getKarmicDebtNumber(compoundMaturity),
    }
  };
};

export const generateLoshuGrid = (dob: string, birthNumber?: number, destinyNumber?: number, kuaNumber?: number): { grid: (string | null)[][], missing: number[], overloaded: number[] } => {
    const dobDigits = dob.replace(/-/g, '').split('').map(Number);
    const specialNumbers = [birthNumber, destinyNumber, kuaNumber].filter((n): n is number => n !== undefined && n > 0 && n <= 9);
    const allDigits = [...dobDigits, ...specialNumbers];

    const gridMap: { [key: number]: number } = {
        4: 0, 9: 1, 2: 2,
        3: 3, 5: 4, 7: 5,
        8: 6, 1: 7, 6: 8
    };

    const flatGrid: (string | null)[] = Array(9).fill(null);
    const counts: { [key: number]: number } = {};

    allDigits.forEach(digit => {
        if (digit > 0 && digit <= 9) {
            counts[digit] = (counts[digit] || 0) + 1;
        }
    });

    Object.keys(counts).map(Number).forEach(digit => {
        if (gridMap[digit] !== undefined) {
             flatGrid[gridMap[digit]] = digit.toString().repeat(counts[digit]);
        }
    });

    const grid = [
        [flatGrid[0], flatGrid[1], flatGrid[2]],
        [flatGrid[3], flatGrid[4], flatGrid[5]],
        [flatGrid[6], flatGrid[7], flatGrid[8]]
    ];

    const presentNumbers = new Set(Object.keys(counts).map(Number));
    const missing: number[] = [];
    for (let i = 1; i <= 9; i++) {
        if (!presentNumbers.has(i)) {
            missing.push(i);
        }
    }

    const overloaded = Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([num]) => Number(num));

    return { grid, missing, overloaded };
};

export const calculateMulank = (dob: string): number => {
    const day = parseInt(dob.split('-')[2], 10);
    let sum = day;
    // Mulank is always reduced to a single digit (e.g., 29 -> 11 -> 2)
    while (sum > 9) {
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return sum;
};

export const calculateKuaNumber = (dob: string, gender: string): number => {
    const reduceToOneDigit = (n: number): number => {
        let sum = n;
        while (sum > 9) {
            sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
        }
        return sum;
    }

    const year = parseInt(dob.split('-')[0], 10);
    const lastTwoDigits = year % 100;
    const sumOfLastTwo = reduceToOneDigit(String(lastTwoDigits).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0));
    
    let kuaNumber: number;

    if (gender.toLowerCase() === 'male') {
        kuaNumber = (year < 2000) ? 10 - sumOfLastTwo : 9 - sumOfLastTwo;
    } else { // Female or Other
        kuaNumber = (year < 2000) ? 5 + sumOfLastTwo : 6 + sumOfLastTwo;
    }

    kuaNumber = reduceToOneDigit(kuaNumber);

    if (kuaNumber === 5) {
        return gender.toLowerCase() === 'male' ? 2 : 8;
    }
    
    if (kuaNumber === 0) {
        return 9;
    }

    return kuaNumber;
};
