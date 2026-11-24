# Android packaging scaffold

This project now includes Capacitor configuration so the dashboard can be wrapped as an Android app.

## Requirements
- A computer with Node.js 20+, Android Studio, and Android SDK installed.
- Android Studio / Android SDK are not available inside this ZIP, so a signed APK is not included.
- The web starter currently uses a local API server for login. A packaged phone app cannot reach `localhost` on your computer; before public use, deploy the API to HTTPS and configure the app to use that server URL.

## Generate the Android project
From this folder, run:

```bash
npm install
npm run build:web
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio opens the generated project. Build > Build Bundle(s) / APK(s) > Build APK(s) creates a debug APK for testing.

## Before a public release
- Deploy the API behind HTTPS and update frontend API calls to the production API origin.
- Add a privacy policy, account verification and recovery, abuse controls, and security review.
- Test microphone behavior on real devices. Jarvis is tap-to-talk and requires microphone permission when used.
- Request only permissions actually needed. This starter does not request contacts, SMS, call logs, accessibility, device-admin, or broad file access.
- Create a release signing key privately. Never send signing keys, passwords, or API secrets in chat.
- Use a guardian's help for developer account or publishing steps if required by age/account rules.

## Current status
This is Android packaging source/configuration, not a compiled APK. No real malware scanning, device control, network port scanning, or always-on wake word is implemented.
