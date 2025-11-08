// --- User & Core Data ---
export interface UserData {
  fullName: string;
  dob: string;
  time: string;
  location: string;
  gender: string;
  language: string;
  phoneNumber: string;
  email: string;
}

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

export interface CoreNumberInfo {
  number: number;
  compound?: number;
  interpretation: string;
  planetaryRuler?: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

// --- Report Pillars & Sub-components ---

export interface PillarContent {
  teaser: string;
  content: string;
}

export interface KundaliSnapshot {
  ascendant: string;
  moonSign: string;
  sunSign: string;
  summary: string;
}

export interface CosmicIdentityPillar {
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

export interface LoshuAnalysisPillar {
  grid: (string | null)[][];
  missingNumbers: number[];
  overloadedNumbers: number[];
  planes: {
    mental: PillarContent;
    emotional: PillarContent;
    practical: PillarContent;
    thought: PillarContent;
    will: PillarContent;
    action: PillarContent;
    determination: PillarContent;
    spiritual: PillarContent;
  };
  balanceSummary: PillarContent;
  compensationStrategy: PillarContent;
}

export interface CompatibilityPairing {
  compatibleNumber: number;
  interpretation: string;
}

export interface RelationshipsPillar extends PillarContent {
  compatibilityAnalysis: {
    lifePath: CompatibilityPairing[];
    expression: CompatibilityPairing[];
    soulUrge: CompatibilityPairing[];
  };
}

export interface SpiritualAlignmentPillar extends PillarContent {
  luckyColor: string;
  mantrasAndAffirmations: string[];
}

export interface FutureForecastPillar {
  personalYear: CoreNumberInfo;
  strategicRoadmap: PillarContent;
}

export interface MethodologyPillar {
  ayanamsa: string;
  houseSystem: string;
  numerologyMethod: string;
  disclaimer: string;
}

// --- Jyotish (Vedic Astrology) ---

export interface PlanetaryPlacement {
  planet: string;
  sign: string;
  house: number;
}

export interface PlanetaryStrength {
  planet: string;
  score: number; // A score from 0-100
  summary: string;
}

export interface JyotishReportData {
  markdownReport: string;
  planetaryPlacements: PlanetaryPlacement[];
  ascendantSign: string;
  grahaBala: PlanetaryStrength[];
}

// --- Brand Analyzer V2 ---

export interface BrandColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    explanation: string;
}

export interface BrandNameSuggestion {
    name: string;
    available: boolean;
}

export interface FortuneCompanyComparison {
    companyName: string;
    companyVibration: number;
    synergyAnalysis: string;
}

export interface BrandAnalysisV2 {
    brandExpressionNumber: number;
    vibrationalAlignmentScore: number;
    detailedAnalysis: string;
    brandArchetype: string;
    expressionNumberExplanation: string;
    colorPalette: BrandColorPalette;
    socialMediaHandles: BrandNameSuggestion[];
    domainSuggestions: BrandNameSuggestion[];
    fortuneCompanyComparison: FortuneCompanyComparison[];
    contentStrategy: string;
    nameSuggestions: string[];
}

export interface PhoneNumberAnalysis {
    vibrationNumber: number;
    analysis: string;
    isFavorable: boolean;
}

export interface CompetitorBrandAnalysis {
    competitorName: string;
    competitorVibration: number;
    comparisonAnalysis: string;
}

export interface LogoAnalysis {
  logoVibrationNumber: number;
  synergyAnalysis: string;
  logoTypeSuggestion: string;
  fontSuggestions: string[];
  generatedLogoUrl: string;
}


// --- Main Report Structure ---

export interface WorldClassReport {
  kundaliSnapshot: KundaliSnapshot;
  cosmicIdentity: CosmicIdentityPillar;
  loshuAnalysis: LoshuAnalysisPillar;
  wealthBusinessCareer: PillarContent;
  healthEnergyWellness: PillarContent;
  relationshipsFamilyLegacy: RelationshipsPillar;
  psychologyShadowWork: PillarContent;
  dailyNavigator: PillarContent;
  spiritualAlignment: SpiritualAlignmentPillar;
  intellectEducation: PillarContent;
  futureForecast: FutureForecastPillar;
  methodology: MethodologyPillar;
}

// --- Task Manager ---
// Fix: Add missing Task interface.
export interface Task {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
}