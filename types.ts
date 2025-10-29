
export interface UserData {
  fullName: string;
  dob: string;
  time: string;
  location: string;
  gender: string;
  language: string;
  phoneNumber: string;
}

export interface PillarContent {
  teaser: string;
  content: string;
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
  soulSynopsis: PillarContent;
  famousParallels: PillarContent;
  planetaryRulerships: PillarContent;
}

// Pillar 2: Loshu Grid & Numeric Matrix
export interface LoshuAnalysis {
  grid: (number | null)[][];
  missingNumbers: number[];
  overloadedNumbers: number[];
  elementalPlanes: {
      mental: PillarContent;
      emotional: PillarContent;
      practical: PillarContent;
  };
  balanceSummary: PillarContent;
  compensationStrategy: PillarContent;
}

// Pillar 8: Spiritual Alignment
export interface SpiritualAlignmentPillar {
    teaser: string;
    content: string;
    luckyColor: string;
}


// Pillar 10: Advanced Future Forecast
export interface FutureForecast {
  personalYear: {
    number: number;
    interpretation: string;
  };
  strategicRoadmap: PillarContent;
}

// Main Report Structure
export interface WorldClassReport {
  cosmicIdentity: CosmicIdentity;
  loshuAnalysis: LoshuAnalysis;
  wealthBusinessCareer: PillarContent;
  healthEnergyWellness: PillarContent;
  relationshipsFamilyLegacy: PillarContent;
  psychologyShadowWork: PillarContent;
  dailyNavigator: PillarContent;
  spiritualAlignment: SpiritualAlignmentPillar;
  intellectEducation: PillarContent;
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