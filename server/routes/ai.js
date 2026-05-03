const express = require('express');
const router = express.Router();
const { LRUCache } = require('lru-cache');
const { generateResponse } = require('../services/gemini');
const { buildJargonFallback, buildTimelineFallback, buildJourneyFallback, buildGeneralFallback } = require('../services/fallbacks');
const WALKTHROUGH_STAGES = require('../data/walkthrough');

/** In-memory response cache — avoids duplicate Gemini calls for identical queries */
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

/** Allowed language codes */
const VALID_LANGUAGES = ['en', 'hi'];

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
 * Accepts { query, context?, intent?, lastTopic?, lang? } and returns an AI-generated response.
 * Routes to the correct prompt based on intent.
 */
router.post('/ai', async (req, res) => {
  const { query, context, intent, lastTopic, lang } = req.body;

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

  // Language validation — whitelist only, default to English
  const safeLang = VALID_LANGUAGES.includes(lang) ? lang : 'en';

  // Sanitize query against prompt injection
  const safeQuery = sanitizeInput(query);

  if (safeQuery.length === 0) {
    return res.status(400).json({ error: 'Query contained only invalid content' });
  }

  // Cache lookup — keyed by intent, context, query, and language
  const cacheKey = `${safeIntent}:${safeContext}:${safeLang}:${safeQuery}`;
  if (responseCache.has(cacheKey)) {
    return res.json({
      response: responseCache.get(cacheKey),
      intent: safeIntent,
      lang: safeLang,
      powered_by: 'Google Gemini (Cached)',
    });
  }

  try {
    const response = await generateResponse(safeQuery, safeContext, safeIntent, safeLang);
    responseCache.set(cacheKey, response);
    res.json({ response, intent: safeIntent, lang: safeLang, powered_by: 'Google Gemini' });
  } catch (err) {
    // Intentionally log error server-side only — never expose internal details to client
    console.error('Gemini error:', err.message);

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
      lang: safeLang,
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

module.exports = router;
