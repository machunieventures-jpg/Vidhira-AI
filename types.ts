
export interface UserData {
  fullName: string;
  dob: string;
  time: string;
  location: string;
  gender: string;
  language: string;
}

// Pillar 1: Cosmic Identity
export interface CoreNumberInfo {
  number: number;
  compound?: number;
  interpretation: string;
}

export interface CosmicIdentity {
  coreNumbers: {
    lifePath: CoreNumberInfo;
    expression: CoreNumberInfo;
    soulUrge: CoreNumberInfo;
    personality: CoreNumberInfo;
    maturity: CoreNumberInfo;
  };
  soulSynopsis: string;
  famousParallels: string;
  planetaryRulerships: string;
}

// Pillar 2: Loshu Grid & Numeric Matrix
export interface LoshuAnalysis {
  grid: (number | null)[][];
  missingNumbers: number[];
  overloadedNumbers: number[];
  elementalPlanes: {
      mental: string;
      emotional: string;
      practical: string;
  };
  balanceSummary: string;
  compensationStrategy: string;
}

// Pillar 10: Advanced Future Forecast
export interface FutureForecast {
  personalYear: {
    number: number;
    interpretation: string;
  };
  strategicRoadmap: string; // Markdown text
}

// Main Report Structure
export interface WorldClassReport {
  cosmicIdentity: CosmicIdentity;
  loshuAnalysis: LoshuAnalysis;
  wealthBusinessCareer: string; // Markdown text for Pillar 3
  healthEnergyWellness: string; // Markdown text for Pillar 4
  relationshipsFamilyLegacy: string; // Markdown text for Pillar 5
  psychologyShadowWork: string; // Markdown text for Pillar 6
  dailyNavigator: string; // Markdown text for Pillar 7
  spiritualAlignment: string; // Markdown text for Pillar 8
  intellectEducation: string; // Markdown text for Pillar 9
  futureForecast: FutureForecast;
}

// Chat Companion
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}


// Keep old types for compatibility during transition if needed, though they are being replaced.
export interface CoreNumbers {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  maturity: number;
  personalYear: number;
}

export interface CompoundNumbers {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  maturity: number;
}