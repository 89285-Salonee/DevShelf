const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/proxy
// Forwards a request server-side and returns the response to the client.
// This bypasses browser CORS restrictions and keeps sensitive headers off the client.
router.post('/', async (req, res) => {
  const { url, method = 'GET', headers = {}, body } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  // Sanitise method
  const METHOD = method.toUpperCase();
  const ALLOWED = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  if (!ALLOWED.includes(METHOD)) {
    return res.status(400).json({ error: `Method "${METHOD}" is not supported` });
  }

  const startTime = Date.now();

  try {
    // Parse body if provided as a JSON string
    let parsedBody;
    if (body && typeof body === 'string') {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body; // send raw string if not valid JSON
      }
    } else {
      parsedBody = body;
    }

    const axiosConfig = {
      url,
      method: METHOD,
      headers: { ...headers },
      // Don't throw on 4xx/5xx so we can forward the status code
      validateStatus: () => true,
      // Return the raw response data as-is
      responseType: 'json',
      timeout: 30_000, // 30 s
    };

    if (!['GET', 'HEAD', 'OPTIONS'].includes(METHOD) && parsedBody !== undefined) {
      axiosConfig.data = parsedBody;
    }

    const response = await axios(axiosConfig);
    const elapsed = Date.now() - startTime;

    return res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      elapsed,
    });
  } catch (err) {
    const elapsed = Date.now() - startTime;

    // Network-level errors (DNS, timeout, refused connection, etc.)
    if (err.code === 'ECONNREFUSED') {
      return res.status(502).json({
        error: 'Connection refused - the target server is not reachable.',
        code: err.code,
        elapsed,
      });
    }
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timed out after 30 seconds.',
        code: err.code,
        elapsed,
      });
    }

    return res.status(500).json({
      error: err.message || 'Proxy request failed',
      code: err.code,
      elapsed,
    });
  }
});

module.exports = router;
