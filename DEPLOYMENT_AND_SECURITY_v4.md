# v4 deployment and security notes

## What is new in v4
- Android platform dependency is included for the Capacitor Android workflow.
- Login/register endpoints have a stricter rate limit.
- The browser can keep a short-lived login token in sessionStorage for the current tab, validate it with `/api/me`, and sign out.
- Docker and Render deployment templates are included.

## Deployment is not automatic
The included `render.yaml` is a template. A hosting account, a repository connection, and review of the service settings are still required. Do not paste passwords, API keys, signing keys, or recovery codes into ChatGPT.

## Important deployment changes
1. Set `ALLOWED_ORIGIN` to the exact HTTPS origin where the app will run.
2. Use persistent disk storage for SQLite, or move to a managed production database before scaling.
3. Confirm the hosting platform supports the configured persistent disk and Docker runtime.
4. Enable HTTPS and verify `/api/health`.
5. Configure backups, privacy notice, account deletion, email verification and password reset before inviting public users.

## Android packaging
Install Node.js 20+ and Android Studio/SDK on a computer, then run:

```bash
npm install
npm run build:web
npx cap add android
npx cap sync android
npx cap open android
```

If the Android platform has already been added, use `npx cap sync android` instead of `npx cap add android`.

A debug APK can be built from Android Studio. A release APK/AAB needs private signing-key setup and testing. The generated Android project and APK are not included in this ZIP.

## Security scope
All checks are educational and passive. Do not scan or access systems without clear permission. This starter does not include exploit functions, remote device control, port scanning, or malware verdicts.
