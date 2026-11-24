# SACHIN AI CYBER TOOLKIT — v2 starter

## Included
- Responsive dashboard and Jarvis-style tap-to-talk / typed navigation
- Node.js + Express API
- SQLite account table, bcrypt password hashing, short-lived JWT
- Basic URL format review and educational phishing heuristics
- Browser-only network information and APK file metadata

## Run locally
1. Install Node.js 20 or newer.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `JWT_SECRET` to a long random secret (at least 32 characters). Never publish it or send it in chat.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Important limitations
This is a starter prototype, not a production-ready security product.
- Website checker does not crawl, probe, or scan a website.
- Phishing detector uses simple local heuristics and cannot certify a link as safe.
- Network page only reports browser-exposed information; it does not scan devices or ports.
- APK page only reads file metadata; it does not reverse engineer or detect malware.
- Jarvis voice input depends on browser support and microphone permission. It is tap-to-talk, not an always-listening wake word.
- Login is a basic starting point. Before public launch, add email verification, password reset, CSRF/session strategy, audit logging, account deletion, privacy policy, HTTPS, secure secret management, backups, and security review.
- The browser client does not contain an AI API key. A real AI provider must be connected server-side using environment variables.
- No APK is built by this project. Android packaging requires a separate Android app build and testing process.

Only test websites and systems you own or have explicit permission to assess. Do not use this starter to access other people's accounts, devices, or networks.


## Android app wrapper
See `ANDROID_BUILD_GUIDE.md`. Capacitor config and scripts are included to generate an Android Studio project. A compiled APK is not included because Android SDK/Studio build tools are not available in this environment.


## v4 improvements
Authentication rate limiting, tab-scoped session handling, Dockerfile, and a Render deployment template are included. Read `DEPLOYMENT_AND_SECURITY_v4.md` before deployment. Hosting has not been performed and no compiled APK is included.


## v6 Jarvis + PWA
Jarvis now accepts a bounded conversation history and has a clear-chat control. A PWA manifest, icon, and static-only service worker are included. Live AI still requires a private server-side API key. See `V6_CHANGELOG.md`.
