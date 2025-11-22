
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { UserData, CoreNumbers, CompoundNumbers, KarmicDebtNumbers, WorldClassReport, LoshuAnalysisPillar, ChatMessage, JyotishReportData, MethodologyPillar, BrandAnalysisV2, PhoneNumberAnalysis, CompetitorBrandAnalysis, LogoAnalysis, CalendarDayInsight, CosmicIdentityPillar, RelationshipsPillar, PillarContent, SpiritualAlignmentPillar, FutureForecastPillar, KundaliSnapshot } from '../types';
import { calculateNameNumbers, reduceNumber } from './numerologyService';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Robustly extracts a JSON object or array from a string,
 * handling markdown code blocks and extraneous text.
 * @param text The text response from the AI model.
 * @returns The parsed JSON object or array.
 * @throws An error if JSON is not found or is invalid.
 */
function extractJson(text: string): any {
    let content = text.trim();
    
    // 1. Handle markdown code blocks first
    const match = content.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (match && match[2]) {
        content = match[2].trim();
        try {
            return JSON.parse(content);
        } catch (error) {
            console.error("Failed to parse JSON from markdown block:", content);
            throw new Error(`Model returned invalid JSON inside a markdown block. ${error}`);
        }
    }
    
    // 2. If no markdown, find the start of the JSON
    const jsonStart = content.search(/[[{]/);
    if (jsonStart === -1) {
        console.error("No JSON object or array found in the response string:", content);
        throw new Error("Model response did not contain a valid JSON object or array.");
    }
    
    // 3. Find the matching closing bracket using a simple depth counter
    const openChar = content[jsonStart];
    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 1;
    let inString = false;
    let jsonEnd = -1;

    for (let i = jsonStart + 1; i < content.length; i++) {
        const char = content[i];
        
        // This is a simplified check for strings. It doesn't handle escaped quotes perfectly
        // but is generally sufficient for extracting a JSON blob from surrounding text.
        if (char === '"' && content[i - 1] !== '\\') {
            inString = !inString;
        }

        if (inString) {
            continue;
        }

        if (char === openChar) {
            depth++;
        } else if (char === closeChar) {
            depth--;
            if (depth === 0) {
                jsonEnd = i;
                break; // Found the end
            }
        }
    }

    if (jsonEnd === -1) {
        console.error("Malformed JSON response, could not find closing bracket for:", content);
        throw new Error("Malformed JSON response: could not find a matching closing bracket.");
    }

    const jsonString = content.substring(jsonStart, jsonEnd + 1);

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse extracted JSON string:", jsonString);
        throw new Error(`Model returned invalid JSON. ${error}`);
    }
}

// --- COMMON PROMPT HELPERS ---

const ARVIND_SUD_PERSONA = (language: string) => `
Act as Arvind Sud, a world-renowned numerologist and cosmic scientist known for his professional, accurate, and deeply insightful analysis. Your framework, the Sud Numerology Matrix, blends the timeless wisdom of Chaldean numerology with modern, actionable strategies.
Your persona is inspiring, precise, and deeply personalized. You do not use fluffy or overly mystical language; your insights are direct, clear, and grounded in the energetic science of numbers.
Your entire response, including all text, interpretations, and markdown content, MUST be in ${language}.
The output MUST be a valid JSON object. Do not include any text before or after the JSON.

**CRITICAL INSTRUCTIONS:**
1.  **Strictly Chaldean:** Your entire numerological analysis MUST be based exclusively on the Chaldean system.
2.  **Terminology:** For key terms, provide the English term followed by its Sanskrit equivalent: \`(Sanskrit: term)\`.
3.  **Karmic Debt:** If a Karmic Debt Number is provided, you MUST interpret it within the 'interpretation' field.
4.  **AI Reflection Coach:** For EVERY 'content' field, you MUST generate a 'journalPrompt'.
5.  **Specificity:** For career/education, provide specific, actionable recommendations.
6.  **Teasers & Content:** For every pillar with a 'teaser' and 'content' field, provide both.
7.  **Planetary Rulers:** Populate the 'planetaryRuler' field based on the Chaldean system.
`;

const USER_DATA_BLOCK = (
  userData: UserData,
  coreNumbers: CoreNumbers,
  compoundNumbers: CompoundNumbers,
  karmicDebtNumbers: KarmicDebtNumbers
) => `
**USER DATA:**
- Full Name: "${userData.fullName}"
- Date of Birth: "${userData.dob}"
- Time of Birth: "${userData.time}"
- Location of Birth: "${userData.location}"
- Gender: "${userData.gender}"
- Preferred Language: "${userData.language}"

**CALCULATED NUMEROLOGY DATA (Chaldean Method):**
- Life Path Number: ${coreNumbers.lifePath} (from compound ${compoundNumbers.lifePath}) ${karmicDebtNumbers.lifePath ? `-> KARMIC DEBT: ${karmicDebtNumbers.lifePath}` : ''}
- Expression Number: ${coreNumbers.expression} (from compound ${compoundNumbers.expression}) ${karmicDebtNumbers.expression ? `-> KARMIC DEBT: ${karmicDebtNumbers.expression}` : ''}
- Soul Urge Number: ${coreNumbers.soulUrge} (from compound ${compoundNumbers.soulUrge}) ${karmicDebtNumbers.soulUrge ? `-> KARMIC DEBT: ${karmicDebtNumbers.soulUrge}` : ''}
- Personality Number: ${coreNumbers.personality} (from compound ${compoundNumbers.personality}) ${karmicDebtNumbers.personality ? `-> KARMIC DEBT: ${karmicDebtNumbers.personality}` : ''}
- Maturity Number: ${coreNumbers.maturity} (from compound ${compoundNumbers.maturity}) ${karmicDebtNumbers.maturity ? `-> KARMIC DEBT: ${karmicDebtNumbers.maturity}` : ''}
- Personal Year Number: ${coreNumbers.personalYear}
`;

const callGemini = async (prompt: string, pillarName: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { seed: 42 },
        });
        return extractJson(response.text);
    } catch (error) {
        console.error(`Error generating the ${pillarName} pillar:`, error);
        throw new Error(`Failed to generate the ${pillarName} section of the report.`);
    }
};

// --- PILLAR GENERATION FUNCTIONS ---

export const generateCosmicIdentityPillar = async (
    userData: UserData,
    coreNumbers: CoreNumbers,
    compoundNumbers: CompoundNumbers,
    karmicDebtNumbers: KarmicDebtNumbers
): Promise<CosmicIdentityPillar> => {
    const prompt = `
        ${ARVIND_SUD_PERSONA(userData.language)}
        ${USER_DATA_BLOCK(userData, coreNumbers, compoundNumbers, karmicDebtNumbers)}

        **TASK: GENERATE THE 'COSMIC IDENTITY' PILLAR JSON**
        Your response must be a single JSON object that strictly adheres to the provided schema.

        **JSON STRUCTURE INSTRUCTIONS:**
        1.  **Interpret Core Numbers:** Provide a deep, multi-paragraph 'interpretation' for each of the five core numbers (Life Path, Expression, Soul Urge, Personality, Maturity). The interpretation must be rich, personalized, use Markdown for formatting (bolding, lists), and MUST incorporate the Karmic Debt number if one is provided for that specific core number.
        2.  **Populate Data:** For each core number, correctly populate its 'number', 'compound', 'planetaryRuler', and any 'karmicDebt' value from the user data provided above.
        3.  **Generate Other Sections:** Also generate the 'soulSynopsis', 'famousParallels', and 'planetaryRulerships' sections. Each of these must be an object containing a 'teaser', detailed 'content', and a 'journalPrompt'.

        Return ONLY the complete JSON object for this pillar.
    `;
    
    const coreNumberInfoSchema = {
        type: Type.OBJECT,
        properties: {
            number: { type: Type.NUMBER, description: "The single-digit core number." },
            compound: { type: Type.NUMBER, description: "The two-digit number it was reduced from." },
            karmicDebt: { type: Type.NUMBER, nullable: true, description: "The Karmic Debt number (13, 14, 16, 19), if applicable." },
            interpretation: { type: Type.STRING, description: "A detailed, multi-paragraph interpretation of the number's meaning for the user." },
            planetaryRuler: { type: Type.STRING, description: "The Chaldean planetary ruler of the number (e.g., Sun, Moon)." },
            journalPrompt: { type: Type.STRING, description: "A thought-provoking reflective question for the user specifically about this number's energy in their life." },
        },
        required: ['number', 'compound', 'interpretation', 'planetaryRuler', 'journalPrompt'],
    };

    const pillarContentSchema = {
        type: Type.OBJECT,
        properties: {
            teaser: { type: Type.STRING, description: "A short, engaging one-sentence summary of the content." },
            content: { type: Type.STRING, description: "The full, detailed content for this section, using Markdown for formatting." },
            journalPrompt: { type: Type.STRING, description: "A thought-provoking journal prompt related to the content." },
        },
        required: ['teaser', 'content', 'journalPrompt'],
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            coreNumbers: {
                type: Type.OBJECT,
                properties: {
                    lifePath: coreNumberInfoSchema,
                    expression: coreNumberInfoSchema,
                    soulUrge: coreNumberInfoSchema,
                    personality: coreNumberInfoSchema,
                    maturity: coreNumberInfoSchema,
                },
                required: ['lifePath', 'expression', 'soulUrge', 'personality', 'maturity'],
            },
            soulSynopsis: pillarContentSchema,
            famousParallels: pillarContentSchema,
            planetaryRulerships: pillarContentSchema,
        },
        required: ['coreNumbers', 'soulSynopsis', 'famousParallels', 'planetaryRulerships'],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                seed: 42,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error generating the Cosmic Identity pillar:`, error);
        if (error instanceof SyntaxError) {
             throw new Error(`Model returned invalid JSON for Cosmic Identity pillar, even with a schema constraint.`);
        }
        throw new Error(`Failed to generate the Cosmic Identity section of the report. The model may have had an issue processing the request.`);
    }
};

export const generateRelationshipsPillar = async (
    userData: UserData,
    coreNumbers: CoreNumbers
): Promise<RelationshipsPillar> => {
    const prompt = `
        ${ARVIND_SUD_PERSONA(userData.language)}
        **USER DATA:**
        - Life Path Number: ${coreNumbers.lifePath}
        - Expression Number: ${coreNumbers.expression}
        - Soul Urge Number: ${coreNumbers.soulUrge}
        - Preferred Language: "${userData.language}"

        **TASK:** Generate the 'Relationships & Family' pillar.
        1.  Provide main 'teaser', 'content', and 'journalPrompt' for the pillar.
        2.  Generate the 'compatibilityAnalysis':
            - For Life Path, Expression, and Soul Urge numbers, identify compatible numbers (1-9).
            - For each pairing, provide a detailed, 3-4 sentence 'interpretation' explaining the synergy.
        3.  Generate the 'friendlyAndEnemyNumbers' content:
            - Provide a 'teaser', 'content' with a Markdown table of Friendly/Neutral/Enemy numbers based on the Destiny Number (${coreNumbers.lifePath}), and a 'journalPrompt'. Explain the reasoning based on Chaldean principles.
        
        Return ONLY the JSON object for this pillar adhering to the schema.
    `;

    const pairingSchema = {
        type: Type.OBJECT,
        properties: {
            compatibleNumber: { type: Type.NUMBER },
            interpretation: { type: Type.STRING },
        },
        required: ['compatibleNumber', 'interpretation'],
    };

    const pillarContentSchema = {
        type: Type.OBJECT,
        properties: {
            teaser: { type: Type.STRING },
            content: { type: Type.STRING },
            journalPrompt: { type: Type.STRING },
        },
        required: ['teaser', 'content', 'journalPrompt'],
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            teaser: { type: Type.STRING },
            content: { type: Type.STRING },
            journalPrompt: { type: Type.STRING },
            compatibilityAnalysis: {
                type: Type.OBJECT,
                properties: {
                    lifePath: { type: Type.ARRAY, items: pairingSchema },
                    expression: { type: Type.ARRAY, items: pairingSchema },
                    soulUrge: { type: Type.ARRAY, items: pairingSchema },
                },
                required: ['lifePath', 'expression', 'soulUrge'],
            },
            friendlyAndEnemyNumbers: pillarContentSchema
        },
        required: ['teaser', 'content', 'journalPrompt', 'compatibilityAnalysis', 'friendlyAndEnemyNumbers'],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                seed: 42,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error generating the Relationships pillar:`, error);
        throw new Error(`Failed to generate the Relationships section of the report.`);
    }
};

export const generateLoshuAnalysisPillar = async (
    userData: UserData,
    loshu: Pick<LoshuAnalysisPillar, 'missingNumbers' | 'overloadedNumbers'>
): Promise<Omit<LoshuAnalysisPillar, 'grid' | 'missingNumbers' | 'overloadedNumbers'>> => {
    const prompt = `
        ${ARVIND_SUD_PERSONA(userData.language)}
        **USER DATA:**
        - Loshu Grid Missing Numbers: ${loshu.missingNumbers.join(', ') || 'None'}
        - Loshu Grid Overloaded Numbers: ${loshu.overloadedNumbers.join(', ') || 'None'}
        - Preferred Language: "${userData.language}"

        **TASK:** Generate the analysis for the Loshu Grid pillar.
        Your response MUST be a JSON object with three top-level keys: "planes", "balanceSummary", and "compensationStrategy".
        
        1.  **"planes"**: An object containing keys for ALL EIGHT planes: "mental", "emotional", "practical", "thought", "will", "action", "determination", and "spiritual". Each of these must be an object with "teaser", "content", and "journalPrompt". For each, determine if it's complete/incomplete based on the missing numbers and provide an insightful interpretation in the 'content'.
        2.  **"balanceSummary"**: An object with "teaser", "content", and "journalPrompt".
        3.  **"compensationStrategy"**: An object with "teaser", "content", and "journalPrompt".
        
        Return ONLY the JSON object that strictly adheres to this structure.
    `;

    const pillarContentSchema = {
        type: Type.OBJECT,
        properties: {
            teaser: { type: Type.STRING },
            content: { type: Type.STRING },
            journalPrompt: { type: Type.STRING },
        },
        required: ['teaser', 'content', 'journalPrompt'],
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            planes: {
                type: Type.OBJECT,
                properties: {
                    mental: pillarContentSchema,
                    emotional: pillarContentSchema,
                    practical: pillarContentSchema,
                    thought: pillarContentSchema,
                    will: pillarContentSchema,
                    action: pillarContentSchema,
                    determination: pillarContentSchema,
                    spiritual: pillarContentSchema,
                },
                required: ['mental', 'emotional', 'practical', 'thought', 'will', 'action', 'determination', 'spiritual'],
            },
            balanceSummary: pillarContentSchema,
            compensationStrategy: pillarContentSchema,
        },
        required: ['planes', 'balanceSummary', 'compensationStrategy'],
    };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { 
                seed: 42,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        // The response text is already a guaranteed JSON string when a schema is used.
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error generating the Loshu Grid Analysis pillar:`, error);
        if (error instanceof SyntaxError) {
             // This case should be very rare with a schema, but good to have.
             throw new Error(`Model returned invalid JSON for Loshu Grid Analysis pillar, even with a schema constraint.`);
        }
        // Re-throw other errors (e.g., API errors) with context.
        throw new Error(`Failed to generate the Loshu Grid Analysis section of the report. The model may have had an issue processing the request.`);
    }
};

export const generateFutureForecastPillar = async (
    userData: UserData,
    coreNumbers: CoreNumbers,
    compoundNumbers: CompoundNumbers
): Promise<FutureForecastPillar> => {
    const prompt = `
        ${ARVIND_SUD_PERSONA(userData.language)}
        **USER DATA:**
        - Personal Year Number: ${coreNumbers.personalYear}
        - Life Path Number: ${coreNumbers.lifePath}
        - Expression Number: ${coreNumbers.expression}
        - Preferred Language: "${userData.language}"

        **TASK:** Generate the 'Future Forecast' pillar.
        1.  Generate the 'personalYear' object with 'number', 'compound', 'journalPrompt', and a deep 'interpretation'.
        2.  Generate the 'strategicRoadmap' with 'teaser', 'content', and 'journalPrompt'.
        Return ONLY the JSON object for this pillar.
    `;
    
    const coreNumberInfoSchema = {
        type: Type.OBJECT,
        properties: {
            number: { type: Type.NUMBER, description: "The single-digit core number." },
            compound: { type: Type.NUMBER, description: "The two-digit number it was reduced from." },
            karmicDebt: { type: Type.NUMBER, nullable: true, description: "The Karmic Debt number (13, 14, 16, 19), if applicable." },
            interpretation: { type: Type.STRING, description: "A detailed, multi-paragraph interpretation of the number's meaning for the user." },
            planetaryRuler: { type: Type.STRING, description: "The Chaldean planetary ruler of the number (e.g., Sun, Moon)." },
            journalPrompt: { type: Type.STRING, description: "A thought-provoking reflective question for the user specifically about this number's energy in their life." },
        },
        required: ['number', 'compound', 'interpretation', 'planetaryRuler', 'journalPrompt'],
    };

    const pillarContentSchema = {
        type: Type.OBJECT,
        properties: {
            teaser: { type: Type.STRING, description: "A short, engaging one-sentence summary of the content." },
            content: { type: Type.STRING, description: "The full, detailed content for this section, using Markdown for formatting." },
            journalPrompt: { type: Type.STRING, description: "A thought-provoking journal prompt related to the content." },
        },
        required: ['teaser', 'content', 'journalPrompt'],
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            personalYear: coreNumberInfoSchema,
            strategicRoadmap: pillarContentSchema
        },
        required: ['personalYear', 'strategicRoadmap']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                seed: 42,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error(`Error generating the Future Forecast pillar:`, error);
        throw new Error(`Failed to generate the Future Forecast section of the report.`);
    }
};

export const generateSpiritualAlignmentPillar = async (
    userData: UserData,
    coreNumbers: CoreNumbers
): Promise<SpiritualAlignmentPillar> => {
     const prompt = `
        ${ARVIND_SUD_PERSONA(userData.language)}
        **USER DATA:**
        - Core Numbers: Life Path ${coreNumbers.lifePath}, Expression ${coreNumbers.expression}
        - Preferred Language: "${userData.language}"

        **TASK:** Generate the 'Spiritual Alignment' pillar.
        1.  Provide main 'teaser', 'content', and 'journalPrompt'.
        2.  Determine a primary 'luckyColor' and provide its 6-digit hex code.
        3.  Generate an array of 2-3 personalized 'mantrasAndAffirmations'.
        Return ONLY the JSON object for this pillar.
    `;
    return callGemini(prompt, 'Spiritual Alignment');
};

export const generateSimplePillarContent = async (
    pillarName: string,
    userData: UserData,
    coreNumbers: CoreNumbers
): Promise<PillarContent> => {
     const prompt = `
        ${ARVIND_SUD_PERSONA(userData.language)}
        **USER DATA:**
        - Core Numbers: Life Path ${coreNumbers.lifePath}, Expression ${coreNumbers.expression}
        - Preferred Language: "${userData.language}"

        **TASK:** Generate the content for the "${pillarName}" pillar.
        - For 'Wealth & Career' and 'Intellect & Education', you must provide highly specific and actionable recommendations for industries, roles, or degrees.
        - The response should be a single JSON object with 'teaser', 'content', and 'journalPrompt'.
        Return ONLY the JSON object for this pillar.
    `;
    return callGemini(prompt, pillarName);
};

export const generateKundaliSnapshot = async (
    userData: UserData
): Promise<KundaliSnapshot> => {
    const prompt = `
        Act as a master Vedic Astrologer. Your response MUST be in ${userData.language}.
        **USER DATA:**
        - DOB: "${userData.dob}", Time: "${userData.time}", Location: "${userData.location}"

        **TASK:** Generate a "Vedic Kundali Snapshot".
        1.  Determine the Ascendant (Sanskrit: Lagna), Moon Sign (Sanskrit: Rashi), and Sun Sign.
        2.  Provide a concise, 2-3 sentence 'summary' synthesizing these three key placements.
        3.  Use Sanskrit terms where appropriate, e.g., (Sanskrit: Lagna).
        Return a single JSON object with 'ascendant', 'moonSign', 'sunSign', and 'summary'.
    `;
    return callGemini(prompt, 'Kundali Snapshot');
};

export const generateMethodologyPillar = async (
    language: string
): Promise<MethodologyPillar> => {
    const prompt = `
        **TASK:** Generate the 'Methodology' pillar content in the language: ${language}.
        - ayanamsa: "Lahiri"
        - houseSystem: "Placidus"
        - numerologyMethod: "Chaldean (Sud Numerology Matrix)"
        - disclaimer: "This Vidhira report is a digitally generated analysis for spiritual insight and personal development. It is not a substitute for professional advice in legal, medical, or financial matters. Major life decisions should be made in consultation with qualified experts. The guidance provided is intended to be empowering and supportive of your journey."
        Return a single JSON object with these fields.
    `;
    return callGemini(prompt, 'Methodology');
};


export const getLoshuNumberInterpretation = async (
  number: number,
  isMissing: boolean,
  isOverloaded: boolean,
  userName: string,
  dob: string,
  language: string
): Promise<string> => {
  const presence = isMissing
    ? 'missing from their Loshu grid'
    : isOverloaded
    ? 'overloaded (appears multiple times) in their Loshu grid'
    : 'present in their Loshu grid';

  const instruction = isMissing
    ? `Explain the challenge this missing number represents in one concise sentence. Then, provide a list of 2-3 distinct, highly specific, and actionable remedies to help cultivate its energy. Each remedy should be a practical daily or weekly practice. **You MUST format the remedies as a bulleted list under a bolded heading like this: '**Remedies:**'**. For example, for a missing 1 (leadership), you might suggest:\n'**Remedies:**\n* Take the lead on a small project at work this week.\n* Make one decision for yourself each day without seeking others' opinions.'`
    : isOverloaded
    ? `This number is "overloaded" (appears multiple times) for this user. Explain the AMPLIFIED influence of this energy. Describe both the intensified strengths and potential challenges or extremes they should be aware of due to this strong presence. Be concise.`
    : `Explain the positive influence and inherent strength this number provides when it's present. Keep the interpretation focused on its balanced, positive qualities. Be concise.`;

  const prompt = `Act as Arvind Sud, the renowned numerologist. Your persona is precise and insightful.
  The response MUST be in ${language}.
  User's Full Name: "${userName}"
  User's Date of Birth: "${dob}"

  The number in question is ${number}, which is ${presence}.

  Provide a brief, insightful interpretation (2-4 sentences max) using simple Markdown for bolding. ${instruction}
  Focus on actionable advice or deep insight.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        seed: 42,
      },
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching interpretation for Loshu number ${number}:`, error);
    return `Failed to generate an interpretation for number ${number}. Please try again.`;
  }
};

export const getCoreIdentifierInterpretation = async (
  number: number,
  type: 'Birth' | 'Destiny' | 'Birth & Destiny',
  userName: string,
  language: string
): Promise<string> => {
  const prompt = `
  Act as Arvind Sud, the renowned numerologist.
  The response MUST be in ${language}.
  User's Name: "${userName}"
  Number: ${number}
  Type: "${type} Number"

  Provide a very brief, keyword-focused interpretation for this number's influence.
  Format: Start with the title (e.g., "Birth Number 5"), followed by a dash, then 3-4 powerful keywords.
  Example: "Birth Number 5 — Freedom, Curiosity, Expansion"
  Do not add any other text or explanation. Just one line.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        seed: 42,
      },
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching interpretation for ${type} Number ${number}:`, error);
    return `Failed to generate an interpretation for ${type} Number ${number}.`;
  }
};

export const analyzeBrandName = async (
  businessName: string,
  userName: string,
  userLifePath: number,
  userExpression: number,
  language: string
): Promise<BrandAnalysisV2> => {
    const brandNumbers = calculateNameNumbers(businessName);
    const prompt = `
    Act as Arvind Sud, applying your renowned Sud Numerology Matrix to the realm of business and branding.
    Your analysis is sharp, strategic, and focused on revealing the vibrational blueprint for commercial success. All numerological analysis MUST be strictly based on the Chaldean system for accuracy.
    Your entire response MUST be in ${language} and conform strictly to the provided JSON schema.

    **USER & BRAND DATA:**
    - User's Name: "${userName}"
    - User's Core Numbers: Life Path ${userLifePath}, Expression ${userExpression}.
    - Business Name to Analyze: "${businessName}"
    - Business Name's Calculated Numbers (Chaldean): Expression ${brandNumbers.expression} (from compound ${brandNumbers.compoundExpression}).

    **TASK: GENERATE A COMPREHENSIVE BRAND VIBRATION ANALYSIS**
    You must generate a valid JSON object.

    1.  **Brand Expression Number:** The calculated expression number for "${businessName}" is ${brandNumbers.expression}. You MUST set the \`brandExpressionNumber\` field in the JSON output to this value: ${brandNumbers.expression}.
    2.  **Vibrational Alignment Score:** Calculate a score from 0-100. High compatibility (e.g., brand number complements user's Life Path) should be 80+. Moderate compatibility 60-79. Challenging but workable 40-59. Low compatibility below 40.
    3.  **Detailed Analysis:** Explain the 'why' behind the score. How does the brand's Expression number (${brandNumbers.expression}) interact with the user's Life Path (${userLifePath}) and Expression (${userExpression})? Is it supportive, challenging, amplifying?
    4.  **Expression Number Explanation:** Generate an \`expressionNumberExplanation\`. This must be a clear, 1-2 sentence definition of what the Chaldean Expression number (also known as the Name Number) signifies, explaining that it's derived from all the letters in the name and represents the brand's potential and public persona.
    5.  **Brand Archetype:** Assign a primary brand archetype. Go beyond the standard 12 (e.g., Creator, Sage) and consider more nuanced or modern archetypes like 'The Alchemist', 'The Futurist', 'The Weaver', or 'The Connector' if they fit the brand's vibration better.
    6.  **Color Palette:** Suggest a primary, secondary, and accent color. These MUST be valid 6-digit HEX codes (e.g., '#1A2B3C'). For 'explanation', provide a detailed 2-3 sentence rationale. This must explicitly connect the color choices to the brand name's numerological vibration and its Chaldean planetary ruler. **IMPORTANT:** Color associations MUST be derived from authentic Chaldean mappings (e.g., Sun/1: Gold/Orange; Moon/2: Silver/White; Jupiter/3: Yellow; Rahu/4: Smoky colors; Mercury/5: Green; Venus/6: Blue; Ketu/7: Variegated colors; Saturn/8: Black/Dark Blue; Mars/9: Red). Do not blend with modern color psychology unless it directly supports the Chaldean choice. Also provide specific, actionable advice on how to use these colors.
    7.  **Social Media & Domain Suggestions:** Generate 3-4 creative social media handles and 3-4 domain names. These handles should reflect the brand's archetype and target audience, not just be variations of the business name. **SIMULATE AVAILABILITY:** You MUST randomly mark 1 or 2 suggestions in EACH list as 'available: false' to make the simulation realistic.
    8.  **Fortune Company Comparison:** Calculate the Chaldean Expression number for 2-3 famous companies (e.g., Apple=1, Google=3, Amazon=3, Microsoft=8). Find companies whose number matches or complements the business's number (${brandNumbers.expression}). For 'synergyAnalysis', provide a detailed 1-2 sentence explanation. This must detail *why* the user's brand vibration is either synergistic (if numbers are compatible) or challenging (if numbers are conflicting) compared to the Fortune 500 company. For example: "Synergistic with Google (3): Your brand's vibration of 3 also resonates with innovation and organizing information, suggesting a potential for large-scale impact and data-driven growth." or "Challenging compared to Apple (1): Your brand's collaborative '6' vibration may conflict with Apple's individualistic '1' leadership energy, requiring a different approach to market dominance."
    9.  **Content Strategy:** Generate a 'contentStrategy'. This should be a detailed guide on the *type* of content the brand should create, aligned with its archetype. Provide a general theme and then list 2-3 more specific, actionable content ideas. For instance, you could suggest "Share user testimonials highlighting transformative experiences" or "Create short, visually engaging video content showcasing the brand's core values". For a 'Sage' archetype, you might suggest 'Focus on educational content, deep-dive articles, and case studies. Also, share user testimonials highlighting their learning journey.' For a 'Jester', you could suggest 'Create humorous memes, engaging quizzes, and user-generated content challenges. Also, produce short, funny video skits that reflect the brand's personality.'
    10. **Name Suggestions:** If, and ONLY IF, the \`vibrationalAlignmentScore\` is below 65, you MUST provide 2-3 alternative brand name suggestions. These suggestions are critical. Each one must be "numerically harmonious". To achieve this, you MUST: a) Internally calculate the Chaldean Expression number for each suggested name. b) Ensure this number is highly compatible with the user's Life Path (${userLifePath}) and Expression (${userExpression}). The goal is to suggest names that would yield a significantly higher alignment score if re-analyzed. If the score is 65 or above, you MUST return an empty array \`[]\`.
    
    You must return a single JSON object. Do not include any text before or after the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                seed: 42,
            },
        });
        return extractJson(response.text);
    } catch (error) {
        console.error(`Error analyzing brand name "${businessName}":`, error);
        throw new Error(`Failed to analyze the vibrational alignment for "${businessName}". The cosmic frequencies may be disturbed. Please try again shortly.`);
    }
};

export const analyzePhoneNumber = async (
  phoneNumber: string,
  businessName: string,
  language: string
): Promise<PhoneNumberAnalysis> => {
    const digits = phoneNumber.replace(/\D/g, '');
    const sum = digits.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    const vibrationNumber = reduceNumber(sum);
    
    const prompt = `
    Act as Arvind Sud, applying your renowned numerological principles to business assets.
    Your entire response MUST be in ${language} and conform strictly to the provided JSON schema. All analysis must be based on pure Chaldean principles for interpreting the energy of numbers.

    **TASK: ANALYZE A BUSINESS PHONE NUMBER**
    Analyze the provided phone number based on its total Chaldean numerological vibration.

    - Business Name: "${businessName}"
    - Phone Number: "${phoneNumber}"
    - Calculated Vibration Number (Sum of all digits, reduced): ${vibrationNumber}

    **Analysis Instructions:**
    1.  **Chaldean Principles:** All analysis must be based on pure Chaldean principles for interpreting the energy of numbers.
    2.  **Vibration Number:** The final reduced number is ${vibrationNumber}. Populate the 'vibrationNumber' field with this.
    3.  **Analysis:** Provide a 2-4 sentence analysis in the 'analysis' field. Explain what the energy of ${vibrationNumber} means for a business line. For example:
        - A '5' might be excellent for communication, sales, and marketing businesses.
        - An '8' is powerful for finance, authority, and large-scale operations but might be too intense for a small creative studio.
        - A '4' might be good for construction or logistics but could feel restrictive for a consultancy.
    4.  **isFavorable:** Based on your analysis, determine if this number is generally favorable for business success. A number like 8, 1, 3, 5, or 6 is usually good. A number like 4, 7 or 9 might be more challenging. Set the 'isFavorable' boolean field accordingly.
    
    You must return a single JSON object. Do not include any text before or after the JSON.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                seed: 42,
            },
        });
        return extractJson(response.text);
    } catch (error) {
        console.error(`Error analyzing phone number "${phoneNumber}":`, error);
        throw new Error(`Failed to analyze the vibrational alignment for the phone number. The cosmic frequencies may be disturbed.`);
    }
};

export const analyzeCompetitors = async (
    userBrandName: string,
    userBrandVibration: number,
    userLifePath: number,
    userExpression: number,
    competitorNames: string[],
    language: string
): Promise<CompetitorBrandAnalysis[]> => {
    
    // Calculate vibrations for competitors locally to ensure accuracy
    const competitorData = competitorNames.map(name => {
        const { expression } = calculateNameNumbers(name);
        return { name, vibration: expression };
    });

    const competitorDataString = competitorData.map(c => `- ${c.name} (Vibration: ${c.vibration})`).join('\n');

    const prompt = `
    Act as Arvind Sud, a master numerologist specializing in competitive strategy.
    Your entire response MUST be in ${language} and conform strictly to the provided JSON schema.
    
    **TASK: ANALYZE COMPETITOR BRANDS**
    Analyze the following competitor brands against the user's brand.

    **USER BRAND:**
    - Name: "${userBrandName}"
    - Vibration: ${userBrandVibration}
    - User Core: LP ${userLifePath}, Expr ${userExpression}

    **COMPETITORS TO ANALYZE:**
    ${competitorDataString}

    **INSTRUCTIONS:**
    For each competitor provided in the list above:
    1.  **competitorName** (string): The name of the competitor.
    2.  **competitorVibration** (number): Use the vibration value provided in the list above for this competitor.
    3.  **comparisonAnalysis** (string): A concise strategic comparison (1-2 sentences). Compare the competitor's vibration to the user's brand vibration. Is it harmonious, conflicting, or neutral? What is the strategic implication?

    Your output MUST be a valid JSON array of objects, where each object matches the schema.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                competitorName: { type: Type.STRING },
                competitorVibration: { type: Type.NUMBER },
                comparisonAnalysis: { type: Type.STRING },
            },
            required: ['competitorName', 'competitorVibration', 'comparisonAnalysis'],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                seed: 42,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const json = JSON.parse(response.text);
        
        if (Array.isArray(json)) {
            return json;
        } else if (json && Array.isArray((json as any).competitors)) {
            return (json as any).competitors;
        } else {
             return json ? [json] : [];
        }
    } catch (error) {
        console.error(`Error analyzing competitors:`, error);
        throw new Error(`Failed to analyze competitors. The cosmic market intelligence network is currently unavailable.`);
    }
};

export const suggestAndAnalyzeCompetitors = async (
    userBrandName: string,
    userBrandVibration: number,
    userLifePath: number,
    userExpression: number,
    language: string
): Promise<CompetitorBrandAnalysis[]> => {
    const prompt = `
    Act as Arvind Sud, a master numerologist specializing in competitive strategy.
    Your entire response MUST be in ${language} and conform strictly to the provided JSON schema. The analysis must be strictly based on Chaldean numerology principles.

    **TASK: SUGGEST AND ANALYZE COMPETITOR BRANDS**
    You will suggest 3-5 major competitors for a brand named "${userBrandName}" which operates in the numerology, astrology, or personal development app space. Then, you will provide a strategic comparison for each.

    **USER'S DATA:**
    - Brand Name: "${userBrandName}"
    - Brand Vibration (Expression Number): ${userBrandVibration}
    - User's Core Numbers: Life Path ${userLifePath}, Expression ${userExpression}.

    **ANALYSIS INSTRUCTIONS:**
    For each of the 3-5 competitors you suggest:
    1.  Provide the \`competitorName\`. Good examples include apps like 'The Pattern', 'Co-Star', 'Sanctuary', 'Numerology.com'.
    2.  Internally, calculate the Chaldean Expression number for the competitor's name. You MUST use the Chaldean system (A,I,J,Q,Y=1; B,K,R=2; etc.). Populate the \`competitorVibration\` field with this calculated number.
    3.  Provide a concise but insightful 'comparisonAnalysis' (1-2 sentences). This analysis MUST directly compare the competitor's vibration to the user's brand vibration (${userBrandVibration}) and also consider the user's core numbers (${userLifePath}, ${userExpression}). Explain the strategic implications, such as market positioning, synergistic energies, or potential challenges.
    
    Generate a JSON array of objects, one for each suggested competitor.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                competitorName: { type: Type.STRING },
                competitorVibration: { type: Type.NUMBER },
                comparisonAnalysis: { type: Type.STRING },
            },
            required: ['competitorName', 'competitorVibration', 'comparisonAnalysis'],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                seed: 42,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const json = JSON.parse(response.text);
        if (Array.isArray(json)) {
             return json;
        } else if (json && Array.isArray((json as any).competitors)) {
             return (json as any).competitors;
        } else {
             return json ? [json] : [];
        }
    } catch (error) {
        console.error(`Error suggesting and analyzing competitors:`, error);
        throw new Error(`Failed to generate competitor suggestions. The cosmic market intelligence network is currently unavailable.`);
    }
};

export const analyzeLogo = async (
    logoBase64: string,
    mimeType: string,
    brandName: string,
    brandVibration: number,
    userLifePath: number,
    language: string
): Promise<LogoAnalysis> => {
    
    // First, analyze the logo to get suggestions
    const analysisPrompt = `
    Act as Arvind Sud, applying your numerological and design expertise to brand visuals.
    Your response must be in ${language} and conform to the provided JSON schema. All numerological analysis MUST be strictly based on the Chaldean system.

    **CONTEXT:**
    - Brand Name: "${brandName}" (Vibration: ${brandVibration})
    - User's Life Path: ${userLifePath}
    - An image of the brand's current logo is provided.

    **TASK: ANALYZE THE LOGO'S VIBRATIONAL ALIGNMENT**

    1.  **Analyze the Image using STRICTLY Chaldean Principles:** Observe the dominant colors and shapes in the logo.
        - **Colors:** Determine the dominant color and map it to its Chaldean ruling planet's number. Rely ONLY on traditional Chaldean color mappings (e.g., Red is Mars/9; Gold/Yellow is Sun/1; White/Silver is Moon/2; Green is Mercury/5; Blue is Venus/6 or Saturn/8 depending on shade).
        - **Shapes:** Similarly, associate the dominant shape with a Chaldean number (e.g., Circle for Sun/1; Triangle for Jupiter/3; Square for Rahu/4).
        - **CRITICAL:** Do not use associations from modern color theory, Feng Shui, or other esoteric systems. The analysis must be pure Chaldean.
    2.  **Calculate Logo Vibration:** Synthesize the numerical values from the dominant color and shape into a single 'logoVibrationNumber' from 1-9.
    3.  **Synergy Analysis:** In 2-3 sentences, explain how this calculated logo vibration number harmonizes or clashes with the brand's name vibration (${brandVibration}) and the user's Life Path (${userLifePath}). Briefly mention how you arrived at the logo vibration number.
    4.  **Suggestions:** Based on the analysis, provide suggestions for a more aligned logo type (e.g., 'Minimalist Emblem', 'Dynamic Wordmark') and 2-3 suitable font families (e.g., 'Geometric Sans-serif', 'Elegant Serif').
    
    You must return a single JSON object. Do not include any text before or after the JSON.
    `;

    const analysisResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType, data: logoBase64 } },
                { text: analysisPrompt }
            ]
        },
        config: {}
    });

    const analysisResult = extractJson(analysisResponse.text);

    // Second, generate a new logo based on the analysis
    const imageGenerationPrompt = `
    Create a professional, high-quality logo for the brand "${brandName}".
    The design should be a **${analysisResult.logoTypeSuggestion}**.
    It must visually represent the brand's core numerological vibration of **${brandVibration}** and its assigned archetype.
    Use fonts similar to **${analysisResult.fontSuggestions.join(' or ')}**.
    The logo should feel modern, clean, and spiritually aligned.
    `;
    
    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imageGenerationPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    let generatedLogoUrl = '';
    for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            generatedLogoUrl = `data:image/png;base64,${base64ImageBytes}`;
        }
    }

    return {
        ...analysisResult,
        generatedLogoUrl,
    };
};

export const editImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("No image was generated in the response.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image with the provided prompt. The cosmic energies might be misaligned.");
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
    You are Vidhira, the AI assistant to the world-renowned numerologist Arvind Sud. You are trained in his precise Sud Numerology Matrix, which is based exclusively on the Chaldean system.
    Your purpose is to help the user, ${userData.fullName}, understand their report with clarity, accuracy, and depth. Your tone is professional, helpful, and encouraging.
    The entire conversation and all your responses MUST be in ${userData.language}.

    **Primary Directive:** Your responses MUST be deeply personalized by cross-referencing the user's latest question with BOTH their full numerology report (provided below) and the preceding conversation history. Do not provide generic answers. Your goal is to provide actionable, personalized decision support directly related to their unique data.

    **Keep your answers conversational, insightful, and CONCISE (2-4 sentences max). Do not use markdown.**
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

    Now, provide your response as Vidhira, following your primary directive.
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
  Act as Arvind Sud, the world-renowned numerologist. Your persona is inspiring, precise, and deeply insightful, providing forecasts based on the proven principles of the Sud Numerology Matrix (Chaldean system).
  Your response MUST be in ${language} and formatted in Markdown.

  **USER DATA:**
  - Name: "${userName}"
  - Mulank (Primary Birth Number, from day of birth): ${mulank}

  **TASK:**
  Generate a detailed and personalized "Yearly Forecast" for this user for the year 2026. The forecast must be based on their Mulank (${mulank}). Your response must be in Markdown format and include the following sections:

  1.  **Mulank ${mulank} Energy for 2026:** A summary of the overarching themes, opportunities, and challenges for individuals with Mulank ${mulank} in 2026.
  2.  **Personalized Monthly Predictions (2026):** Provide a month-by-month breakdown (Jan-Dec). For each month, provide a detailed paragraph covering the following sub-topics, using them as bolded subheadings:
      - **Career & Finance:** Provide a detailed financial and career outlook. Specifically include:
          - **Investment Opportunities:** Suggest specific sectors or types of investments that are favorable during this month (e.g., "A good month to look into long-term tech stocks," or "Consider real estate investments.").
          - **Budgeting Strategies:** Offer a practical budgeting tip tailored to the month's energy (e.g., "Focus on cutting discretionary spending," or "A good time to create a budget for a large future purchase.").
          - **Potential Financial Challenges:** Clearly state any potential risks or challenges (e.g., "Avoid impulsive spending around the 15th," or "Be cautious of unexpected expenses related to home repairs.").
          - Also, cover general career advancement opportunities like promotions or new job prospects.
      - **Relationships & Compatibility:** Provide specific insights into relationship compatibility with other numbers. Discuss energies affecting romantic partnerships, family dynamics, and social life.
      - **Health & Wellness:** Detail potential health considerations (e.g., stress-related issues, physical vulnerabilities) and suggest targeted wellness practices or preventative measures.
      - **Key Dates:** Identify 2-3 specific dates within the month. For each date, explain *why* it is significant (e.g., "12th: Excellent for financial decisions due to Jupiter's influence") and label it as either auspicious or requiring caution.
  3.  **Strategic Warnings & Opportunities:** Create a bulleted list of 3-4 key warnings (e.g., "Be cautious with investments in April") and 3-4 key opportunities (e.g., "A powerful networking opportunity arises in September").
  4.  **Beyond 2026:** Briefly touch upon the energetic trends for 2027-2028 for Mulank ${mulank}.

  Ensure the tone is empowering and provides actionable advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        seed: 42,
      },
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
  Act as Arvind Sud, the world-renowned numerologist. Your persona is inspiring, precise, and deeply insightful.
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
      config: {
        seed: 42,
      },
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching daily horoscope for Mulank ${mulank}:`, error);
    return `### Horoscope Error\nFailed to receive today's cosmic transmission. Please try again in a moment.`;
  }
};

export const generateJyotishReport = async (
  userData: UserData,
): Promise<JyotishReportData> => {
  const { fullName, dob, time, location, gender, language } = userData;

  const prompt = `
  Act as a Master Vedic Astrologer (Jyotish Acharya) with decades of experience in authentic Parashara Light logic.
  Your persona is wise, authentic, and deeply insightful. Your entire response MUST be in ${language}.
  
  **USER DATA:**
  - Full Name: "${fullName}"
  - Date of Birth: "${dob}"
  - Time of Birth: "${time}"
  - Location of Birth: "${location}"
  - Gender: "${gender}"
  - Preferred Language: "${language}"

  **CALCULATION STANDARDS (STRICT):**
  - Ayanamsa: **Lahiri (Chitra Paksha)**. This is non-negotiable for authentic Vedic accuracy.
  - House System: Whole Sign or Placidus (state which is used implicitly by the positions).
  - Dasha System: Vimshottari.

  **TASK: GENERATE A DEEP-DIVE MASTER JYOTISH REPORT**
  You must return a valid JSON object strictly adhering to the schema provided. The analysis MUST be comprehensive, simulating the depth of a professional 50-page reading.

  **1. PAST LIFE & KARMIC PLAYBACK:**
  - **Atmakaraka (Soul Planet):** Identify the planet with the highest degree (excluding Rahu/Ketu). Reveal past life wounds and emotional tendencies.
  - **Rahu/Ketu Axis:** Analyze the specific house/sign placement. Explain the soul's past mastery (Ketu) and current obsession/growth area (Rahu). Identify the specific "Repeating Pattern" the user is stuck in.
  - **D-60 (Shashtiamsha) Insight:** Provide a high-level karmic memory summary derived from the D-60 chart logic (e.g., past achievements, debts, betrayals).
  - **Childhood Analysis (0-12 years):** Analyze Moon + Nakshatra, Mercury + 3rd House, and 4th House to reveal early emotional wounds, talents, and events that shaped their personality.

  **2. PRESENT LIFE TIMELINE (MASTER SYSTEM):**
  - **Current Dasha:** Calculate the *current* Vimshottari Mahadasha and Antardasha based on the birth date. Explain what this specific "Season of Life" means right now.
  - **Planetary Placements:** Calculate precise positions for all 9 Grahas including Nakshatras and degrees.

  **3. FUTURE LIFE TIMELINE (NETFLIX-STYLE):**
  - Generate a chronological, age-wise timeline of major life cycles.
  - **Cycles to Include:** Moon Cycle (0-12), Mars Cycle (13-24), Rahu Cycle (25-36), Jupiter Cycle (37-48), Saturn Cycle (49-60), Ketu Cycle (60+).
  - For each phase, provide the specific age range, the planetary theme (e.g., "Growth & Chaos"), and a specific prediction for that phase of the user's life.

  **4. EVENT TIMING (SPECIFIC PREDICTIONS):**
  - Identify 3-4 **CRITICAL** future years for major life events using the synthesis of Dasha + Transits.
  - **Categories:** Career Rise, Marriage/Relationship, Wealth Peak, Spiritual Awakening.
  - **Prediction:** "At Age X (Year Y): [Event Description]". Be specific.

  **5. GUIDANCE ENGINE:**
  - **Actionable Advice:** When to take action (e.g., "Next 3 months good for business").
  - **Vedic Remedies (Upay):** Provide a list of 3-5 general remedies.
  - **Pitfalls:** What to strictly avoid to prevent karmic backlash.

  **6. DETAILED VEDIC REMEDIES (NEW):**
  - Identify the 2-3 most challenging planetary influences in the chart (weak planets, functional malefics, or difficult conjunctions).
  - For EACH of these planets, provide a structured breakdown:
    - **Planet:** The planet name.
    - **Reason:** Why this planet needs remedy (e.g. "Debilitated in 8th house").
    - **Mantra:** A specific Beej Mantra or Vedic Mantra.
    - **Gemstone:** Suggest a gemstone, BUT include instructions (wear on which finger, which day).
    - **Charity:** A specific donation item related to that planet.
    - **Behavior:** A behavioral correction (e.g. "Speak less harshly" for Mars).

  **7. REPORT & CHARTS:**
  - **Planetary Strength (Graha Bala):** Evaluate strength (0-100) for each planet.
  - **Markdown Report:** A summary text report.
  `;

  const nakshatraInfoSchema = {
      type: Type.OBJECT,
      properties: {
          name: { type: Type.STRING },
          lord: { type: Type.STRING },
          pada: { type: Type.NUMBER },
          quality: { type: Type.STRING },
          summary: { type: Type.STRING },
      },
      required: ['name', 'lord', 'quality', 'summary'],
  };

  const planetaryPlacementSchema = {
      type: Type.OBJECT,
      properties: {
          planet: { type: Type.STRING },
          sign: { type: Type.STRING },
          house: { type: Type.NUMBER },
          nakshatra: { type: Type.STRING },
          nakshatraLord: { type: Type.STRING },
          degree: { type: Type.STRING },
          isRetrograde: { type: Type.BOOLEAN },
      },
      required: ['planet', 'sign', 'house', 'nakshatra'],
  };

  const planetaryStrengthSchema = {
      type: Type.OBJECT,
      properties: {
          planet: { type: Type.STRING },
          score: { type: Type.NUMBER },
          summary: { type: Type.STRING },
      },
      required: ['planet', 'score', 'summary'],
  };

  const soulPurposeSchema = {
      type: Type.OBJECT,
      properties: {
          atmakaraka: {
              type: Type.OBJECT,
              properties: {
                  planet: { type: Type.STRING },
                  significance: { type: Type.STRING },
                  pastLifeWounds: { type: Type.STRING },
              },
              required: ['planet', 'significance', 'pastLifeWounds'],
          },
          karmicAxis: {
              type: Type.OBJECT,
              properties: {
                  rahuPlacement: { type: Type.STRING },
                  ketuPlacement: { type: Type.STRING },
                  lifeLesson: { type: Type.STRING },
                  repeatingPatterns: { type: Type.STRING },
              },
              required: ['rahuPlacement', 'ketuPlacement', 'lifeLesson', 'repeatingPatterns'],
          },
          dharma: { type: Type.STRING },
          d60Memory: { type: Type.STRING },
          childhoodAnalysis: { type: Type.STRING },
      },
      required: ['atmakaraka', 'karmicAxis', 'dharma', 'd60Memory', 'childhoodAnalysis'],
  };

  const dashaPeriodSchema = {
      type: Type.OBJECT,
      properties: {
          currentMahadasha: { type: Type.STRING },
          currentAntardasha: { type: Type.STRING },
          endDate: { type: Type.STRING },
          analysis: { type: Type.STRING },
      },
      required: ['currentMahadasha', 'currentAntardasha', 'analysis'],
  };

  const lifeCyclePhaseSchema = {
    type: Type.OBJECT,
    properties: {
        ageRange: { type: Type.STRING },
        cycleName: { type: Type.STRING },
        theme: { type: Type.STRING },
        prediction: { type: Type.STRING },
    },
    required: ['ageRange', 'cycleName', 'theme', 'prediction'],
  };

  const keyLifeEventSchema = {
    type: Type.OBJECT,
    properties: {
        age: { type: Type.NUMBER },
        year: { type: Type.NUMBER },
        category: { type: Type.STRING },
        eventDescription: { type: Type.STRING },
    },
    required: ['age', 'year', 'category', 'eventDescription'],
  };

  const actionableGuidanceSchema = {
    type: Type.OBJECT,
    properties: {
        bestActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        remedies: { type: Type.ARRAY, items: { type: Type.STRING } },
        pitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['bestActions', 'remedies', 'pitfalls'],
  };

  const detailedRemedySchema = {
    type: Type.OBJECT,
    properties: {
        planet: { type: Type.STRING },
        reason: { type: Type.STRING },
        mantra: { type: Type.STRING },
        gemstone: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                instruction: { type: Type.STRING },
            },
            required: ['name', 'instruction'],
        },
        charity: { type: Type.STRING },
        behavioralCorrection: { type: Type.STRING },
    },
    required: ['planet', 'reason', 'mantra', 'gemstone', 'charity', 'behavioralCorrection'],
  };

  const schema = {
      type: Type.OBJECT,
      properties: {
          markdownReport: { type: Type.STRING },
          planetaryPlacements: { type: Type.ARRAY, items: planetaryPlacementSchema },
          ascendantSign: { type: Type.STRING },
          ascendantNakshatra: nakshatraInfoSchema,
          moonNakshatra: nakshatraInfoSchema,
          grahaBala: { type: Type.ARRAY, items: planetaryStrengthSchema },
          soulPurpose: soulPurposeSchema,
          currentPeriod: dashaPeriodSchema,
          futureTimeline: { type: Type.ARRAY, items: lifeCyclePhaseSchema },
          keyEvents: { type: Type.ARRAY, items: keyLifeEventSchema },
          guidance: actionableGuidanceSchema,
          detailedRemedies: { type: Type.ARRAY, items: detailedRemedySchema },
      },
      required: [
        'markdownReport', 'planetaryPlacements', 'ascendantSign', 
        'ascendantNakshatra', 'moonNakshatra', 'grahaBala', 
        'soulPurpose', 'currentPeriod', 'futureTimeline', 
        'keyEvents', 'guidance', 'detailedRemedies'
      ],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        seed: 42,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    return extractJson(response.text);

  } catch (error) {
    console.error("Error generating Jyotish report:", error);
    throw new Error("Failed to generate the Jyotish report. The cosmic alignments are currently difficult to read. Please try again.");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
    if (!text || text.trim().length === 0) {
        throw new Error("Cannot generate speech from empty text.");
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("The API did not return any audio data.");
        }
        
        return base64Audio;

    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to synthesize audio. The cosmic frequencies may be disturbed.");
    }
};

export const getKuaNumberInterpretation = async (
  kuaNumber: number,
  userName: string,
  gender: string,
  language: string
): Promise<string> => {
  const prompt = `
  Act as Arvind Sud, a master numerologist applying your principles to Kua numbers.
  Your response MUST be in ${language}.
  User's Name: "${userName}"
  Gender: "${gender}"
  Kua Number: ${kuaNumber}

  Provide a concise interpretation for this Kua number. The interpretation should be 3-4 sentences and cover:
  1. The core meaning and personality traits associated with Kua number ${kuaNumber}.
  2. The corresponding element (e.g., Water, Earth, Wood, Metal, Fire).
  3. A brief, practical tip on how they can use this number's energy (e.g., related to their best directions or colors).
  
  Do not use markdown. Keep it suitable for a small tooltip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        seed: 42,
      },
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching interpretation for Kua number ${kuaNumber}:`, error);
    return `Failed to generate an interpretation for Kua number ${kuaNumber}.`;
  }
};

export const getBirthDestinyCombinationInterpretation = async (
  birthNumber: number,
  destinyNumber: number,
  userName: string,
  language: string
): Promise<string> => {
  const prompt = `
  Act as Arvind Sud, a world-renowned numerologist. Your persona is inspiring, precise, and deeply personalized, blending mysticism with actionable insight. You are about to deliver an analysis based on the Sud Numerology Matrix.
  Your entire response MUST be in ${language} and formatted in rich Markdown.

  **USER DATA:**
  - Name: "${userName}"
  - Birth Number (Mulank): ${birthNumber}
  - Destiny Number (Bhagyank / Life Path): ${destinyNumber}

  **TASK: 81 COMBINATIONS ANALYSIS**
  You are to provide a detailed, comprehensive analysis for the specific combination of Birth Number ${birthNumber} and Destiny Number ${destinyNumber}. This is one of the most critical aspects of a numerology chart.

  Your analysis must be structured with the following Markdown headings:

  ### Core Dynamics: The Interplay of ${birthNumber} and ${destinyNumber}
  (Start with a powerful summary of how these two core numbers interact. Is their relationship harmonious, challenging, or a mix? Explain the fundamental vibration this combination creates for the user's life.)

  ### Key Strengths & Gifts
  (Provide a bulleted list of 3-5 major strengths that arise from this combination. Be specific. For example, instead of "good leader", say "Charismatic leadership that inspires loyalty".)

  ### Potential Challenges & Areas for Growth
  (Provide a bulleted list of 3-5 potential challenges or weaknesses. Frame them constructively as opportunities for growth. For example, instead of "stubborn", say "A tendency towards fixed opinions that can be balanced by actively seeking diverse perspectives.")

  ### Career & Professional Path
  (Give specific career recommendations. What fields or roles would best suit this energetic combination? For example, "This combination excels in fields requiring both analytical rigor and creative problem-solving, such as software architecture, strategic consulting, or medical research.")

  ### Relationships & Emotional Compatibility
  (Describe the user's approach to relationships. What do they seek in a partner? Which numbers are they most compatible with, considering this specific Birth/Destiny blend?)

  ### Health & Wellness Advice
  (Provide targeted health advice. What are the potential physical or mental health vulnerabilities associated with this combination? Suggest 1-2 practical wellness tips, like "Regular grounding exercises such as hiking are essential to balance the high-energy of this combination.")

  ### Spiritual Path & Purpose
  (Conclude with an inspiring paragraph about the higher spiritual purpose of this combination. What is the ultimate lesson or life mission for someone with these numbers?)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Error fetching interpretation for combination ${birthNumber}/${destinyNumber}:`, error);
    return `### Error\nFailed to generate the analysis for your Birth and Destiny number combination. The cosmic connection is currently unstable. Please try again.`;
  }
};

export const getMonthlyCalendarInsights = async (
  coreNumbers: CoreNumbers,
  userName: string,
  month: number, // 1-12
  year: number,
  language: string
): Promise<CalendarDayInsight[]> => {
  const monthName = new Date(year, month - 1, 1).toLocaleString(language, { month: 'long' });

  const prompt = `
  Act as Arvind Sud, a world-renowned numerologist applying the Sud Numerology Matrix.
  Your entire response MUST be in ${language} and conform strictly to the provided JSON schema.

  **USER DATA:**
  - Name: "${userName}"
  - Core Numbers (Chaldean):
    - Life Path: ${coreNumbers.lifePath}
    - Expression: ${coreNumbers.expression}
    - Soul Urge: ${coreNumbers.soulUrge}
    - Personality: ${coreNumbers.personality}
    - Personal Year: ${coreNumbers.personalYear}

  **TASK: GENERATE A PERSONALIZED "COSMIC CALENDAR"**
  Generate a complete set of daily insights for **${monthName} ${year}**.
  Your analysis must be based on an advanced synthesis of the user's core numbers, their Personal Year number, and the universal vibration of each specific day (${monthName} 1st, 2nd, etc.).
  The output MUST be a JSON array. You MUST generate an object for EVERY day of the month. For ${monthName} ${year}, that means ${new Date(year, month, 0).getDate()} entries.

  **For each day, you will determine:**
  1.  **rating:**
      - 'good': A day with harmonious vibrations, excellent for action, launches, and important meetings. Mark these as "Push Days".
      - 'bad': A day with conflicting energies, best for caution, planning, and avoiding major decisions. Mark these as "Pause Days".
      - 'medium': A mixed-energy day, good for routine tasks but not for high-stakes actions.
  2.  **title:** A creative, short title summarizing the day's theme.
  3.  **advice:** Highly specific and actionable advice. Do not be generic. Connect it to the user's numerology. For a "Push Day", you might say "Your Life Path 8 energy is amplified today; a bold financial move could pay off." For a "Pause Day", "The challenging vibration clashes with your Expression 5; avoid unnecessary travel and double-check all communications."
  
  You must return a single JSON array. Do not include any text before or after the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        seed: 42,
      },
    });
    return extractJson(response.text);
  } catch (error) {
    console.error(`Error generating calendar insights for ${monthName} ${year}:`, error);
    throw new Error(`Failed to generate the Cosmic Calendar. The celestial alignments for this month are currently unreadable.`);
  }
};
