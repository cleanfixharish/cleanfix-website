# CleanFixHarish Android

This is the real Android customer application foundation, not a visual mock-up.

## Implemented workflow

- Submit a service request to the existing public lead-intake API.
- Open a private quote code or verified app link.
- View only customer-safe quote information.
- Accept or decline a published quote.
- Preserve the rule that every price is reviewed by CleanFixHarish before publication.

## Open in Android Studio

1. Open the `apps/android` directory.
2. Allow Android Studio to install the Android 35 SDK and synchronize Gradle.
3. Use JDK 17.
4. Run the `app` configuration on an emulator or Android phone.

For an isolated preview API, add this line to the user Gradle properties file (never commit secrets):

```properties
API_BASE_URL=https://your-isolated-preview.up.railway.app/
```

The base URL is public configuration, not a secret. API keys must never be embedded in this app.

## Required before Play Store release

- Add customer photo upload after the storage API contract is approved.
- Add bilingual Hebrew/English strings and full RTL QA.
- Add app icons, screenshots, privacy policy, and store listing.
- Configure Digital Asset Links for verified `https://www.cleanfixharish.co.il/quote/...` app links.
- Add network and Compose UI tests.
- Complete an internal test track before any public release.
