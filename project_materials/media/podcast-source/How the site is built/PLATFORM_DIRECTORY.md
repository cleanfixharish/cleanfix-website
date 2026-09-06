# CleanFixHarish Platform Directory

This is the owner’s map of the CleanFixHarish system. It records what each platform does without exposing passwords, private keys, database addresses, or other secret values.

## The live production system

| Platform | What it does | CleanFixHarish location | Open it | Protect | Regular check |
|---|---|---|---|---|---|
| Railway | Runs the website and backend application | CleanFixHarish production project | https://railway.com/dashboard | Project access and environment variables | Deployment health, logs, and monthly usage |
| Railway PostgreSQL | Stores live business records | Database service inside the Railway project | https://railway.com/dashboard | `DATABASE_URL` and backups | Confirm a usable backup before a risky release |
| Cloudflare | Controls the domain, DNS, and secure public connection | Zone: `cleanfixharish.co.il` | https://dash.cloudflare.com/ | Account access and API tokens | Root domain, `www`, SSL, and email DNS records |
| GitHub | The single source of truth for website code | `cleanfixharish/cleanfix-website` | https://github.com/cleanfixharish/cleanfix-website | Two-step verification and repository permissions | Review changes before they deploy to Railway |
| Google Cloud Auth | Provides Google sign-in | Project: CleanFixHarish Production (`cleanfixharish-prod`) | https://console.cloud.google.com/auth/clients | OAuth client secret | Test login after domain or authentication changes |
| Google Workspace | Runs company email and the owner’s administrator identity | `info@cleanfixharish.co.il` | https://admin.google.com/ | Administrator recovery and two-step verification | Email delivery; never remove Google MX records casually |
| AI Gateway | Connects Manager OS to the configured AI model | Private Railway environment variables | Railway project variables | `APP_AI_BASE_URL` and `APP_AI_KEY` | Confirm both settings exist before enabling AI live |

## Business tools

| Platform | Purpose | Important note |
|---|---|---|
| WhatsApp Business | Customer conversations and owner-approved message drafts | The first AI version prepares drafts; Aviel still reviews and sends them |
| Google NotebookLM | Internal podcasts, explanations, and training material | It is not part of the production website |
| Canva | Optional brand graphics and marketing material | Export and approve an asset before publishing it on the website |

## Retired system

**Render is retired.** Do not deploy new CleanFixHarish work there. Keep old access only if it still contains a backup that has not been preserved elsewhere.

## Secure configuration checklist

The names below are safe to document. Their values are secrets and must remain inside Railway or the platform that owns them.

- Application: `ENVIRONMENT`, `FRONTEND_URL`, `PYTHON_BACKEND_URL`, `VITE_API_BASE_URL`
- Domains and browser access: `CORS_ALLOWED_ORIGINS`, `ALLOWED_DOMAINS`
- Google sign-in: `OIDC_ISSUER_URL`, `OIDC_SCOPE`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`
- Sessions and administrator: `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`, `ADMIN_USER_EMAIL`
- Database: `DATABASE_URL`
- AI: `APP_AI_BASE_URL`, `APP_AI_KEY`

## Owner safety rules

1. Turn on two-step verification for Railway, GitHub, Google, Cloudflare, and WhatsApp.
2. Never paste a password, private key, OAuth secret, AI key, or `DATABASE_URL` into a chat or screenshot.
3. Do not change Cloudflare DNS or Google OAuth callback addresses for ordinary website edits.
4. Make website changes in GitHub from the single repository, then allow Railway to deploy the reviewed version.
5. Confirm a database backup before migrations, imports, bulk edits, or a major release.
6. Use **Website → Return to default** only for website presentation. It does not roll back accounts, customers, jobs, providers, payments, or uploaded files.

## Monthly owner check

- Open Railway and confirm the application and database are healthy.
- Check usage and billing for unexpected growth.
- Confirm the latest database backup is usable.
- Open the official domain in a private browser window and test Google sign-in.
- Send and receive one message through the company email.
- Review GitHub access and remove people who no longer need it.
- Confirm two-step verification and recovery methods still work.
- Review AI usage before increasing automation.

## If the website stops working

Check in this order:

1. **Railway application health** — is the latest deployment running?
2. **Railway logs** — is the application reporting a clear error?
3. **Railway PostgreSQL** — is the database service available?
4. **Cloudflare DNS and SSL** — do both `cleanfixharish.co.il` and `www.cleanfixharish.co.il` point to the correct Railway service?
5. **Google OAuth** — if only login is broken, verify the approved origins and callback addresses.
6. **GitHub** — identify the last deployed change and use the reviewed recovery process. Do not make random DNS changes.

## Planned additions, not yet confirmed as live

- Online payment provider
- Independent automated database backup copy
- Error monitoring and owner alerts
- Website conversion analytics

These should be connected one at a time, tested safely, and added to this directory only after they are truly active.
