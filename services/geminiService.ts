import { GoogleGenAI, Type } from "@google/genai";
import type { UserData, CoreNumbers, CompoundNumbers, WorldClassReport, LoshuAnalysis, ChatMessage } from '../types';
import { generateLoshuGrid, calculateNameNumbers } from './numerologyService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const coreNumberSchema = {
    type: Type.OBJECT,
    properties: {
        number: { type: Type.INTEGER },
        compound: { type: Type.INTEGER },
        interpretation: { type: Type.STRING }
    },
    required: ['number', 'interpretation']
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        cosmicIdentity: {
            type: Type.OBJECT,
            properties: {
                coreNumbers: {
                    type: Type.OBJECT,
                    properties: {
                        lifePath: coreNumberSchema,
                        expression: coreNumberSchema,
                        soulUrge: coreNumberSchema,
                        personality: coreNumberSchema,
                        maturity: coreNumberSchema,
                    },
                    required: ['lifePath', 'expression', 'soulUrge', 'personality', 'maturity']
                },
                soulSynopsis: { type: Type.STRING, description: "A 100-word poetic summary of the user's destiny essence." },
                famousParallels: { type: Type.STRING, description: "2-3 historical/famous figures with same core numbers and a brief explanation." },
                planetaryRulerships: { type: Type.STRING, description: "Analysis of the planetary rulers for their core numbers." },
            },
            required: ['coreNumbers', 'soulSynopsis', 'famousParallels', 'planetaryRulerships']
        },
        loshuAnalysis: {
             type: Type.OBJECT,
             properties: {
                elementalPlanes: {
                    type: Type.OBJECT,
                    properties: {
                        mental: { type: Type.STRING, description: "Analysis of the mental plane (4-9-2)." },
                        emotional: { type: Type.STRING, description: "Analysis of the emotional plane (3-5-7)." },
                        practical: { type: Type.STRING, description: "Analysis of the practical plane (8-1-6)." },
                    },
                    required: ['mental', 'emotional', 'practical']
                },
                balanceSummary: { type: Type.STRING, description: "A summary of the grid's balance, strengths and weaknesses." },
                compensationStrategy: { type: Type.STRING, description: "Actionable strategies for balancing missing numbers." }
             },
             required: ['elementalPlanes', 'balanceSummary', 'compensationStrategy']
        },
        wealthBusinessCareer: { type: Type.STRING, description: "Pillar 3. In-depth analysis formatted in Markdown. Cover Business Alignment, Career Domains, Money Frequency, and Timing Cycles." },
        healthEnergyWellness: { type: Type.STRING, description: "Pillar 4. In-depth analysis formatted in Markdown. Cover Planetary Health Zones, Energy Imbalances, and Healing Recommendations." },
        relationshipsFamilyLegacy: { type: Type.STRING, description: "Pillar 5. In-depth analysis formatted in Markdown. Cover Partner Compatibility, Family Influence, and Karmic Lessons." },
        psychologyShadowWork: { type: Type.STRING, description: "Pillar 6. In-depth analysis formatted in Markdown. Cover Inner Traps, Self-Sabotage Patterns, and Healing Missing Numbers." },
        dailyNavigator: { type: Type.STRING, description: "Pillar 7. A 7-day tactical guide formatted in Markdown. For each day, provide a Power Code (Color, Number, Action)." },
        spiritualAlignment: { type: Type.STRING, description: "Pillar 8. In-depth analysis formatted in Markdown. Cover Mantras, Crystals, Colors, and Lucky Dates." },
        intellectEducation: { type: Type.STRING, description: "Pillar 9. In-depth analysis formatted in Markdown. Cover Learning Style, Creative Intelligence, and Ideal Study Domains." },
        futureForecast: {
            type: Type.OBJECT,
            properties: {
                personalYear: {
                    type: Type.OBJECT,
                    properties: {
                        number: { type: Type.INTEGER },
                        interpretation: { type: Type.STRING, description: "Detailed interpretation of their Personal Year number." }
                    },
                    required: ['number', 'interpretation']
                },
                strategicRoadmap: { type: Type.STRING, description: "A summary for the next 12 months based on their personal year, formatted in Markdown." },
            },
            required: ['personalYear', 'strategicRoadmap']
        }
    },
    required: [
        'cosmicIdentity', 'loshuAnalysis', 'wealthBusinessCareer', 'healthEnergyWellness', 'relationshipsFamilyLegacy',
        'psychologyShadowWork', 'dailyNavigator', 'spiritualAlignment', 'intellectEducation', 'futureForecast'
    ]
};


export const generateWorldClassReport = async (
    userData: UserData,
    coreNumbers: CoreNumbers,
    compoundNumbers: CompoundNumbers,
    // Fix: Corrected the type of 'loshu' to only include the properties being passed.
    loshu: Pick<LoshuAnalysis, 'missingNumbers' | 'overloadedNumbers'>
): Promise<WorldClassReport> => {
  const { fullName, dob } = userData;

  const prompt = `
  Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence, following the Machuni Hub Framework.
  Your persona is inspiring, precise, and deeply personalized, blending mysticism with entrepreneurial insight.
  The user wants their "FULL LIFE REPORT BLUEPRINT". Generate a comprehensive, 10-pillar report based on their data.
  The output MUST be a valid JSON object that adheres to the provided schema.
  All text content, especially interpretations and markdown sections, must be insightful, empowering, personalized, and actionable.

  **USER DATA:**
  - Full Name: "${fullName}"
  - Date of Birth: "${dob}"

  **CALCULATED NUMEROLOGY DATA:**
  - Life Path Number: ${coreNumbers.lifePath} (from compound ${compoundNumbers.lifePath})
  - Expression Number: ${coreNumbers.expression} (from compound ${compoundNumbers.expression})
  - Soul Urge Number: ${coreNumbers.soulUrge} (from compound ${compoundNumbers.soulUrge})
  - Personality Number: ${coreNumbers.personality} (from compound ${compoundNumbers.personality})
  - Maturity Number: ${coreNumbers.maturity} (from compound ${compoundNumbers.maturity})
  - Personal Year Number: ${coreNumbers.personalYear}
  - Loshu Grid Missing Numbers: ${loshu.missingNumbers.join(', ') || 'None'}
  - Loshu Grid Overloaded Numbers: ${loshu.overloadedNumbers.join(', ') || 'None'}

  Now, generate the complete JSON report. For each core number, provide a deep, multi-paragraph interpretation covering spiritual, psychological, and practical aspects for leadership, business, and relationships. For all markdown pillars, provide rich, detailed content with clear headings (e.g., using **Heading**).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    // Fix: Corrected misleading comment. The .text property holds the string content.
    // The Gemini API returns a stringified JSON object that needs to be parsed.
    const responseText = response.text;
    const reportData = JSON.parse(responseText);

    const { grid, missing, overloaded } = generateLoshuGrid(dob);
    
    // Combine AI generated data with programmatically generated data
    const fullReport: WorldClassReport = {
        ...reportData,
        loshuAnalysis: {
            grid: grid,
            missingNumbers: missing,
            overloadedNumbers: overloaded,
            ...reportData.loshuAnalysis
        }
    };

    return fullReport;

  } catch (error) {
    console.error("Error generating world-class report:", error);
    throw new Error("Failed to generate the complete numerology report. The cosmic energies are currently unstable. Please try again.");
  }
};


export const getLoshuNumberInterpretation = async (
  number: number,
  isMissing: boolean,
  userName: string,
  dob: string
): Promise<string> => {
  const presence = isMissing ? 'missing from their Loshu grid' : 'present in their Loshu grid';
  const instruction = isMissing
    ? 'Explain the challenge this missing number represents and offer a practical, empowering suggestion (e.g., an activity, mindset shift, or focus area) to cultivate and balance this energy. Keep it concise.'
    : 'Explain the positive influence and inherent strength this number provides to their personality and life path. Keep it concise.';

  const prompt = `Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence. Your persona is inspiring, precise, and deeply personalized.
  User's Full Name: "${userName}"
  User's Date of Birth: "${dob}"

  The number in question is ${number}, which is ${presence}.

  Provide a brief, insightful interpretation (2-3 sentences max). ${instruction}
  Focus on actionable advice. Do not use markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching interpretation for Loshu number ${number}:`, error);
    return `Failed to generate an interpretation for number ${number}. Please try again.`;
  }
};

export const analyzeBrandName = async (
  businessName: string,
  userName: string,
  userLifePath: number,
  userExpression: number
): Promise<string> => {
    const brandNumbers = calculateNameNumbers(businessName);
    const prompt = `
    Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence, focusing on business and entrepreneurship.
    Your persona is inspiring, precise, and deeply personalized.

    **USER & BRAND DATA:**
    - User's Name: "${userName}"
    - User's Core Numbers: Life Path ${userLifePath}, Expression ${userExpression}.
    - Business Name to Analyze: "${businessName}"
    - Business Name's Calculated Numbers: Expression ${brandNumbers.expression} (from compound ${brandNumbers.compoundExpression}), Soul Urge ${brandNumbers.soulUrge} (from compound ${brandNumbers.compoundSoulUrge}).

    **TASK:**
    Provide a concise yet comprehensive "Brand Vibration Analysis". Your response must be in Markdown format and include the following sections with these exact headings:

    1.  **Vibrational Alignment Score:** Provide a percentage score (e.g., "88%") that represents the overall compatibility between the business name and the user's core numbers. Follow it with a single-word summary (e.g., Excellent, Good, Moderate, Challenging).
    2.  **Detailed Analysis:** In 3-4 sentences, explain the synergy or friction. How does the business name's energy support or challenge the user's natural path and expression?
    3.  **Actionable Insights:** Provide 2-3 bullet points of actionable advice based on this alignment. For example, suggest marketing strategies, ideal client avatars, or potential brand messaging angles that leverage the combined energies.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error analyzing brand name "${businessName}":`, error);
        return `### Analysis Error\nFailed to analyze the vibrational alignment for "${businessName}". The cosmic frequencies may be disturbed. Please try again shortly.`;
    }
};

export const getChatResponse = async (
    history: ChatMessage[],
    question: string,
    report: WorldClassReport,
    userData: UserData
): Promise<string> => {
    // We can omit parts of the report if context gets too long, but for now send everything.
    const reportContext = JSON.stringify(report);

    const prompt = `
    You are Vidhira AI, a wise, inspiring, and precise numerology chat companion.
    Your personality is a blend of a mystical mentor and a sharp-witted entrepreneur's guide.
    You are having a conversation with ${userData.fullName}.
    You MUST answer based on the user's comprehensive numerology report provided below in JSON format.
    Your goal is to provide actionable, personalized decision support.
    Keep your answers conversational, insightful, and reasonably concise. Do not use markdown.

    **USER'S FULL NUMEROLOGY REPORT (CONTEXT):**
    ${reportContext}

    **CONVERSATION HISTORY:**
    ${history.map(msg => `${msg.sender === 'user' ? 'User' : 'Vidhira'}: ${msg.text}`).join('\n')}

    **LATEST USER QUESTION:**
    ${question}

    Now, provide your response as Vidhira AI.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        return "I'm sorry, I'm having trouble connecting to the cosmic energies right now. Please ask your question again in a moment.";
    }
};

export const getYearlyForecast = async (
  mulank: number,
  userName: string
): Promise<string> => {
  const prompt = `
  Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence.
  Your persona is inspiring, precise, and deeply insightful.

  **USER DATA:**
  - Name: "${userName}"
  - Mulank (Primary Birth Number, from day of birth): ${mulank}

  **TASK:**
  Generate a detailed and personalized "Yearly Forecast" for this user for the year 2026. The forecast must be based on their Mulank (${mulank}). Your response must be in Markdown format and include the following sections:

  1.  **Mulank ${mulank} Energy for 2026:** A summary of the overarching themes, opportunities, and challenges for individuals with Mulank ${mulank} in 2026.
  2.  **Personalized Monthly Predictions (2026):** Provide a month-by-month breakdown (Jan-Dec). For each month, give a concise paragraph of insight covering career, relationships, and health.
  3.  **Strategic Warnings & Opportunities:** Create a bulleted list of 3-4 key warnings (e.g., "Be cautious with investments in April") and 3-4 key opportunities (e.g., "A powerful networking opportunity arises in September").
  4.  **Beyond 2026:** Briefly touch upon the energetic trends for 2027-2028 for Mulank ${mulank}.

  Ensure the tone is empowering and provides actionable advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching yearly forecast for Mulank ${mulank}:`, error);
    return `### Forecast Error\nFailed to generate the yearly forecast. The cosmic connection is currently unstable. Please try again.`;
  }
};
