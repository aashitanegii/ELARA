/**
 * Intent-aware fallback response builders.
 * Provides educational responses when the Gemini API is unavailable.
 * Extracted from routes/ai.js for clean module separation.
 * @module services/fallbacks
 */

const WALKTHROUGH_STAGES = require('../data/walkthrough');
const JARGON_DB = require('../data/jargonDictionary');

/**
 * Build a jargon definition from the built-in dictionary.
 * Falls back to a generic placeholder if the term is not found.
 * @param {string} query - The user's jargon query
 * @returns {string} Formatted jargon explanation
 */
function buildJargonFallback(query) {
  const term = query.replace(/^explain this election term.*?:/i, '').replace(/"/g, '').trim();
  const t = term.toLowerCase();

  const entry = JARGON_DB[t];
  if (entry) {
    return `**What it means:** ${entry.meaning}\n\n` +
      `**Where it's used:** ${entry.where}\n\n` +
      `**Why it matters:** ${entry.why}\n\n` +
      `**Simple analogy:** ${entry.analogy}\n\n` +
      `📎 *Source: Election Commission of India (eci.gov.in)*\n\n` +
      `[BADGE: Beginner Friendly]`;
  }

  return `**What it means:** "${term}" is an election-related term.\n\n` +
    `**Where it's used:** This term appears in electoral processes and democratic governance.\n\n` +
    `**Why it matters:** Understanding election terminology helps you participate more effectively as a voter.\n\n` +
    `I'd love to explain this in more detail — please try again in a moment when the AI service is available.\n\n` +
    `📎 *For official definitions, visit: eci.gov.in*\n\n` +
    `[BADGE: Beginner Friendly]`;
}

/**
 * Build a timeline stage explanation from the walkthrough data.
 * Matches the user's query against stage names for specific responses.
 * @param {string} query - The user's timeline query
 * @param {string} memoryLine - Context continuity line from micro-memory
 * @returns {string} Formatted timeline explanation
 */
function buildTimelineFallback(query, memoryLine) {
  const q = query.toLowerCase();

  for (const stage of WALKTHROUGH_STAGES) {
    if (q.includes(stage.stage.toLowerCase())) {
      return `## ${stage.icon} ${stage.stage}${memoryLine}\n\n` +
        `${stage.summary}\n\n` +
        stage.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n' +
        `**Typical duration:** ${stage.duration}\n` +
        `**What comes next:** ${stage.nextStage}\n\n` +
        `📎 *Official resource: ${stage.officialLink}*\n\n` +
        `[BADGE: ${stage.badge}]`;
    }
  }

  return `The election process follows these key stages:${memoryLine}\n\n` +
    WALKTHROUGH_STAGES.map((s) => `${s.id}. **${s.stage}** — ${s.summary}`).join('\n') + '\n\n' +
    `Click on any stage in the timeline for a detailed explanation.\n\n` +
    `📎 *Source: Election Commission of India (eci.gov.in)*\n\n` +
    `[BADGE: Timeline Included]`;
}

/**
 * Build a personalized journey response based on the user's current stage.
 * @param {string} context - The user's journey context (e.g., "Not Registered")
 * @param {string} memoryLine - Context continuity line from micro-memory
 * @returns {string} Formatted journey guidance
 */
function buildJourneyFallback(context, memoryLine) {
  const stage = WALKTHROUGH_STAGES.find((s) => {
    if (context === 'Not Registered') return s.stage === 'Registration';
    if (context === 'Registered') return s.stage === 'Verification';
    if (context === 'Ready to Vote') return s.stage === 'Polling Day';
    return false;
  }) || WALKTHROUGH_STAGES[0];

  return `Since you're at the "${context}" stage, here's exactly what you should do next:${memoryLine}\n\n` +
    stage.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n' +
    `**Typical timeline:** ${stage.duration}\n` +
    `**After this step:** ${stage.nextStage}\n\n` +
    `📎 *Official portal: ${stage.officialLink}*\n\n` +
    `[BADGE: Next Step Ready]`;
}

/**
 * Build a general fallback by detecting topic keywords in the query.
 * Routes to specific fallbacks or provides document/deadline info.
 * @param {string} query - The user's general query
 * @param {string} context - The user's journey context
 * @param {string} memoryLine - Context continuity line from micro-memory
 * @returns {string} Formatted general response
 */
function buildGeneralFallback(query, context, memoryLine) {
  const q = query.toLowerCase();

  if (q.includes('register') || q.includes('registration') || q.includes('form 6')) {
    return buildTimelineFallback('registration', memoryLine);
  } else if (q.includes('verif') || q.includes('identity') || q.includes('approved')) {
    return buildTimelineFallback('verification', memoryLine);
  } else if (q.includes('poll') || q.includes('vote') || q.includes('election day') || q.includes('evm')) {
    return buildTimelineFallback('polling', memoryLine);
  } else if (q.includes('count') || q.includes('result') || q.includes('winner')) {
    return buildTimelineFallback('counting', memoryLine);
  } else if (q.includes('document') || q.includes('id proof') || q.includes('aadhaar')) {
    return `**Documents you need for the election process:**${memoryLine}\n\n` +
      `**Identity Proof (any one):**\n` +
      `• Aadhaar Card\n• Passport\n• Driving License\n• PAN Card\n• Bank Passbook with photo\n\n` +
      `**Address Proof (any one):**\n` +
      `• Utility bill (electricity, water, gas)\n• Bank statement\n• Rent agreement\n• Aadhaar Card\n\n` +
      `Keep both originals and photocopies ready — they'll be needed for registration and on election day.\n\n` +
      `📎 *Check your documents at: voters.eci.gov.in*\n\n` +
      `[BADGE: Verified Educational Info]`;
  } else if (q.includes('deadline') || q.includes('date') || q.includes('when') || q.includes('schedule')) {
    return `**Key election deadlines and dates:**${memoryLine}\n\n` +
      `1. **Registration deadline**: Usually closes 2–3 weeks before election date\n` +
      `2. **Electoral roll revision**: Happens twice a year (Jan 1 & Jul 1 qualifying dates)\n` +
      `3. **Polling date**: Announced by the Election Commission, varies by state\n` +
      `4. **Counting date**: Typically 3–5 days after the last phase of polling\n\n` +
      `Since you're at the "${context}" stage — make sure all your steps are completed well before the deadline.\n\n` +
      `📎 *Check dates at: eci.gov.in*\n\n` +
      `[BADGE: Timeline Included]`;
  }

  return buildJourneyFallback(context, memoryLine);
}

module.exports = {
  buildJargonFallback,
  buildTimelineFallback,
  buildJourneyFallback,
  buildGeneralFallback,
};
