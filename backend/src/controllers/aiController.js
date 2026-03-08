// backend/src/controllers/aiController.js
const axios = require('axios');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter: max 20 requests per minute per IP (adjust as needed)
const rateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60, // 1 minute
});

const chat = async (req, res) => {
  const { messages, model = 'llama3-70b-8192', temperature = 0.7, max_tokens = 2048 } = req.body;

  // Validation
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required and cannot be empty' });
  }

  // Rate limiting per IP
  try {
    await rateLimiter.consume(req.ip);
  } catch (rejRes) {
    return res.status(429).json({
      error: 'Too many requests - please wait a minute',
      retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
    });
  }

  try {
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      }
    );

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Important for streaming

    // Pipe Groq stream directly to client
    groqResponse.data.pipe(res);

    // Handle stream end/error
    groqResponse.data.on('end', () => {
      res.end();
    });

    groqResponse.data.on('error', (err) => {
      console.error('Groq stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream interrupted' });
      }
    });

  } catch (err) {
    console.error('Groq API error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });

    const status = err.response?.status || 500;
    const errorMessage = err.response?.data?.error?.message || 'Failed to communicate with AI service';

    res.status(status).json({ error: errorMessage });
  }
};

module.exports = { chat };