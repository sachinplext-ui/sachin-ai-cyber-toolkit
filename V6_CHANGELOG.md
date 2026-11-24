# v6 update

## Added
- Jarvis conversation context: the last four user/assistant exchanges are sent to the server (maximum eight messages).
- Clear chat control.
- Progressive Web App manifest and icon.
- Service worker for static app shell only. API responses are deliberately not cached.
- `store: false` is sent to the Responses API request.

## Install as a web app
After hosting on HTTPS, open the site in a supported browser and use its browser menu's "Install app" or "Add to Home screen" option. This is a PWA install, not a compiled native APK.

## Notes
The PWA can cache the app shell, but live AI chat and account endpoints still need an internet connection and a working backend. Real AI remains dependent on server-side API configuration. Test updates after deployment; clear site data if a stale service worker persists.
