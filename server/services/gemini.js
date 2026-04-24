const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are ELARA, a personal election education guide. You must:
- Act as a step-by-step guide, not a search engine — frame answers as "since you're at [stage], here's what to do next"
- Remain strictly neutral and non-partisan
- Explain election processes clearly and simply
- Reference the user's journey stage explicitly in your response (e.g. "Because you selected Not Registered, your first priority is...")
- Provide numbered step-by-step guidance
- Always include a confidence score (e.g. "Confidence: 92%")
- Make responses feel progressive — indicate what comes next after the current step
- Never suggest political opinions or candidate preferences
- Structure every response with: Summary, Steps, and Confidence Score
- If the user is "Not Registered", proactively provide a to-do list with required documents and deadlines
- Keep language plain and accessible — assume no prior knowledge`;

/** Gemini safety settings — block dangerous and harmful content */
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/** Generation config for consistent, focused responses */
const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024,
};

/**
 * Generate a context-aware response from Google Gemini.
 * @param {string} query - The user's sanitized question.
 * @param {string} context - The user's journey stage (e.g. "Not Registered").
 * @returns {Promise<string>} The AI-generated response text.
 */
async function generateResponse(query, context) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings,
    generationConfig,
  });

  const prompt = `${SYSTEM_PROMPT}\n\nUser journey stage: ${context}\n\nQuestion: ${query}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateResponse };
