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

const pillarContentSchema = {
    type: Type.OBJECT,
    properties: {
        teaser: { type: Type.STRING, description: "A 1-2 sentence compelling teaser for this pillar." },
        content: { type: Type.STRING, description: "The full, in-depth markdown analysis for this pillar." }
    },
    required: ['teaser', 'content']
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
                soulSynopsis: pillarContentSchema,
                famousParallels: pillarContentSchema,
                planetaryRulerships: pillarContentSchema,
            },
            required: ['coreNumbers', 'soulSynopsis', 'famousParallels', 'planetaryRulerships']
        },
        loshuAnalysis: {
             type: Type.OBJECT,
             properties: {
                elementalPlanes: {
                    type: Type.OBJECT,
                    properties: {
                        mental: pillarContentSchema,
                        emotional: pillarContentSchema,
                        practical: pillarContentSchema,
                    },
                    required: ['mental', 'emotional', 'practical']
                },
                balanceSummary: pillarContentSchema,
                compensationStrategy: pillarContentSchema
             },
             required: ['elementalPlanes', 'balanceSummary', 'compensationStrategy']
        },
        wealthBusinessCareer: pillarContentSchema,
        healthEnergyWellness: pillarContentSchema,
        relationshipsFamilyLegacy: pillarContentSchema,
        psychologyShadowWork: pillarContentSchema,
        dailyNavigator: pillarContentSchema,
        spiritualAlignment: {
            type: Type.OBJECT,
            properties: {
                 teaser: { type: Type.STRING, description: "A 1-2 sentence compelling teaser for this pillar." },
                 content: { type: Type.STRING, description: "Pillar 8. In-depth analysis formatted in Markdown. Cover Mantras, Crystals, Colors, and Lucky Dates." },
                 luckyColor: { type: Type.STRING, description: "Based on the user's core numbers, determine their single most powerful lucky color. Provide this as a standard HEX color code string (e.g., '#3A0CA3'). This color should feel empowering and aligned with their core energy." }
            },
            required: ['teaser', 'content', 'luckyColor']
        },
        intellectEducation: pillarContentSchema,
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
                strategicRoadmap: pillarContentSchema,
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
    loshu: Pick<LoshuAnalysis, 'missingNumbers' | 'overloadedNumbers'>
): Promise<WorldClassReport> => {
  const { fullName, dob, time, location, gender, language, phoneNumber } = userData;

  const prompt = `
  Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence, following the Machuni Hub Framework.
  Your persona is inspiring, precise, and deeply personalized, blending mysticism with entrepreneurial insight.
  Your entire response, including all text, interpretations, and markdown content, MUST be in ${language}.
  The user wants their "FULL LIFE REPORT BLUEPRINT". Generate a comprehensive, 10-pillar report based on their data.
  The output MUST be a valid JSON object that adheres to the provided schema.
  
  **IMPORTANT**: For every pillar or sub-pillar that has a 'teaser' and 'content' field in the schema, you MUST provide both. 
  - The 'teaser' must be a short, 1-2 sentence summary designed to entice the user to unlock the full report.
  - The 'content' must be the full, detailed analysis as originally requested.

  **USER DATA:**
  - Full Name: "${fullName}"
  - Date of Birth: "${dob}"
  - Time of Birth: "${time}"
  - Location of Birth: "${location}"
  - Gender: "${gender}"
  - Phone Number: "${phoneNumber}"
  - Preferred Language: "${language}"

  **CALCULATED NUMEROLOGY DATA:**
  - Life Path Number: ${coreNumbers.lifePath} (from compound ${compoundNumbers.lifePath})
  - Expression Number: ${coreNumbers.expression} (from compound ${compoundNumbers.expression})
  - Soul Urge Number: ${coreNumbers.soulUrge} (from compound ${compoundNumbers.soulUrge})
  - Personality Number: ${coreNumbers.personality} (from compound ${compoundNumbers.personality})
  - Maturity Number: ${coreNumbers.maturity} (from compound ${compoundNumbers.maturity})
  - Personal Year Number: ${coreNumbers.personalYear}
  - Loshu Grid Missing Numbers: ${loshu.missingNumbers.join(', ') || 'None'}
  - Loshu Grid Overloaded Numbers: ${loshu.overloadedNumbers.join(', ') || 'None'}

  Now, generate the complete JSON report. For each core number, provide a deep, multi-paragraph interpretation. For all markdown pillars, provide rich, detailed content with clear headings (e.g., using **Heading**). For 'relationshipsFamilyLegacy', include detailed sections on marriage and childbirth timing. For 'spiritualAlignment', determine their primary lucky color and provide its hex code. Remember to generate a 'teaser' for every pillar.
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
  dob: string,
  language: string
): Promise<string> => {
  const presence = isMissing ? 'missing from their Loshu grid' : 'present in their Loshu grid';
  const instruction = isMissing
    ? 'Explain the challenge this missing number represents and offer a practical, empowering suggestion (e.g., an activity, mindset shift, or focus area) to cultivate and balance this energy. Keep it concise.'
    : 'Explain the positive influence and inherent strength this number provides to their personality and life path. Keep it concise.';

  const prompt = `Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence. Your persona is inspiring, precise, and deeply personalized.
  The response MUST be in ${language}.
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
  userExpression: number,
  language: string
): Promise<string> => {
    const brandNumbers = calculateNameNumbers(businessName);
    const prompt = `
    Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence, focusing on business and entrepreneurship.
    Your persona is inspiring, precise, and deeply personalized.
    Your response MUST be in ${language} and formatted in Markdown.

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
    const reportContext = JSON.stringify(report);

    const prompt = `
    You are Vidhira AI, a wise, inspiring, and precise numerology chat companion.
    The entire conversation and all your responses MUST be in ${userData.language}.
    You are having a conversation with ${userData.fullName}.

    **Primary Directive:** Your responses MUST be deeply personalized by cross-referencing the user's latest question with BOTH their full numerology report (provided below) and the preceding conversation history. Do not provide generic answers. Your goal is to provide actionable, personalized decision support directly related to their unique data.

    Keep your answers conversational, insightful, and reasonably concise. Do not use markdown.
    **Crucially, end your response by proactively asking a follow-up question or suggesting another area of their report to explore, encouraging further conversation. For example: "Does that resonate with you?" or "Would you like to explore how this connects to your Wealth pillar?"**

    **USER'S FULL NUMEROLOGY REPORT (CONTEXT):**
    ${reportContext}
    
    **USER'S PERSONAL DATA (CONTEXT):**
    - Date of Birth: ${userData.dob}
    - Time of Birth: ${userData.time}
    - Location of Birth: ${userData.location}
    - Gender: ${userData.gender}
    - Preferred Language: ${userData.language}


    **CONVERSATION HISTORY:**
    ${history.map(msg => `${msg.sender === 'user' ? 'User' : 'Vidhira'}: ${msg.text}`).join('\n')}

    **LATEST USER QUESTION:**
    User: ${question}

    Now, provide your response as Vidhira AI, following your primary directive.
    Vidhira:
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
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
  userName: string,
  language: string
): Promise<string> => {
  const prompt = `
  Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence.
  Your persona is inspiring, precise, and deeply insightful.
  Your response MUST be in ${language} and formatted in Markdown.

  **USER DATA:**
  - Name: "${userName}"
  - Mulank (Primary Birth Number, from day of birth): ${mulank}

  **TASK:**
  Generate a detailed and personalized "Yearly Forecast" for this user for the year 2026. The forecast must be based on their Mulank (${mulank}). Your response must be in Markdown format and include the following sections:

  1.  **Mulank ${mulank} Energy for 2026:** A summary of the overarching themes, opportunities, and challenges for individuals with Mulank ${mulank} in 2026.
  2.  **Personalized Monthly Predictions (2026):** Provide a month-by-month breakdown (Jan-Dec). For each month, provide a detailed paragraph covering the following sub-topics, using them as bolded subheadings:
      - **Career & Finance:** Go into detail about career advancement opportunities (e.g., promotions, new job prospects), and financial trends (e.g., investment opportunities, periods for financial caution).
      - **Relationships & Compatibility:** Provide specific insights into relationship compatibility with other numbers. Discuss energies affecting romantic partnerships, family dynamics, and social life.
      - **Health & Wellness:** Detail potential health considerations (e.g., stress-related issues, physical vulnerabilities) and suggest targeted wellness practices or preventative measures.
      - **Key Dates:** Identify 2-3 specific dates within the month. For each date, explain *why* it is significant (e.g., "12th: Excellent for financial decisions due to Jupiter's influence") and label it as either auspicious or requiring caution.
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

export const getDailyHoroscope = async (
  mulank: number,
  userName: string,
  language: string
): Promise<string> => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
  Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence.
  Your persona is inspiring, precise, and deeply insightful.
  Your response MUST be in ${language} and formatted in Markdown.

  **USER DATA:**
  - Name: "${userName}"
  - Mulank (Primary Birth Number): ${mulank}

  **TASK:**
  Generate a personalized "Daily Horoscope" for this user for today, ${today}.
  The horoscope must be based on their Mulank (${mulank}) and the current date's vibrations.
  Your response must be in Markdown format and include the following sections with these exact headings:

  1.  **Today's Vibe:** A one-sentence summary of the day's energy.
  2.  **Career & Finance:** A brief, actionable tip for their professional life.
  3.  **Relationships:** A piece of advice for interactions with others.
  4.  **Health & Wellness:** A small suggestion for self-care.
  5.  **Cosmic Tip-Off:** A final piece of empowering advice for the day.
  6.  **Today's Power Code:** Provide a lucky number and a lucky color for the day.

  Keep each section very concise (1-2 sentences). The tone should be positive and empowering.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching daily horoscope for Mulank ${mulank}:`, error);
    return `### Horoscope Error\nFailed to receive today's cosmic transmission. Please try again in a moment.`;
  }
};