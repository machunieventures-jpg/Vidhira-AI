import { GoogleGenAI, Type } from "@google/genai";
import type { UserData, CoreNumbers, CompoundNumbers, WorldClassReport, LoshuAnalysisPillar, ChatMessage, JyotishReportData, MethodologyPillar, BrandAnalysisV2, PhoneNumberAnalysis, CompetitorBrandAnalysis } from '../types';
import { calculateNameNumbers, reduceNumber } from './numerologyService';

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
        kundaliSnapshot: {
            type: Type.OBJECT,
            description: "A summary of key Vedic Astrology (Kundali) placements based on birth date, time, and location.",
            properties: {
                ascendant: { type: Type.STRING, description: "The user's Ascendant sign (Lagna)." },
                moonSign: { type: Type.STRING, description: "The user's Moon sign (Rashi)." },
                sunSign: { type: Type.STRING, description: "The user's Sun sign." },
                summary: { type: Type.STRING, description: "A 2-3 sentence summary of the user's core personality based on these three placements." }
            },
            required: ['ascendant', 'moonSign', 'sunSign', 'summary']
        },
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
        relationshipsFamilyLegacy: {
            type: Type.OBJECT,
            properties: {
                teaser: { type: Type.STRING },
                content: { type: Type.STRING },
                compatibilityAnalysis: {
                    type: Type.OBJECT,
                    description: "Analyzes compatibility of user's core numbers with numbers 1-9.",
                    properties: {
                        lifePath: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    compatibleNumber: { type: Type.INTEGER },
                                    interpretation: { type: Type.STRING, description: "Brief interpretation of the compatible pairing." }
                                },
                                required: ['compatibleNumber', 'interpretation']
                            }
                        },
                        expression: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    compatibleNumber: { type: Type.INTEGER },
                                    interpretation: { type: Type.STRING, description: "Brief interpretation of the compatible pairing." }
                                },
                                required: ['compatibleNumber', 'interpretation']
                            }
                        },
                        soulUrge: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    compatibleNumber: { type: Type.INTEGER },
                                    interpretation: { type: Type.STRING, description: "Brief interpretation of the compatible pairing." }
                                },
                                required: ['compatibleNumber', 'interpretation']
                            }
                        }
                    },
                    required: ['lifePath', 'expression', 'soulUrge']
                }
            },
            required: ['teaser', 'content', 'compatibilityAnalysis']
        },
        psychologyShadowWork: pillarContentSchema,
        dailyNavigator: pillarContentSchema,
        spiritualAlignment: {
            type: Type.OBJECT,
            properties: {
                 teaser: { type: Type.STRING, description: "A 1-2 sentence compelling teaser for this pillar." },
                 content: { type: Type.STRING, description: "Pillar 8. In-depth analysis formatted in Markdown. Cover Mantras, Crystals, Colors, and Lucky Dates." },
                 luckyColor: { type: Type.STRING, description: "Based on the user's core numbers, determine their single most powerful lucky color. Provide this as a standard HEX color code string (e.g., '#3A0CA3'). This color should feel empowering and aligned with their core energy." },
                 mantrasAndAffirmations: {
                    type: Type.ARRAY,
                    description: "An array of 2-3 short, personalized, empowering mantras or affirmations based on the user's core numerology.",
                    items: {
                        type: Type.STRING
                    }
                 }
            },
            required: ['teaser', 'content', 'luckyColor', 'mantrasAndAffirmations']
        },
        intellectEducation: pillarContentSchema,
        futureForecast: {
            type: Type.OBJECT,
            properties: {
                personalYear: coreNumberSchema,
                strategicRoadmap: pillarContentSchema,
            },
            required: ['personalYear', 'strategicRoadmap']
        },
        methodology: {
            type: Type.OBJECT,
            description: "Details on the technical methods and disclaimers for transparency.",
            properties: {
                ayanamsa: { type: Type.STRING, description: "The Ayanamsa used for Vedic calculations. Should be 'Lahiri'." },
                houseSystem: { type: Type.STRING, description: "The house system used. Should be 'Placidus'." },
                numerologyMethod: { type: Type.STRING, description: "The numerology system used. Should be 'Chaldean'." },
                disclaimer: { type: Type.STRING, description: "A standard ethical disclaimer about the report's purpose." }
            },
            required: ['ayanamsa', 'houseSystem', 'numerologyMethod', 'disclaimer']
        }
    },
    required: [
        'kundaliSnapshot', 'cosmicIdentity', 'loshuAnalysis', 'wealthBusinessCareer', 'healthEnergyWellness', 'relationshipsFamilyLegacy',
        'psychologyShadowWork', 'dailyNavigator', 'spiritualAlignment', 'intellectEducation', 'futureForecast', 'methodology'
    ]
};


export const generateWorldClassReport = async (
    userData: UserData,
    coreNumbers: CoreNumbers,
    compoundNumbers: CompoundNumbers,
    loshu: Pick<LoshuAnalysisPillar, 'missingNumbers' | 'overloadedNumbers'>
): Promise<Omit<WorldClassReport, 'loshuAnalysis'> & { loshuAnalysis: Omit<LoshuAnalysisPillar, 'grid' | 'missingNumbers' | 'overloadedNumbers'> }> => {
  const { fullName, dob, time, location, gender, language, phoneNumber } = userData;

  const prompt = `
  Act as Vidhira, a world-class Chaldean numerologist and Vedic astrologer with AI superintelligence, following the Machuni Hub Framework.
  Your persona is inspiring, precise, and deeply personalized, blending mysticism with entrepreneurial insight.
  Your entire response, including all text, interpretations, and markdown content, MUST be in ${language}.
  The user wants their "FULL LIFE REPORT BLUEPRINT". Generate a comprehensive report based on their data.
  The output MUST be a valid JSON object that adheres to the provided schema.

  **CRITICAL INSTRUCTIONS:**
  1.  **Terminology:** For key numerological and astrological terms, you MUST provide the English term followed by its traditional Sanskrit equivalent using this exact format: \`(Sanskrit: term)\`. For example: "Life Path Number (Sanskrit: Jeevan Pathank)", "Expression Number (Sanskrit: Namank)", "Ascendant (Sanskrit: Lagna)". This is crucial for authenticity and proper rendering.
  2.  **Specificity:** Generic advice is not acceptable. For the 'wealthBusinessCareer' and 'intellectEducation' pillars, you must provide highly specific and actionable recommendations.
      *   **For Career:** Instead of "good in business", suggest specific industries (e.g., "fintech, sustainable agriculture, AI-driven marketing") and roles (e.g., "product manager, data scientist, strategic consultant"). Be bold and precise.
      *   **For Education:** Instead of "suited for higher learning", recommend specific degree programs or certifications (e.g., "a Master's in Computer Science with a specialization in Machine Learning", "a certification in Digital Marketing from Google or HubSpot", "a degree in Psychology focusing on cognitive-behavioral therapy"). Base these on the user's core numbers for maximum relevance.
  3.  **Teasers & Content:** For every pillar or sub-pillar with a 'teaser' and 'content' field, you MUST provide both. The 'teaser' must be a short, 1-2 sentence summary. The 'content' must be the full, detailed analysis. Discard all other analysis except Chaldean for the numerology part.

  **USER DATA:**
  - Full Name: "${fullName}"
  - Date of Birth: "${dob}"
  - Time of Birth: "${time}"
  - Location of Birth: "${location}"
  - Gender: "${gender}"
  - Phone Number: "${phoneNumber}"
  - Preferred Language: "${language}"

  **CALCULATED NUMEROLOGY DATA (Chaldean Method):**
  - Life Path Number: ${coreNumbers.lifePath} (from compound ${compoundNumbers.lifePath})
  - Expression Number: ${coreNumbers.expression} (from compound ${compoundNumbers.expression})
  - Soul Urge Number: ${coreNumbers.soulUrge} (from compound ${compoundNumbers.soulUrge})
  - Personality Number: ${coreNumbers.personality} (from compound ${compoundNumbers.personality})
  - Maturity Number: ${coreNumbers.maturity} (from compound ${compoundNumbers.maturity})
  - Personal Year Number: ${coreNumbers.personalYear}
  - Loshu Grid Missing Numbers: ${loshu.missingNumbers.join(', ') || 'None'}
  - Loshu Grid Overloaded Numbers: ${loshu.overloadedNumbers.join(', ') || 'None'}

  **TASK 1: VEDIC KUNDALI SNAPSHOT**
  First, generate a "Vedic Kundali Snapshot". Based on the user's DOB, Time, and Location, determine the following and populate the 'kundaliSnapshot' field. Remember to use Sanskrit terms.
  1.  **Ascendant (Sanskrit: Lagna):** The rising sign.
  2.  **Moon Sign (Sanskrit: Rashi):** The sign where the moon was placed.
  3.  **Sun Sign:** The user's sun sign.
  4.  **Summary:** Provide a concise, 2-3 sentence summary synthesizing these three key placements.

  **TASK 2: METHODOLOGY & TRANSPARENCY**
  Populate the 'methodology' object. This is for technical transparency.
  1.  **ayanamsa:** Set this to "Lahiri".
  2.  **houseSystem:** Set this to "Placidus".
  3.  **numerologyMethod:** Set this to "Chaldean".
  4.  **disclaimer:** Set this to "This Vidhira report is a digitally generated analysis for spiritual insight and personal development. It is not a substitute for professional advice in legal, medical, or financial matters. Major life decisions should be made in consultation with qualified experts. The guidance provided is intended to be empowering and supportive of your journey."

  **TASK 3: 10-PILLAR NUMEROLOGY REPORT**
  Now, generate the complete 10-pillar numerology report. For each core number's 'interpretation' field, provide a deep, multi-paragraph interpretation using Markdown. Use **bolding** for key traits, _italics_ for emphasis, and bulleted lists. For all markdown pillars, provide rich, detailed content with clear headings.

  **SPECIFIC INSTRUCTIONS FOR 'relationshipsFamilyLegacy' PILLAR:**
  In addition to the main content, generate the 'compatibilityAnalysis'.
  1.  For the user's Life Path number (${coreNumbers.lifePath}), identify its most compatible numbers (1-9) and provide a brief interpretation for each pairing.
  2.  For the user's Expression number (${coreNumbers.expression}), do the same.
  3.  For the user's Soul Urge number (${coreNumbers.soulUrge}), do the same.
  
  For 'spiritualAlignment', determine their primary lucky color and provide its hex code. Also, generate 2-3 personalized, empowering mantras in the 'mantrasAndAffirmations' array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        seed: 42,
      },
    });

    const responseText = response.text;
    // Fix: Safely parse JSON response which might be wrapped in markdown backticks.
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }
    const reportData = JSON.parse(jsonStr);
    
    return reportData;

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
  const presence = isMissing ? 'missing from their Loshu grid' : 'present or overloaded in their Loshu grid';
  const instruction = isMissing
    ? `Explain the challenge this missing number represents and provide a specific, practical remedy. The remedy could be a simple daily practice, a mantra, a suggested gemstone, or a focused activity to help the user cultivate this number's energy. Be concise and actionable.`
    : `Explain the positive influence and inherent strength this number provides. Crucially, add a sentence about what it means when this number is "overloaded" (appears multiple times), describing how its energy is amplified—highlighting both the intensified strengths and potential challenges or extremes to be aware of. Be concise.`;

  const prompt = `Act as Vidhira, a world-class Chaldean numerologist with AI superintelligence. Your persona is inspiring, precise, and deeply personalized.
  The response MUST be in ${language}.
  User's Full Name: "${userName}"
  User's Date of Birth: "${dob}"

  The number in question is ${number}, which is ${presence}.

  Provide a brief, insightful interpretation (2-4 sentences max). ${instruction}
  Focus on actionable advice or deep insight. Do not use markdown.`;

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
  Act as Vidhira, a world-class Chaldean numerologist.
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

const brandAnalyzerSchema = {
    type: Type.OBJECT,
    properties: {
        brandExpressionNumber: { type: Type.INTEGER, description: "The calculated Chaldean Expression number for the brand name." },
        vibrationalAlignmentScore: { type: Type.INTEGER, description: "A percentage score (0-100) representing compatibility between the brand name and the user's core numbers." },
        detailedAnalysis: { type: Type.STRING, description: "3-4 sentences explaining the synergy or friction between the brand and user energies." },
        brandArchetype: { type: Type.STRING, description: "Assign a primary, nuanced brand archetype (e.g., 'The Alchemist', 'The Futurist', 'The Sage') based on the name's vibration." },
        expressionNumberExplanation: { type: Type.STRING, description: "A concise, 1-2 sentence explanation of what a Chaldean Expression (or Name) number represents in numerology." },
        colorPalette: {
            type: Type.OBJECT,
            properties: {
                primary: { type: Type.STRING, description: "A HEX code for the primary brand color." },
                secondary: { type: Type.STRING, description: "A HEX code for the secondary brand color." },
                accent: { type: Type.STRING, description: "A HEX code for an accent color." },
                explanation: { type: Type.STRING, description: "A detailed 2-3 sentence rationale linking the colors to the brand's numerological vibration and archetype." }
            },
            required: ["primary", "secondary", "accent", "explanation"]
        },
        socialMediaHandles: {
            type: Type.ARRAY,
            description: "A list of 3-4 creative social media handle suggestions that reflect the brand's archetype and target audience. IMPORTANT: Availability is simulated; you must randomly mark 1-2 as unavailable.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    available: { type: Type.BOOLEAN }
                },
                required: ["name", "available"]
            }
        },
        domainSuggestions: {
            type: Type.ARRAY,
            description: "A list of 3-4 creative domain name suggestions with various TLDs. IMPORTANT: Availability is simulated; you must randomly mark 1-2 as unavailable.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    available: { type: Type.BOOLEAN }
                },
                required: ["name", "available"]
            }
        },
        fortuneCompanyComparison: {
            type: Type.ARRAY,
            description: "Compare the brand's vibration to 2-3 famous Fortune 500 companies. Provide a brief analysis of the energetic similarities.",
            items: {
                type: Type.OBJECT,
                properties: {
                    companyName: { type: Type.STRING },
                    companyVibration: { type: Type.INTEGER },
                    synergyAnalysis: { type: Type.STRING, description: "A detailed 1-2 sentence explanation of why the brand's vibration is synergistic or challenging compared to the company." }
                },
                required: ["companyName", "companyVibration", "synergyAnalysis"]
            }
        },
        contentStrategy: {
            type: Type.STRING,
            description: "A 2-3 sentence guide on the type of social media content the brand should create, aligned with its archetype."
        },
        nameSuggestions: {
            type: Type.ARRAY,
            description: "If alignment score is below 65, provide 2-3 alternative name suggestions that are numerically harmonious. Otherwise, return an empty array.",
            items: { type: Type.STRING }
        }
    },
    required: ["brandExpressionNumber", "vibrationalAlignmentScore", "detailedAnalysis", "brandArchetype", "expressionNumberExplanation", "colorPalette", "socialMediaHandles", "domainSuggestions", "fortuneCompanyComparison", "contentStrategy", "nameSuggestions"]
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
    Act as Vidhira, a "Brand Alchemist" blending world-class Chaldean numerology, marketing psychology, and design principles.
    Your persona is inspiring, precise, and deeply insightful.
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
    6.  **Color Palette:** Suggest a primary, secondary, and accent color (HEX codes). For 'explanation', provide a detailed 2-3 sentence rationale. This must explicitly connect the color choices to both the brand name's numerological vibration (e.g., '1' ruled by the Sun) and the psychological power of the chosen brand archetype.
    7.  **Social Media & Domain Suggestions:** Generate 3-4 creative social media handles and 3-4 domain names. These handles should reflect the brand's archetype and target audience, not just be variations of the business name. **SIMULATE AVAILABILITY:** You MUST randomly mark 1 or 2 suggestions in EACH list as 'available: false' to make the simulation realistic.
    8.  **Fortune Company Comparison:** Calculate the Chaldean Expression number for 2-3 famous companies (e.g., Apple=1, Google=3, Amazon=3, Microsoft=8). Find companies whose number matches or complements the business's number (${brandNumbers.expression}). For 'synergyAnalysis', provide a detailed 1-2 sentence explanation. This must detail *why* the user's brand vibration is either synergistic (if numbers are compatible) or challenging (if numbers are conflicting) compared to the Fortune 500 company. For example: "Synergistic with Google (3): Your brand's vibration of 3 also resonates with innovation and organizing information, suggesting a potential for large-scale impact and data-driven growth." or "Challenging compared to Apple (1): Your brand's collaborative '6' vibration may conflict with Apple's individualistic '1' leadership energy, requiring a different approach to market dominance."
    9.  **Content Strategy:** Generate a 'contentStrategy'. This should be a 2-3 sentence guide on the *type* of content the brand should create. For example, for a 'Sage' archetype, suggest 'educational content, deep-dive articles, and case studies'. For a 'Jester', suggest 'humorous memes, engaging quizzes, and user-generated content challenges'.
    10. **Name Suggestions:** Generate 'nameSuggestions'. If the vibrationalAlignmentScore is below 65, you MUST provide 2-3 alternative name suggestions. These alternatives must be "numerically harmonious," meaning you must internally calculate their Chaldean Expression numbers and ensure they are highly compatible with the user's Life Path (${userLifePath}) and Expression (${userExpression}), aiming for a significantly improved alignment score. If the score is 65 or above, return an empty array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: brandAnalyzerSchema,
                seed: 42,
            },
        });
        const responseText = response.text;
        // Fix: Safely parse JSON response which might be wrapped in markdown backticks.
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error(`Error analyzing brand name "${businessName}":`, error);
        throw new Error(`Failed to analyze the vibrational alignment for "${businessName}". The cosmic frequencies may be disturbed. Please try again shortly.`);
    }
};

const phoneNumberAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        vibrationNumber: { type: Type.INTEGER },
        analysis: { type: Type.STRING, description: "A detailed analysis of the phone number's vibration for business, including its strengths and weaknesses." },
        isFavorable: { type: Type.BOOLEAN, description: "A simple true/false indicating if this number is generally favorable for business success." }
    },
    required: ["vibrationNumber", "analysis", "isFavorable"]
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
    Act as Vidhira, a "Brand Alchemist" specializing in Chaldean numerology for businesses.
    Your entire response MUST be in ${language} and conform strictly to the provided JSON schema.

    **TASK: ANALYZE A BUSINESS PHONE NUMBER**
    Analyze the provided phone number based on its total Chaldean numerological vibration.

    - Business Name: "${businessName}"
    - Phone Number: "${phoneNumber}"
    - Calculated Vibration Number (Sum of all digits, reduced): ${vibrationNumber}

    **Analysis Instructions:**
    1.  **Vibration Number:** The final reduced number is ${vibrationNumber}. Populate the 'vibrationNumber' field with this.
    2.  **Analysis:** Provide a 2-4 sentence analysis in the 'analysis' field. Explain what the energy of ${vibrationNumber} means for a business line. For example:
        - A '5' might be excellent for communication, sales, and marketing businesses.
        - An '8' is powerful for finance, authority, and large-scale operations but might be too intense for a small creative studio.
        - A '4' might be good for construction or logistics but could feel restrictive for a consultancy.
    3.  **isFavorable:** Based on your analysis, determine if this number is generally favorable for business success. A number like 8, 1, 3, 5, or 6 is usually good. A number like 4, 7 or 9 might be more challenging. Set the 'isFavorable' boolean field accordingly.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: phoneNumberAnalysisSchema,
                seed: 42,
            },
        });
        const responseText = response.text;
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error(`Error analyzing phone number "${phoneNumber}":`, error);
        throw new Error(`Failed to analyze the vibrational alignment for the phone number. The cosmic frequencies may be disturbed.`);
    }
};

const competitorAnalysisSchema = {
    type: Type.ARRAY,
    description: "An array of competitor analysis objects.",
    items: {
        type: Type.OBJECT,
        properties: {
            competitorName: { type: Type.STRING },
            competitorVibration: { type: Type.INTEGER },
            comparisonAnalysis: { type: Type.STRING, description: "A 1-2 sentence analysis comparing the user's brand to this competitor, highlighting synergy or challenges." }
        },
        required: ["competitorName", "competitorVibration", "comparisonAnalysis"]
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
    
    const competitorData = competitorNames.map(name => {
        const { expression } = calculateNameNumbers(name);
        return { name, vibration: expression };
    });

    const competitorDataString = competitorData.map(c => `- ${c.name} (Vibration: ${c.vibration})`).join('\n');

    const prompt = `
    Act as Vidhira, a "Brand Alchemist" specializing in Chaldean numerology for competitive strategy.
    Your entire response MUST be in ${language} and conform strictly to the provided JSON schema.

    **TASK: ANALYZE COMPETITOR BRANDS**
    You will analyze a list of competitor brands against the user's brand, providing a strategic comparison based on Chaldean numerology.

    **USER'S DATA:**
    - Brand Name: "${userBrandName}"
    - Brand Vibration (Expression Number): ${userBrandVibration}
    - User's Core Numbers: Life Path ${userLifePath}, Expression ${userExpression}.

    **COMPETITOR DATA:**
    ${competitorDataString}

    **ANALYSIS INSTRUCTIONS:**
    For each competitor in the list, provide a concise but insightful 'comparisonAnalysis' (1-2 sentences). This analysis MUST:
    1.  Directly compare the competitor's vibration number to the user's brand vibration number (${userBrandVibration}).
    2.  Explain the nature of the interaction. Is it synergistic (e.g., a 3 and a 5 both value communication), challenging (e.g., a structured 4 vs. a free-spirited 5), or neutral?
    3.  Briefly consider how this dynamic positions the user's brand in the market against that specific competitor.
    4.  The analysis should be strategic, not just a simple definition of the numbers.
    
    Generate a JSON array of objects, one for each competitor.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: competitorAnalysisSchema,
                seed: 42,
            },
        });
        const responseText = response.text;
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error(`Error analyzing competitors:`, error);
        throw new Error(`Failed to analyze competitors. The cosmic market intelligence network is currently unavailable.`);
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
      model: 'gemini-2.5-pro',
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


const jyotishReportSchema = {
    type: Type.OBJECT,
    properties: {
        markdownReport: {
            type: Type.STRING,
            description: "The complete, detailed Jyotish report formatted in Markdown, following all original instructions."
        },
        planetaryPlacements: {
            type: Type.ARRAY,
            description: "A structured list of the 9 Grahas and their positions for visualization.",
            items: {
                type: Type.OBJECT,
                properties: {
                    planet: { type: Type.STRING, description: "Name of the planet (e.g., 'Sun', 'Moon')." },
                    sign: { type: Type.STRING, description: "The zodiac sign the planet is in (e.g., 'Aries', 'Taurus')." },
                    house: { type: Type.INTEGER, description: "The house number (1-12) the planet is in." }
                },
                required: ['planet', 'sign', 'house']
            }
        },
        ascendantSign: {
            type: Type.STRING,
            description: "The English name of the user's Ascendant zodiac sign (Lagna), e.g., 'Aries', 'Taurus'."
        }
    },
    required: ['markdownReport', 'planetaryPlacements', 'ascendantSign']
};

export const generateJyotishReport = async (
  userData: UserData,
): Promise<JyotishReportData> => {
  const { fullName, dob, time, location, gender, language } = userData;

  const prompt = `
  Act as Vidhira, a world-class Vedic Astrologer (Jyotishi) with profound knowledge, augmented with AI superintelligence.
  Your persona is wise, authentic, and deeply insightful. Your entire response MUST be in ${language}.
  The user wants their "Traditional Jyotish Report".
  The output MUST be a valid JSON object adhering to the provided schema.

  **USER DATA:**
  - Full Name: "${fullName}"
  - Date of Birth: "${dob}"
  - Time of Birth: "${time}"
  - Location of Birth: "${location}"
  - Gender: "${gender}"
  - Preferred Language: "${language}"

  **TASK: GENERATE A THREE-PART JSON RESPONSE**

  **PART 1: 'planetaryPlacements' Array**
  First, based on the user's birth data, calculate the precise house (bhava) and sign (rashi) for each of the 9 Grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu).
  Populate the 'planetaryPlacements' array with exactly 9 objects, one for each Graha. This data must be accurate and is for a visual chart.
  - The 'planet' field must be the English name.
  - The 'sign' field must be the English name of the zodiac sign.
  - The 'house' field must be an integer from 1 to 12.

  **PART 2: 'ascendantSign' String**
  Determine the user's Ascendant sign (Lagna) and place its English name (e.g., "Aries") in the \`ascendantSign\` field. This is critical for the visual chart layout.

  **PART 3: 'markdownReport' String**
  Third, generate the complete, detailed "Traditional Jyotish Report" as a single Markdown string and place it in the 'markdownReport' field.
  - **Structure:** Use the specified Markdown headings (e.g., '### 1. Janma Lagna...').
  - **Terminology:** For ALL key astrological terms within this markdown string, you MUST provide the English term followed by its traditional Sanskrit equivalent using this exact format: \`(Sanskrit: term)\`. Examples: "Ascendant (Sanskrit: Lagna)", "Planet (Sanskrit: Graha)". This is non-negotiable.
  - **Content:** Provide a detailed, authentic analysis for each section. Use **bolding** for key terms and bulleted lists for clarity.

  **MARKDOWN REPORT STRUCTURE (MUST BE FOLLOWED EXACTLY):**

  ### 1. Janma Lagna (Ascendant) & Core Analysis
  (Determine Lagna sign, its ruling planet. Describe physical/behavioral tendencies based on this.)

  ### 2. Graha (Planetary) Placement Overview
  (For each of the 9 Grahas, describe its placement by house and sign, its significance, and identify functional benefics/malefics for this specific Lagna.)

  ### 3. Key Yogas (Planetary Combinations)
  (Identify and explain 2-3 of the most significant Yogas, positive or negative (e.g., Raj Yogas, Dhana Yogas, Kemadruma Yoga). Explain their practical impact on the user's life - e.g., wealth, career, status.)

  ### 4. Major Doshas (Astrological Challenges)
  (Check for major Doshas like Manglik Dosha, Kaal Sarp Dosha, or Pitri Dosha. If present, explain the effects constructively and without fear-mongering. If none are significant, state that clearly.)

  ### 5. Vimshottari Dasha Analysis
  (State the current Mahadasha/Antardasha. Analyze its core themes and provide a brief, actionable forecast for the next 1-2 years based on this Dasha period.)

  ### 6. Gochar (Transit) Overview for 2025-2027
  (Analyze the impact of the major transits of Saturn (Shani), Jupiter (Guru), and Rahu-Ketu for the specified period based on the user's Moon Sign (Rashi).)

  ### 7. Personalized Remedies & Actionable Guidance
  (Based on the entire analysis, provide a bulleted list of 3-4 simple, practical, and personalized remedies. These can include:
  - **Gemstone:** Suggest one primary gemstone.
  - **Mantra:** A specific mantra for a key planet.
  - **Lifestyle:** A practical lifestyle or behavioral adjustment.
  - **Spiritual:** A simple daily practice or ritual.)

  ### 8. Summary & Final Guidance
  (Conclude with key strengths/weaknesses and offer holistic, empowering advice.)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: jyotishReportSchema,
        seed: 42,
      },
    });
    const responseText = response.text;
    // Fix: Safely parse JSON response which might be wrapped in markdown backticks.
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }
    const reportData = JSON.parse(jsonStr);
    
    return reportData;
  } catch (error) {
    console.error("Error generating Jyotish report:", error);
    throw new Error("Failed to generate the Jyotish report. The celestial connection is currently unclear. Please try again later.");
  }
};