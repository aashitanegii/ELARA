// Mock Gemini service BEFORE importing app — prevents real API calls in tests
jest.mock('../services/gemini', () => ({
  generateResponse: jest.fn().mockResolvedValue(
    'Summary: You need to register to vote.\n\n' +
    'Steps:\n1. Visit your local election office\n2. Bring valid ID\n3. Fill out the registration form\n\n' +
    '[BADGE: Beginner Friendly]'
  ),
}));

const request = require('supertest');
const app = require('../index');
const { generateResponse } = require('../services/gemini');

describe('ELARA API Tests', () => {
  // --- Health Endpoint ---
  describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('contains service name and timestamp', async () => {
      const res = await request(app).get('/api/health');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.service).toBe('ELARA');
    });

    it('returns valid ISO timestamp', async () => {
      const res = await request(app).get('/api/health');
      const date = new Date(res.body.timestamp);
      expect(date.toISOString()).toBe(res.body.timestamp);
    });
  });

  // --- Input Validation ---
  describe('POST /api/ai — validation', () => {
    it('rejects empty body with 400', async () => {
      const res = await request(app).post('/api/ai').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('rejects whitespace-only query with 400', async () => {
      const res = await request(app).post('/api/ai').send({ query: '   ' });
      expect(res.statusCode).toBe(400);
    });

    it('rejects query exceeding 1000 chars with 400', async () => {
      const res = await request(app).post('/api/ai').send({ query: 'a'.repeat(1001) });
      expect(res.statusCode).toBe(400);
    });

    it('rejects non-string query with 400', async () => {
      const res = await request(app).post('/api/ai').send({ query: 12345 });
      expect(res.statusCode).toBe(400);
    });
  });

  // --- AI Success Path (mocked Gemini) ---
  describe('POST /api/ai — success', () => {
    beforeEach(() => {
      generateResponse.mockClear();
    });

    it('returns 200 with AI response for valid query', async () => {
      const res = await request(app)
        .post('/api/ai')
        .send({ query: 'How do I register to vote?', context: 'Not Registered' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('response');
      expect(res.body).toHaveProperty('powered_by', 'Google Gemini');
      expect(typeof res.body.response).toBe('string');
      expect(res.body.response.length).toBeGreaterThan(0);
    });

    it('passes correct arguments to Gemini service including intent', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'What is polling day?', context: 'Registered', intent: 'timeline' });

      expect(generateResponse).toHaveBeenCalledTimes(1);
      expect(generateResponse).toHaveBeenCalledWith(
        'What is polling day?',
        'Registered',
        'timeline'
      );
    });

    it('defaults context to General when not provided', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'What is an election?' });

      expect(generateResponse).toHaveBeenCalledWith(
        'What is an election?',
        'General',
        'general'
      );
    });

    it('defaults context to General for invalid context value', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'What is an election in India?', context: 'MALICIOUS_CONTEXT' });

      expect(generateResponse).toHaveBeenCalledWith(
        'What is an election in India?',
        'General',
        'general'
      );
    });

    it('defaults intent to general when not provided', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'How does voting work?', context: 'General' });

      expect(generateResponse).toHaveBeenCalledWith(
        'How does voting work?',
        'General',
        'general'
      );
    });

    it('defaults intent to general for invalid intent value', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'How does voting work in the UK?', intent: 'HACK_INTENT' });

      expect(generateResponse).toHaveBeenCalledWith(
        'How does voting work in the UK?',
        'General',
        'general'
      );
    });

    it('accepts valid intent values', async () => {
      for (const intent of ['journey', 'timeline', 'jargon', 'general']) {
        generateResponse.mockClear();
        await request(app)
          .post('/api/ai')
          .send({ query: 'Test query', intent });

        expect(generateResponse).toHaveBeenCalledWith(
          'Test query',
          'General',
          intent
        );
      }
    });

    it('includes intent in response body', async () => {
      const res = await request(app)
        .post('/api/ai')
        .send({ query: 'Explain VVPAT', intent: 'jargon' });

      expect(res.body).toHaveProperty('intent', 'jargon');
    });

    it('returns graceful fallback when Gemini service fails', async () => {
      generateResponse.mockRejectedValueOnce(new Error('API quota exceeded'));

      const res = await request(app)
        .post('/api/ai')
        .send({ query: 'How to vote?', context: 'General' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('response');
      expect(res.body).toHaveProperty('powered_by', 'Google Gemini (Fallback)');
    });

    it('returns jargon-specific fallback for jargon intent failure', async () => {
      generateResponse.mockRejectedValueOnce(new Error('API error'));

      const res = await request(app)
        .post('/api/ai')
        .send({ query: 'Explain this election term: "Electoral College"', intent: 'jargon' });

      expect(res.statusCode).toBe(200);
      expect(res.body.response).toContain('What it means');
      expect(res.body.response).toContain('[BADGE: Beginner Friendly]');
      expect(res.body.intent).toBe('jargon');
    });
  });

  // --- Walkthrough Endpoint ---
  describe('GET /api/ai/walkthrough', () => {
    it('returns 200 with walkthrough stages', async () => {
      const res = await request(app).get('/api/ai/walkthrough');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('stages');
      expect(Array.isArray(res.body.stages)).toBe(true);
      expect(res.body.stages.length).toBe(5);
    });

    it('includes all 5 election stages in order', async () => {
      const res = await request(app).get('/api/ai/walkthrough');
      const stageNames = res.body.stages.map((s) => s.stage);
      expect(stageNames).toEqual(['Registration', 'Verification', 'Polling Day', 'Counting', 'Results']);
    });

    it('each stage has required fields', async () => {
      const res = await request(app).get('/api/ai/walkthrough');
      for (const stage of res.body.stages) {
        expect(stage).toHaveProperty('id');
        expect(stage).toHaveProperty('stage');
        expect(stage).toHaveProperty('summary');
        expect(stage).toHaveProperty('steps');
        expect(stage).toHaveProperty('duration');
        expect(stage).toHaveProperty('nextStage');
        expect(stage).toHaveProperty('badge');
        expect(Array.isArray(stage.steps)).toBe(true);
        expect(stage.steps.length).toBeGreaterThanOrEqual(5);
      }
    });
  });
});
