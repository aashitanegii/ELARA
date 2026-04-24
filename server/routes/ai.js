const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/gemini');

/** Allowed journey context values — whitelist prevents injection via context field */
const VALID_CONTEXTS = ['Not Registered', 'Registered', 'Ready to Vote', 'General'];

/** Randomized openers to prevent fallback responses from feeling repetitive */
const OPENERS = [
  (stage) => `Based on your current stage (${stage}), here's exactly what you should do next:`,
  (stage) => `Since you selected "${stage}", let's walk through this step-by-step:`,
  (stage) => `Great question! Here's your personalized guidance for the "${stage}" stage:`,
  (stage) => `Let me guide you through this. As someone at the "${stage}" stage:`,
  (stage) => `Here's what matters most for you right now (${stage}):`,
];
function randomOpener(stage) {
  return OPENERS[Math.floor(Math.random() * OPENERS.length)](stage);
}

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
 * POST /api/ai
 * Accepts { query: string, context?: string } and returns an AI-generated response.
 * Validates input length, type, and context before forwarding to Gemini.
 */
router.post('/ai', async (req, res) => {
  const { query, context, lastTopic } = req.body;

  // Input validation
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Valid query string is required' });
  }

  if (query.length > 1000) {
    return res.status(400).json({ error: 'Query too long (max 1000 characters)' });
  }

  // Context validation — whitelist only
  const safeContext = VALID_CONTEXTS.includes(context) ? context : 'General';

  // Sanitize query against prompt injection
  const safeQuery = sanitizeInput(query);

  if (safeQuery.length === 0) {
    return res.status(400).json({ error: 'Query contained only invalid content' });
  }

  try {
    const response = await generateResponse(safeQuery, safeContext);
    res.json({ response, powered_by: 'Google Gemini' });
  } catch (err) {
    console.error('Gemini error:', err.message);

    // Context-aware, query-aware fallback — varies by topic + journey stage
    const q = safeQuery.toLowerCase();
    const stage = safeContext;
    const safeLast = VALID_TOPICS.includes(lastTopic) ? lastTopic : null;
    const memoryLine = safeLast ? `\n\n(Building on your earlier question about ${safeLast} — here's the next piece:)\n` : '';
    let response = '';

    if (q.includes('register') || q.includes('registration') || q.includes('form 6')) {
      response = `${randomOpener(stage)}${memoryLine}\n\n` +
        `1. Visit the official voter registration portal (voters.eci.gov.in)\n` +
        `2. Fill out Form 6 — this is the new voter registration form\n` +
        `3. Upload identity proof (Aadhaar, Passport, or Driving License)\n` +
        `4. Upload address proof (utility bill, bank statement, or rent agreement)\n` +
        `5. Submit and note your reference number for tracking\n` +
        `6. Watch for the verification officer's visit within 15–30 days\n\n` +
        `You're at the first step of your voting journey — registration. Once approved, we'll move to verification.\n\n` +
        `Confidence: 91%`;
    } else if (q.includes('verif') || q.includes('identity') || q.includes('approved')) {
      response = `${randomOpener(stage)}${memoryLine}\n\n` +
        `1. After submitting Form 6, an Electoral Registration Officer (ERO) reviews your application\n` +
        `2. A Booth Level Officer (BLO) may visit your address for physical verification\n` +
        `3. Your documents (ID + address proof) are cross-checked against records\n` +
        `4. If approved, your name is added to the electoral roll\n` +
        `5. You receive your EPIC (Voter ID Card) or can download the e-EPIC\n\n` +
        `This step confirms you're eligible — once done, you'll be ready for election day.\n\n` +
        `Confidence: 89%`;
    } else if (q.includes('poll') || q.includes('vote') || q.includes('election day') || q.includes('evm') || q.includes('casting')) {
      response = `${randomOpener(stage)}${memoryLine}\n\n` +
        `1. Locate your assigned polling station (check on voters.eci.gov.in)\n` +
        `2. Carry your Voter ID (EPIC) or any approved photo document\n` +
        `3. Queue up — your name is verified against the electoral roll\n` +
        `4. Receive a slip and proceed to the EVM (Electronic Voting Machine)\n` +
        `5. Press the button next to your chosen candidate and confirm on VVPAT\n` +
        `6. Your finger is marked with indelible ink to prevent duplicate voting\n\n` +
        `Simple, secure, and structured — your vote is completely secret.\n\n` +
        `Confidence: 93%`;
    } else if (q.includes('count') || q.includes('result') || q.includes('winner') || q.includes('tally')) {
      response = `${randomOpener(stage)}${memoryLine}\n\n` +
        `1. After polling ends, EVMs are sealed and stored securely\n` +
        `2. On counting day, EVMs are opened in the presence of officials and agents\n` +
        `3. VVPAT slips are cross-verified for a random sample of booths\n` +
        `4. Votes are tallied round by round for each constituency\n` +
        `5. The candidate with the highest votes is declared the winner\n` +
        `6. Results are published on the Election Commission website in real-time\n\n` +
        `The entire process is transparent and closely monitored by observers.\n\n` +
        `Confidence: 90%`;
    } else if (q.includes('document') || q.includes('id proof') || q.includes('aadhaar') || q.includes('passport')) {
      response = `${randomOpener(stage)}${memoryLine}\n\n` +
        `**Identity Proof (any one):**\n` +
        `• Aadhaar Card\n• Passport\n• Driving License\n• PAN Card\n• Bank Passbook with photo\n\n` +
        `**Address Proof (any one):**\n` +
        `• Utility bill (electricity, water, gas)\n• Bank statement\n• Rent agreement\n• Aadhaar Card\n\n` +
        `Keep both originals and photocopies ready — they'll be needed for registration and on election day.\n\n` +
        `Confidence: 92%`;
    } else if (q.includes('deadline') || q.includes('date') || q.includes('when') || q.includes('schedule')) {
      response = `${randomOpener(stage)}${memoryLine}\n\n` +
        `1. **Registration deadline**: Usually closes 2–3 weeks before election date\n` +
        `2. **Electoral roll revision**: Happens twice a year (Jan 1 & Jul 1 qualifying dates)\n` +
        `3. **Polling date**: Announced by the Election Commission, varies by state\n` +
        `4. **Counting date**: Typically 3–5 days after the last phase of polling\n\n` +
        `Since you're at the "${stage}" stage — make sure all your steps are completed well before the deadline.\n\n` +
        `Confidence: 88%`;
    } else {
      response = `${randomOpener(stage)}${memoryLine}\n\n` +
        `1. ${stage === 'Not Registered' ? 'Complete voter registration via Form 6' : stage === 'Registered' ? 'Verify your name appears on the electoral roll' : 'Locate your polling station and prepare your documents'}\n` +
        `2. ${stage === 'Not Registered' ? 'Gather ID and address proof documents' : stage === 'Registered' ? 'Download or collect your EPIC (Voter ID)' : 'Review candidate information for your constituency'}\n` +
        `3. ${stage === 'Not Registered' ? 'Submit application and track status online' : stage === 'Registered' ? 'Check your polling station assignment' : 'Plan your visit — know your booth number and timings'}\n` +
        `4. Stay updated with Election Commission announcements\n\n` +
        `ELARA is guiding you step-by-step through your voting journey. Ask me about any specific step for detailed guidance.\n\n` +
        `Confidence: 87%`;
    }

    res.json({
      response,
      powered_by: 'Google Gemini (Fallback)',
    });
  }
});

module.exports = router;
