import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { UserData, CoreNumbers, CompoundNumbers, KarmicDebtNumbers, WorldClassReport, LoshuAnalysisPillar, ChatMessage, JyotishReportData, MethodologyPillar, BrandAnalysisV2, PhoneNumberAnalysis, CompetitorBrandAnalysis, LogoAnalysis, CalendarDayInsight } from '../types';
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

export const generateWorldClassReport = async (
    userData: UserData,
    coreNumbers: CoreNumbers,
    compoundNumbers: CompoundNumbers,
    karmicDebtNumbers: KarmicDebtNumbers,
    loshu: Pick<LoshuAnalysisPillar, 'missingNumbers' | 'overloadedNumbers'>
): Promise<Omit<WorldClassReport, 'loshuAnalysis'> & { loshuAnalysis: Omit<LoshuAnalysisPillar, 'grid' | 'missingNumbers' | 'overloadedNumbers'> }> => {
  const { fullName, dob, time, location, gender, language, phoneNumber } = userData;

  const prompt = `
  Act as Arvind Sud, a world-renowned numerologist and cosmic scientist known for his professional, accurate, and deeply insightful analysis. Your framework, the Sud Numerology Matrix, blends the timeless wisdom of Chaldean numerology with modern, actionable strategies.
  Your persona is inspiring, precise, and deeply personalized. You do not use fluffy or overly mystical language; your insights are direct, clear, and grounded in the energetic science of numbers.
  Your entire response, including all text, interpretations, and markdown content, MUST be in ${language}.
  The user wants their "FULL LIFE REPORT BLUEPRINT". Generate a comprehensive report based on their data.
  The output MUST be a valid JSON object that adheres to the provided schema.

  **CRITICAL INSTRUCTIONS:**
  1.  **Strictly Chaldean:** Your entire numerological analysis MUST be based exclusively on the Chaldean system. This is a critical requirement for accuracy. Do not blend concepts, interpretations, or planetary associations from Pythagorean or any other numerology system. Every piece of numerological insight must be pure Chaldean.
  2.  **Terminology:** For key numerological and astrological terms, you MUST provide the English term followed by its traditional Sanskrit equivalent using this exact format: \`(Sanskrit: term)\`. For example: "Life Path Number (Sanskrit: Jeevan Pathank)", "Expression Number (Sanskrit: Namank)", "Ascendant (Sanskrit: Lagna)". This is crucial for authenticity and proper rendering.
  3.  **Karmic Debt:** If a core number has an associated Karmic Debt Number (13, 14, 16, 19), you MUST populate the 'karmicDebt' field with that number. Within the main 'interpretation' for that number, you MUST include a specific, in-depth interpretation of that karmic lesson. Explain the nature of the debt, the challenges it presents, and the path to overcoming it with practical advice. This is a critical part of the analysis.
  4.  **AI Reflection Coach:** For EVERY pillar or sub-pillar with a 'content' field, you MUST also generate a thought-provoking, personalized 'journalPrompt'. This prompt must be a single question designed to help the user reflect on that pillar's insights and apply them to their life. This is a mandatory field.
  5.  **Specificity:** Generic advice is not acceptable. For the 'wealthBusinessCareer' and 'intellectEducation' pillars, you must provide highly specific and actionable recommendations.
      *   **For Career:** Instead of "good in business", suggest specific industries (e.g., "fintech, sustainable agriculture, AI-driven marketing") and roles (e.g., "product manager, data scientist, strategic consultant"). Be bold and precise.
      *   **For Education:** Instead of "suited for higher learning", recommend specific degree programs or certifications (e.g., "a Master's in Computer Science with a specialization in Machine Learning", "a certification in Digital Marketing from Google or HubSpot", "a degree in Psychology focusing on cognitive-behavioral therapy"). Base these on the user's core numbers for maximum relevance.
  6.  **Teasers & Content:** For every pillar or sub-pillar with a 'teaser' and 'content' field, you MUST provide both. The 'teaser' must be a short, 1-2 sentence summary. The 'content' must be the full, detailed analysis.
  7.  **Planetary Rulers:** For each core number, you MUST also determine its ruling planet based on the Chaldean system (1-Sun, 2-Moon, 3-Jupiter, 4-Rahu, 5-Mercury, 6-Venus, 7-Ketu, 8-Saturn, 9-Mars) and populate the 'planetaryRuler' field.
  8.  **Full Loshu Analysis**: For the 'loshuAnalysis.planes' object, you MUST provide a full analysis for ALL EIGHT planes of the Loshu grid: Mental, Emotional, Practical (rows), Thought, Will, Action (columns), and Determination, Spiritual (diagonals). For each plane, determine if it is complete or incomplete and provide a corresponding insightful interpretation.

  **USER DATA:**
  - Full Name: "${fullName}"
  - Date of Birth: "${dob}"
  - Time of Birth: "${time}"
  - Location of Birth: "${location}"
  - Gender: "${gender}"
  - Phone Number: "${phoneNumber}"
  - Preferred Language: "${language}"

  **CALCULATED NUMEROLOGY DATA (Chaldean Method):**
  - Life Path Number: ${coreNumbers.lifePath} (from compound ${compoundNumbers.lifePath}) ${karmicDebtNumbers.lifePath ? `-> KARMIC DEBT: ${karmicDebtNumbers.lifePath}` : ''}
  - Expression Number: ${coreNumbers.expression} (from compound ${compoundNumbers.expression}) ${karmicDebtNumbers.expression ? `-> KARMIC DEBT: ${karmicDebtNumbers.expression}` : ''}
  - Soul Urge Number: ${coreNumbers.soulUrge} (from compound ${compoundNumbers.soulUrge}) ${karmicDebtNumbers.soulUrge ? `-> KARMIC DEBT: ${karmicDebtNumbers.soulUrge}` : ''}
  - Personality Number: ${coreNumbers.personality} (from compound ${compoundNumbers.personality}) ${karmicDebtNumbers.personality ? `-> KARMIC DEBT: ${karmicDebtNumbers.personality}` : ''}
  - Maturity Number: ${coreNumbers.maturity} (from compound ${compoundNumbers.maturity}) ${karmicDebtNumbers.maturity ? `-> KARMIC DEBT: ${karmicDebtNumbers.maturity}` : ''}
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
  3.  **numerologyMethod:** Set this to "Chaldean (Sud Numerology Matrix)".
  4.  **disclaimer:** Set this to "This Vidhira report is a digitally generated analysis for spiritual insight and personal development. It is not a substitute for professional advice in legal, medical, or financial matters. Major life decisions should be made in consultation with qualified experts. The guidance provided is intended to be empowering and supportive of your journey."

  **TASK 3: 10-PILLAR NUMEROLOGY REPORT**
  Now, generate the complete 10-pillar numerology report. For each core number's 'interpretation' field, provide a deep, multi-paragraph interpretation using Markdown. Use **bolding** for key traits, _italics_ for emphasis, and bulleted lists. For all markdown pillars, provide rich, detailed content with clear headings.

  **SPECIFIC INSTRUCTIONS FOR 'relationshipsFamilyLegacy' PILLAR:**
  In addition to the main content, generate the 'compatibilityAnalysis'.
  1.  For the user's Life Path number (${coreNumbers.lifePath}), identify its most compatible numbers (1-9). For each pairing, provide a detailed, 3-4 sentence interpretation explaining the synergistic dynamics, potential strengths, and areas of harmony.
  2.  For the user's Expression number (${coreNumbers.expression}), do the same, providing a detailed 3-4 sentence interpretation for each compatible pairing.
  3.  For the user's Soul Urge number (${coreNumbers.soulUrge}), do the same, providing a detailed 3-4 sentence interpretation for each compatible pairing.
  4.  **Friendly/Enemy Analysis:** Generate the 'friendlyAndEnemyNumbers' content. This analysis is critical.
      -   The 'teaser' should be a 1-sentence summary about the importance of number harmony.
      -   The 'content' must be a Markdown-formatted section. First, provide a short paragraph explaining the concept of friendly, neutral, and inimical numbers based on the user's primary Destiny Number (${coreNumbers.lifePath}).
      -   Then, create a well-structured Markdown table with three columns: "Friendly Numbers", "Neutral Numbers", "Enemy Numbers".
      -   For each column, list the corresponding numbers (1-9) and provide a concise, insightful explanation for *why* they have that relationship with the user's Destiny Number.
      -   Conclude the 'content' with a paragraph of actionable advice on how to leverage these relationships in personal and professional life.
      -   The 'journalPrompt' should ask a reflective question about their experiences with people who might embody these different number energies.
  
  For 'spiritualAlignment', determine their primary lucky color and provide its hex code. Also, generate 2-3 personalized, empowering mantras in the 'mantrasAndAffirmations' array.
  
  You must return a single JSON object. Do not include any text before or after the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        seed: 42,
      },
    });

    return extractJson(response.text);

  } catch (error) {
    console.error("Error generating world-class report:", error);
    throw new Error("Failed to generate the complete numerology report. The cosmic energies are currently unstable. Please try again.");
  }
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
            model: 'gemini-2.5-pro',
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
            model: 'gemini-2.5-pro',
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
    
    const competitorData = competitorNames.map(name => {
        const { expression } = calculateNameNumbers(name);
        return { name, vibration: expression };
    });

    const competitorDataString = competitorData.map(c => `- ${c.name} (Vibration: ${c.vibration})`).join('\n');

    const prompt = `
    Act as Arvind Sud, a master numerologist specializing in competitive strategy.
    Your entire response MUST be in ${language} and conform strictly to the provided JSON schema. The analysis must be strictly based on Chaldean numerology principles.

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
    
    Generate a JSON array of objects, one for each competitor. Do not include any text before or after the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                seed: 42,
            },
        });
        return extractJson(response.text);
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
    
    Generate a JSON array of objects, one for each suggested competitor. Do not include any text before or after the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                seed: 42,
            },
        });
        return extractJson(response.text);
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
  Act as Arvind Sud, a master of both Chaldean Numerology and Vedic Astrology (Jyotish). Your integrated approach provides a holistic view of the cosmic forces shaping a person's life.
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

  **TASK: GENERATE A FOUR-PART JSON RESPONSE**

  **PART 1: 'planetaryPlacements' Array**
  First, based on the user's birth data, calculate the precise house (bhava) and sign (rashi) for each of the 9 Grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu).
  Populate the 'planetaryPlacements' array with exactly 9 objects, one for each Graha. This data must be accurate and is for a visual chart.
  - The 'planet' field must be the English name.
  - The 'sign' field must be the English name of the zodiac sign.
  - The 'house' field must be an integer from 1 to 12.

  **PART 2: 'ascendantSign' String**
  Determine the user's Ascendant sign (Lagna) and place its English name (e.g., "Aries") in the \`ascendantSign\` field. This is critical for the visual chart layout.
  
  **PART 3: 'grahaBala' Array**
  Evaluate the strength (Bala) of each of the 9 Grahas. Consider factors like its sign (own, exaltation, debilitation), house placement (kendra, trikona), and aspects. Synthesize this into a 'score' from 0 (very weak) to 100 (very strong). Provide a concise 'summary' for each planet explaining its impact. Populate the 'grahaBala' array.

  **PART 4: 'markdownReport' String**
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
  - **Mantra:** A specific mantra to a deity or planet that would be beneficial.
  - **Ritual/Practice:** A simple daily or weekly practice (e.g., offering water to the Sun, charity on a specific day).
  - **Lifestyle Advice:** A practical lifestyle adjustment aligned with their chart (e.g., "focus on disciplined savings due to a strong Saturn").)
  
  You must return a single JSON object. Do not include any text before or after the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        seed: 42,
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
      model: 'gemini-2.5-pro',
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
      model: 'gemini-2.5-pro',
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