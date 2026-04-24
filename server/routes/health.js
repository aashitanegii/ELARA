const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint for monitoring and Cloud Run readiness probes.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ELARA',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
