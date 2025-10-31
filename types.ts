

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

// Section 2: Personal Core Numbers
export interface CoreNumberInfo {
  number: number;
  compound?: number;
  interpretation: string;
}

export interface PersonalCoreNumbersPillar {
  teaser: string;
  content: {
    expression: CoreNumberInfo;
    soulUrge: CoreNumberInfo;
    personality: CoreNumberInfo;
    lifePath: CoreNumberInfo;
    hiddenSubconscious: CoreNumberInfo;
    compoundNumbersAnalysis: string;
  };
}

// Section 4: Loshu Grid
export interface LoshuAnalysisPillar {
    grid: (string | null)[][];
    missingNumbers: number[];
    overloadedNumbers: number[];
    elementalPlanes: {
      mental: PillarContent;
      emotional: PillarContent;
      practical: PillarContent;
    },
    balanceSummary: PillarContent;
    compensationStrategy: PillarContent;
}


// Section 8: Spiritual Alignment
export interface SpiritualAlignmentPillar {
  teaser: string;
  content: string;
  luckyColor: string;
  mantrasAndAffirmations: string[];
}

// Compatibility Analysis
export interface CompatibilityPairing {
    compatibleNumber: number;
    interpretation: string;
}

export interface CompatibilityAnalysis {
    lifePath: CompatibilityPairing[];
    expression: CompatibilityPairing[];
    soulUrge: CompatibilityPairing[];
}

// Kundali Snapshot
export interface KundaliSnapshot {
    ascendant: string;
    moonSign: string;
    sunSign: string;
    summary: string;
}

// Main Report Structure
export interface WorldClassReport {
  kundaliSnapshot: KundaliSnapshot;
  cosmicIdentity: {
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
  };
  loshuAnalysis: LoshuAnalysisPillar;
  wealthBusinessCareer: PillarContent;
  healthEnergyWellness: PillarContent;
  relationshipsFamilyLegacy: PillarContent & {
    compatibilityAnalysis: CompatibilityAnalysis;
  };
  psychologyShadowWork: PillarContent;
  dailyNavigator: PillarContent;
  spiritualAlignment: SpiritualAlignmentPillar;
  intellectEducation: PillarContent;
  futureForecast: {
    personalYear: CoreNumberInfo;
    strategicRoadmap: PillarContent;
  };
}


// Chat Companion
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

// Core calculation types
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

// Jyotish Report Types
export interface PlanetaryPlacement {
  planet: string;
  sign: string;
  house: number;
}

export interface JyotishReportData {
  markdownReport: string;
  planetaryPlacements: PlanetaryPlacement[];
  ascendantSign: string; // The user's ascendant sign (e.g., "Aries")
}