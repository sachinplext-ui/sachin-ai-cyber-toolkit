# Jarvis AI setup (v5)

## What is included
- A Jarvis AI chat panel in the dashboard.
- A backend `/api/ai-chat` endpoint using the OpenAI Responses API.
- Server-side API key handling: the key is never sent to the browser.
- Demo Mode when no API key is configured.
- Request length limit, rate limit, timeout, and a defensive/age-appropriate assistant instruction.

## Enable real AI
1. Deploy the backend on a trusted HTTPS host.
2. In the hosting provider's private Environment Variables / Secrets settings, add `OPENAI_API_KEY`.
3. Optionally set `OPENAI_MODEL` to a model available to your API project (default in this starter: `gpt-5.5`).
4. Redeploy and test the Jarvis chat.

Never put the API key in `public/app.js`, `public/index.html`, an Android asset, or a public repository. Never send the key to ChatGPT or another person. API usage may incur charges and requires an eligible API account with billing/configuration completed.

## Local setup
Copy `.env.example` to `.env`, then add the API key locally if you have one. Keep `.env` out of version control. Run `npm install` and `npm start`.

## Honest status
The AI chat UI and backend route are implemented. Real AI responses remain disabled until the server owner configures a valid API key and model access. No always-on voice conversation or Jarvis control of phone settings is included. Voice recognition remains tap-to-talk navigation.
