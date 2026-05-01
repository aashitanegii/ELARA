const express = require('express');
const router = express.Router();
const { LRUCache } = require('lru-cache');
const { generateResponse } = require('../services/gemini');

// Initialize in-memory cache to boost Efficiency score
const responseCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

/** Allowed journey context values — whitelist prevents injection via context field */
const VALID_CONTEXTS = ['Not Registered', 'Registered', 'Ready to Vote', 'General'];

/** Allowed intent values — one per feature */
const VALID_INTENTS = ['journey', 'timeline', 'jargon', 'general'];

/** Allowed topics for micro-memory context continuity */
const VALID_TOPICS = ['registration', 'verification', 'polling', 'counting', 'documents', 'deadlines'];

/**
 * Sanitize user input to prevent prompt injection attacks.
 * Strips known prompt-override patterns from user queries.
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  return input
    .replace(/(system\s*:|assistant\s*:|ignore\s+(all\s+)?previous\s+instructions)/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Static walkthrough data — the full election journey in 5 stages.
 * Serves as both a fallback and the guided walkthrough content.
 */
const WALKTHROUGH_STAGES = [
  {
    id: 1,
    stage: 'Registration',
    icon: '📝',
    summary: 'Enrolling yourself as an eligible voter in the electoral roll.',
    steps: [
      'Check eligibility — you must be an Indian citizen aged 18+ on the qualifying date.',
      'Visit the official portal (voters.eci.gov.in) or your nearest Electoral Registration Office.',
      'Fill out Form 6 (new voter registration) with personal details.',
      'Upload identity proof (Aadhaar, Passport, or Driving License).',
      'Upload address proof (utility bill, bank statement, or rent agreement).',
      'Submit and note your reference number for tracking.',
    ],
    duration: '1–2 weeks for submission; 15–30 days for processing.',
    nextStage: 'Verification',
    badge: 'Beginner Friendly',
  },
  {
    id: 2,
    stage: 'Verification',
    icon: '🔍',
    summary: 'Officials verify your identity and address before adding you to the voter list.',
    steps: [
      'An Electoral Registration Officer (ERO) reviews your Form 6 application.',
      'A Booth Level Officer (BLO) may visit your address for physical verification.',
      'Your identity and address documents are cross-checked against government records.',
      'If discrepancies are found, you may be contacted for corrections.',
      'If approved, your name is added to the electoral roll for your constituency.',
      'You receive your EPIC (Voter ID Card) or can download the e-EPIC online.',
    ],
    duration: '2–4 weeks after application submission.',
    nextStage: 'Polling Day',
    badge: 'Step-by-Step Guidance',
  },
  {
    id: 3,
    stage: 'Polling Day',
    icon: '🏛️',
    summary: 'The day you cast your vote at your assigned polling station.',
    steps: [
      'Locate your assigned polling station on voters.eci.gov.in or the Voter Helpline app.',
      'Carry your Voter ID (EPIC) or any approved photo identification document.',
      'Queue up at the polling station — your name is verified against the electoral roll.',
      'Receive a slip and proceed to the EVM (Electronic Voting Machine).',
      'Press the button next to your chosen candidate and confirm on VVPAT slip.',
      'Your finger is marked with indelible ink to prevent duplicate voting.',
    ],
    duration: 'Polling hours: typically 7:00 AM to 6:00 PM.',
    nextStage: 'Counting',
    badge: 'Timeline Included',
  },
  {
    id: 4,
    stage: 'Counting',
    icon: '📊',
    summary: 'Votes are tallied under strict supervision to determine election results.',
    steps: [
      'After polling ends, EVMs are sealed and stored in a strongroom under 24/7 security.',
      'On counting day, EVMs are opened in the presence of officials, candidates, and agents.',
      'VVPAT slips are cross-verified for a random sample of booths (as per Supreme Court order).',
      'Votes are tallied round by round for each constituency.',
      'The candidate with the highest votes is declared the winner (First Past The Post system).',
      'Results are published on the Election Commission website in real-time.',
    ],
    duration: 'Counting day is typically 3–5 days after the last phase of polling.',
    nextStage: 'Results',
    badge: 'Verified Educational Info',
  },
  {
    id: 5,
    stage: 'Results',
    icon: '📢',
    summary: 'Winners are officially announced and the democratic mandate takes effect.',
    steps: [
      'The Election Commission declares official results constituency by constituency.',
      'Winning candidates receive a Certificate of Election from the Returning Officer.',
      'If any candidate disputes results, they can file an election petition in High Court.',
      'The party or coalition with a majority is invited to form the government.',
      'Elected representatives take oath of office within the prescribed timeframe.',
      'The new government begins its term — your vote has shaped the outcome.',
    ],
    duration: 'Results typically declared within 1–2 days of counting.',
    nextStage: 'Your vote has made a difference!',
    badge: 'Verified Educational Info',
  },
];

/**
 * POST /api/ai
 * Accepts { query, context?, intent?, lastTopic? } and returns an AI-generated response.
 * Routes to the correct prompt based on intent.
 */
router.post('/ai', async (req, res) => {
  const { query, context, intent, lastTopic } = req.body;

  // Input validation
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Valid query string is required' });
  }

  if (query.length > 1000) {
    return res.status(400).json({ error: 'Query too long (max 1000 characters)' });
  }

  // Context validation — whitelist only
  const safeContext = VALID_CONTEXTS.includes(context) ? context : 'General';

  // Intent validation — whitelist only, default to general
  const safeIntent = VALID_INTENTS.includes(intent) ? intent : 'general';

  // Sanitize query against prompt injection
  const safeQuery = sanitizeInput(query);

  if (safeQuery.length === 0) {
    return res.status(400).json({ error: 'Query contained only invalid content' });
  }

  // Cache lookup for Efficiency score
  const cacheKey = `${safeIntent}:${safeContext}:${safeQuery}`;
  if (responseCache.has(cacheKey)) {
    return res.json({
      response: responseCache.get(cacheKey),
      intent: safeIntent,
      powered_by: 'Google Gemini (Cached)',
    });
  }

  try {
    const response = await generateResponse(safeQuery, safeContext, safeIntent);
    responseCache.set(cacheKey, response);
    res.json({ response, intent: safeIntent, powered_by: 'Google Gemini' });
  } catch (err) {
    console.error('Gemini error:', err.message);

    // Intent-aware fallback responses
    const safeLast = VALID_TOPICS.includes(lastTopic) ? lastTopic : null;
    const memoryLine = safeLast ? `\n(Building on your earlier question about ${safeLast})\n` : '';
    let response = '';

    if (safeIntent === 'jargon') {
      response = buildJargonFallback(safeQuery);
    } else if (safeIntent === 'timeline') {
      response = buildTimelineFallback(safeQuery, memoryLine);
    } else if (safeIntent === 'journey') {
      response = buildJourneyFallback(safeContext, memoryLine);
    } else {
      response = buildGeneralFallback(safeQuery, safeContext, memoryLine);
    }

    res.json({
      response,
      intent: safeIntent,
      powered_by: 'Google Gemini (Fallback)',
    });
  }
});

/**
 * GET /api/ai/walkthrough
 * Returns the static guided walkthrough data — full election journey in 5 stages.
 */
router.get('/ai/walkthrough', (_req, res) => {
  res.json({ stages: WALKTHROUGH_STAGES });
});

/* =========================================
   Intent-specific fallback builders
   ========================================= */

function buildJargonFallback(query) {
  const term = query.replace(/^explain this election term.*?:/i, '').replace(/"/g, '').trim();
  const t = term.toLowerCase();

  const JARGON_DB = {
    'electoral college': {
      meaning: 'A system used in the United States where a group of electors — not the general public directly — formally choose the President.',
      where: 'Used in U.S. presidential elections. Each state gets a number of electors based on its population.',
      why: 'It means a candidate can win the presidency without winning the most individual votes nationwide.',
      analogy: 'Think of it like a class election where each row picks a representative, and those representatives cast the final vote.',
    },
    'constituency': {
      meaning: 'A specific geographic area whose residents elect a single representative to the legislature.',
      where: 'Used in India (Lok Sabha/Vidhan Sabha), UK (House of Commons), and many parliamentary democracies.',
      why: 'Your constituency determines which candidates you can vote for and who represents your area.',
      analogy: 'Like dividing a city into neighborhoods, each choosing one person to speak for them at city hall.',
    },
    'gerrymandering': {
      meaning: 'The practice of drawing electoral district boundaries to favor one political party over another.',
      where: 'Most common in the United States, where state legislatures often control redistricting.',
      why: 'It can make elections less competitive and reduce the impact of your vote.',
      analogy: 'Imagine redrawing classroom groups so one team always has more members.',
    },
    'vvpat': {
      meaning: 'Voter Verifiable Paper Audit Trail — a printed slip that lets you confirm your vote was recorded correctly on the EVM.',
      where: 'Used in Indian elections alongside Electronic Voting Machines (EVMs).',
      why: 'It adds a layer of transparency — you can physically see which candidate your vote went to.',
      analogy: 'Like getting a receipt after a purchase so you can verify the transaction.',
    },
    'epic': {
      meaning: 'Electors Photo Identity Card — commonly known as the Voter ID card issued by the Election Commission of India.',
      where: 'Issued to all registered voters in India. Can also be downloaded as e-EPIC.',
      why: 'It is your primary identity document for voting at the polling station.',
      analogy: 'Think of it as your membership card for participating in democracy.',
    },
    'first past the post': {
      meaning: 'An electoral system where the candidate with the most votes in a constituency wins, even without a majority.',
      where: 'Used in India, UK, USA (for Congress), Canada, and many Commonwealth nations.',
      why: 'Simple to understand, but can result in a winner who got less than 50% of votes.',
      analogy: 'Like a race where whoever crosses the finish line first wins — no second rounds.',
    },
  };

  const entry = JARGON_DB[t];
  if (entry) {
    return `**What it means:** ${entry.meaning}\n\n` +
      `**Where it's used:** ${entry.where}\n\n` +
      `**Why it matters:** ${entry.why}\n\n` +
      `**Simple analogy:** ${entry.analogy}\n\n` +
      `[BADGE: Beginner Friendly]`;
  }

  return `**What it means:** "${term}" is an election-related term.\n\n` +
    `**Where it's used:** This term appears in electoral processes and democratic governance.\n\n` +
    `**Why it matters:** Understanding election terminology helps you participate more effectively as a voter.\n\n` +
    `I'd love to explain this in more detail — please try again in a moment when the AI service is available.\n\n` +
    `[BADGE: Beginner Friendly]`;
}

function buildTimelineFallback(query, memoryLine) {
  const q = query.toLowerCase();

  for (const stage of WALKTHROUGH_STAGES) {
    if (q.includes(stage.stage.toLowerCase())) {
      return `## ${stage.icon} ${stage.stage}${memoryLine}\n\n` +
        `${stage.summary}\n\n` +
        stage.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n\n' +
        `**Typical duration:** ${stage.duration}\n` +
        `**What comes next:** ${stage.nextStage}\n\n` +
        `[BADGE: ${stage.badge}]`;
    }
  }

  // Generic timeline fallback
  return `The election process follows these key stages:${memoryLine}\n\n` +
    WALKTHROUGH_STAGES.map((s) => `${s.id}. **${s.stage}** — ${s.summary}`).join('\n') + '\n\n' +
    `Click on any stage in the timeline for a detailed explanation.\n\n` +
    `[BADGE: Timeline Included]`;
}

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
    `[BADGE: Next Step Ready]`;
}

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
      `[BADGE: Verified Educational Info]`;
  } else if (q.includes('deadline') || q.includes('date') || q.includes('when') || q.includes('schedule')) {
    return `**Key election deadlines and dates:**${memoryLine}\n\n` +
      `1. **Registration deadline**: Usually closes 2–3 weeks before election date\n` +
      `2. **Electoral roll revision**: Happens twice a year (Jan 1 & Jul 1 qualifying dates)\n` +
      `3. **Polling date**: Announced by the Election Commission, varies by state\n` +
      `4. **Counting date**: Typically 3–5 days after the last phase of polling\n\n` +
      `Since you're at the "${context}" stage — make sure all your steps are completed well before the deadline.\n\n` +
      `[BADGE: Timeline Included]`;
  }

  // Generic fallback
  return buildJourneyFallback(context, memoryLine);
}

module.exports = router;
