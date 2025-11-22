
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

export interface KarmicDebtNumbers {
  lifePath: number | null;
  expression: number | null;
  soulUrge: number | null;
  personality: number | null;
  maturity: number | null;
}

export interface CoreNumberInfo {
  number: number;
  compound?: number;
  karmicDebt?: number;
  interpretation: string;
  planetaryRuler?: string;
  journalPrompt?: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

// --- Report Pillars & Sub-components ---

export interface PillarContent {
  teaser: string;
  content: string;
  journalPrompt?: string;
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
  friendlyAndEnemyNumbers: PillarContent;
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

// --- Jyotish (Vedic Astrology) Deep Dive ---

export interface NakshatraInfo {
  name: string;
  lord: string; // The planetary ruler
  pada: number; // 1, 2, 3, 4
  quality: string; // e.g., "Deva (Divine)", "Manushya (Human)"
  summary: string;
}

export interface PlanetaryPlacement {
  planet: string;
  sign: string;
  house: number;
  nakshatra?: string; // e.g., "Ashwini"
  nakshatraLord?: string; // e.g., "Ketu"
  degree?: string; // e.g., "12° 45'"
  isRetrograde?: boolean;
}

export interface PlanetaryStrength {
  planet: string;
  score: number; // A score from 0-100
  summary: string;
}

export interface SoulPurpose {
  atmakaraka: {
    planet: string;
    significance: string;
    pastLifeWounds: string; // Enhanced: Past life wounds/tendencies
  };
  karmicAxis: {
    rahuPlacement: string; // e.g., "5th House in Leo"
    ketuPlacement: string; // e.g., "11th House in Aquarius"
    lifeLesson: string; // The core lesson to learn in this life
    repeatingPatterns: string; // Enhanced: Patterns user repeats
  };
  dharma: string; // The real reason for birth
  d60Memory: string; // Enhanced: Past life karmic memory from D60
  childhoodAnalysis: string; // Enhanced: 0-12 years emotional summary
}

export interface DashaPeriod {
  currentMahadasha: string; // e.g., "Jupiter"
  currentAntardasha: string; // e.g., "Saturn"
  endDate: string; // When this sub-period ends
  analysis: string; // What this period means for the user NOW
}

export interface LifeCyclePhase {
    ageRange: string;
    cycleName: string; // e.g. "Mars Cycle (Action & Ego)"
    theme: string;
    prediction: string;
}

export interface KeyLifeEvent {
    age: number;
    year: number;
    category: string; // e.g. "Career", "Love", "Wealth"
    eventDescription: string;
}

export interface ActionableGuidance {
    bestActions: string[]; // "When to take action"
    remedies: string[]; // Vedic remedies
    pitfalls: string[]; // "What to avoid"
}

export interface DetailedRemedy {
  planet: string;
  reason: string; // Why this planet needs remedy (e.g. "Debilitated in 8th house")
  mantra: string;
  gemstone: {
    name: string;
    instruction: string; // e.g. "Wear on middle finger on Saturday"
  };
  charity: string; // Donation suggestion
  behavioralCorrection: string; // Lifestyle change
}

export interface JyotishReportData {
  markdownReport: string; // Detailed text
  planetaryPlacements: PlanetaryPlacement[];
  ascendantSign: string;
  ascendantNakshatra: NakshatraInfo;
  moonNakshatra: NakshatraInfo; // Janma Nakshatra
  grahaBala: PlanetaryStrength[];
  soulPurpose: SoulPurpose;
  currentPeriod: DashaPeriod;
  // New Deep Dive Sections
  futureTimeline: LifeCyclePhase[];
  keyEvents: KeyLifeEvent[];
  guidance: ActionableGuidance;
  detailedRemedies: DetailedRemedy[];
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

// --- Cosmic Calendar ---
export interface CalendarDayInsight {
  day: number;
  rating: 'good' | 'medium' | 'bad';
  title: string;
  advice: string;
}

// --- Task Manager ---
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}
