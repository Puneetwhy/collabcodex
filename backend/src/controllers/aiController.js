// Simple proxy example
const axios = require('axios');

const chat = async (req, res) => {
  const { messages, model = 'llama3-70b-8192' } = req.body;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      { model, messages, stream: true },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      }
    );

    // Pipe stream to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'AI service error' });
  }
};

module.exports = { chat };