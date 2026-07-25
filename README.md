# Correspond — a simple ChatGPT/Claude-style chat app

A minimal full-stack chat app: a Node/Express backend that calls the Claude
API, and a plain HTML/CSS/JS frontend (no build step required).

## How it works

```
Browser (public/) --fetch--> Express server (server.js) --API call--> Claude API
```

Your API key lives only on the server, in a `.env` file that's never sent to
the browser. The frontend just POSTs the conversation history to `/api/chat`
and displays the reply.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy the example env file and add your key:
   ```
   cp .env.example .env
   ```
   Then edit `.env` and set `ANTHROPIC_API_KEY` to a key from
   https://console.anthropic.com/settings/keys
3. Start the server:
   ```
   npm start
   ```
4. Open http://localhost:3000

## Files

- `server.js` — Express backend, exposes `POST /api/chat`
- `public/index.html` — page structure
- `public/style.css` — styling
- `public/script.js` — frontend logic (sends messages, renders replies)
- `.env.example` — template for your API key

## Customizing

- **Personality**: edit `SYSTEM_PROMPT` in `server.js`.
- **Model**: change the `model` field in the `anthropic.messages.create` call.
- **Persistence**: this version keeps history in browser memory only (lost on
  refresh). To persist chats, add a database (e.g. SQLite or Postgres) and
  save/load `history` by a session or user ID.
- **Streaming responses**: the Anthropic SDK supports streaming
  (`anthropic.messages.stream(...)`) if you want tokens to appear as they're
  generated instead of all at once — ask me if you want this wired up.

## Using a different AI provider

The frontend doesn't care which provider you use — it just expects
`POST /api/chat` to return `{ reply: "..." }`. Swap the Anthropic SDK call in
`server.js` for OpenAI's SDK, or any other provider's API, and the rest of the
app works unchanged.

## Deploying

This is a standard Node/Express app, so it deploys anywhere that runs Node:
Render, Railway, Fly.io, a VPS, etc. Set `ANTHROPIC_API_KEY` as an environment
variable in your hosting provider's dashboard rather than committing `.env`.
