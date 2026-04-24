// Mock Gemini service BEFORE importing app — prevents real API calls in tests
jest.mock('../services/gemini', () => ({
  generateResponse: jest.fn().mockResolvedValue(
    'Summary: You need to register to vote.\n\n' +
    'Steps:\n1. Visit your local election office\n2. Bring valid ID\n3. Fill out the registration form\n\n' +
    'Confidence: 95%'
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

    it('passes correct arguments to Gemini service', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'What is polling day?', context: 'Registered' });

      expect(generateResponse).toHaveBeenCalledTimes(1);
      expect(generateResponse).toHaveBeenCalledWith(
        'What is polling day?',
        'Registered'
      );
    });

    it('defaults context to General when not provided', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'What is an election?' });

      expect(generateResponse).toHaveBeenCalledWith(
        'What is an election?',
        'General'
      );
    });

    it('defaults context to General for invalid context value', async () => {
      await request(app)
        .post('/api/ai')
        .send({ query: 'What is an election?', context: 'MALICIOUS_CONTEXT' });

      expect(generateResponse).toHaveBeenCalledWith(
        'What is an election?',
        'General'
      );
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
  });
});
