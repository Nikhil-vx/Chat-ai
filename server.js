// server.js
// Minimal backend for a ChatGPT/Claude-style chat app.
// The frontend never talks to the AI API directly — it always goes through
// this server, so your API key stays secret and never reaches the browser.

require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '\n⚠️  ANTHROPIC_API_KEY is not set. Create a .env file (see .env.example) before chatting.\n'
  );
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());
app.use(express.static('public'));

// System prompt — customize your assistant's personality/behavior here.
const SYSTEM_PROMPT =
  'You are a helpful, friendly assistant in a chat app. Keep answers clear and concise unless the user asks for more detail.';

// POST /api/chat
// Body: { messages: [{ role: 'user' | 'assistant', content: string }, ...] }
// Returns: { reply: string }
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Basic validation/sanitization of the incoming history
    const cleanMessages = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: cleanMessages,
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({ reply });
  } catch (err) {
    console.error('Error calling Anthropic API:', err.message);
    res.status(500).json({ error: 'Something went wrong talking to the AI. Check your API key and try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Chat app running at http://localhost:${PORT}`);
});
