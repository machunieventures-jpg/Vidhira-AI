

import { GoogleGenAI, Type } from "@google/genai";
import type { UserData, CoreNumbers, CompoundNumbers, WorldClassReport, LoshuAnalysisPillar, ChatMessage } from '../types';
import { calculateNameNumbers } from './numerologyService';

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
        }
    },
    required: [
        'kundaliSnapshot', 'cosmicIdentity', 'loshuAnalysis', 'wealthBusinessCareer', 'healthEnergyWellness', 'relationshipsFamilyLegacy',
        'psychologyShadowWork', 'dailyNavigator', 'spiritualAlignment', 'intellectEducation', 'futureForecast'
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

  **TASK 2: 10-PILLAR NUMEROLOGY REPORT**
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
      },
    });

    const responseText = response.text;
    const reportData = JSON.parse(responseText);
    
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


export const generateJyotishReport = async (
  userData: UserData,
): Promise<string> => {
  const { fullName, dob, time, location, gender, language } = userData;

  const prompt = `
  Act as Vidhira, a world-class Vedic Astrologer (Jyotishi) with profound knowledge of Parashari and Jaimini systems, augmented with AI superintelligence.
  Your persona is wise, authentic, and deeply insightful, blending ancient scriptural knowledge with practical, modern guidance.
  Your entire response, including all text and interpretations, MUST be in ${language}.
  The user wants their "Traditional Jyotish Report". Generate a comprehensive report based on their data.
  The output MUST be a detailed, multi-paragraph report formatted in Markdown.

  **CRITICAL INSTRUCTION:** For all key astrological terms, you MUST provide the English term followed by its traditional Sanskrit equivalent using this exact format: \`(Sanskrit: term)\`. For example: "Ascendant (Sanskrit: Lagna)", "Planet (Sanskrit: Graha)", "House (Sanskrit: Bhava)", "Sign (Sanskrit: Rashi)", "Yogas (Sanskrit: Planetary Combinations)". This adds authenticity and educational value.

  **USER DATA:**
  - Full Name: "${fullName}"
  - Date of Birth: "${dob}"
  - Time of Birth: "${time}"
  - Location of Birth: "${location}"
  - Gender: "${gender}"
  - Preferred Language: "${language}"

  **TASK: GENERATE A TRADITIONAL JYOTISH REPORT**
  Structure your response using the following Markdown headings. For each section, provide a detailed, authentic analysis based on the user's birth data. Use **bolding** for key terms (like planetary names or house numbers) and bulleted lists for clarity where appropriate.

  ### 1. Janma Lagna (Ascendant) & Basic Chart Structure
  - Determine the Lagna (Sanskrit: Lagna) sign and its ruling planet based on the birth data.
  - Describe the user's core physical and behavioral tendencies influenced by the Lagna and its lord.
  - Briefly describe the structure of their Rasi (Sanskrit: Rasi) (D1) chart.

  ### 2. Graha (Planetary) Placement Overview
  - For each of the 9 Grahas (Sanskrit: Graha) (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu), describe its placement by house (Sanskrit: Bhava) and sign (Sanskrit: Rashi).
  - Explain the significance of each placement.
  - Identify the functional benefics and malefics for this specific Lagna and explain their roles.

  ### 3. Moon Chart (Chandra Lagna)
  - Analyze the chart from the perspective of the Moon's position (Sanskrit: Chandra Lagna).
  - Describe the user's emotional nature, mental patterns, and key relationships as seen from the Chandra Lagna.

  ### 4. Navamsha (D9) & Varga Analysis
  - Provide a summary of the Navamsha (Sanskrit: Navamsha) (D9) chart.
  - Discuss what the D9 reveals about the user's marriage, dharma, inner self, and the true strength of the planets.
  - Briefly mention any significant planetary positions in other important Varga charts if possible, like Dashamsha (D10) for career.

  ### 5. Yogas & Raj Yogas
  - Identify and explain any major Yogas (Sanskrit: Yoga) (planetary combinations) present in the chart.
  - Specifically highlight any Raj Yogas (Sanskrit: Raja Yoga) (combinations for power and success), Dhana Yogas (Sanskrit: Dhana Yoga) (wealth combinations), or other significant yogas like Gaja Kesari Yoga. Explain their practical implications.

  ### 6. Doshas & Balancing Remedies
  - Check for major Doshas (Sanskrit: Dosha) like Manglik Dosha (Sanskrit: Kuja Dosha), Kaal Sarp Dosha, or Pitra Dosha.
  - If a Dosha is present, explain its potential effects calmly and constructively.
  - **Crucially, provide simple, practical, and empowering remedies.** Suggest gemstone recommendations (with correct finger and metal), specific mantras, charitable acts, or lifestyle adjustments to balance these energies.

  ### 7. Dasha System (Vimshottari Focus)
  - Calculate and state the current Mahadasha (Sanskrit: Mahadasha) (major period) and Antardasha (Sanskrit: Antardasha) (sub-period) the user is running.
  - Analyze the themes, opportunities, and challenges of this current period based on the Dasha lords' placement and nature in their chart.
  - Provide a brief forecast focusing on the period from 2025 to 2032, highlighting key upcoming Dasha changes.

  ### 8. Transit (Gochar) Overview
  - Analyze the impact of the major transits (Sanskrit: Gochara) of Saturn (Sanskrit: Shani), Jupiter (Sanskrit: Guru), and Rahu-Ketu for the years 2025-2027 relative to the user's natal chart.
  - Explain how these transits will activate certain houses and influence specific areas of their life.

  ### 9. Summary & Final Guidance
  - Conclude with a summary of the key planetary strengths and weaknesses in the chart.
  - Offer holistic spiritual, karmic, and practical lifestyle advice to help the user navigate their path and maximize their potential.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating Jyotish report:", error);
    throw new Error("Failed to generate the Jyotish report. The celestial connection is currently unclear. Please try again later.");
  }
};