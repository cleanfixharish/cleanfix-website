# Railway Phase 1 Configuration

This branch prepares a private Railway deployment. It does not change DNS,
Render, Google OAuth, or production data.

## Railway project layout

- Application service built from the repository root Dockerfile.
- PostgreSQL service in the same project and EU West region.
- One application replica during migration validation.
- Railway-generated domain only until the production cutover is approved.

## Required variables

Configure these in Railway without committing secret values:

```text
ENVIRONMENT=prod
FRONTEND_URL=https://www.cleanfixharish.co.il
PYTHON_BACKEND_URL=https://www.cleanfixharish.co.il
VITE_API_BASE_URL=
CORS_ALLOWED_ORIGINS=https://cleanfixharish.co.il,https://www.cleanfixharish.co.il
ALLOWED_DOMAINS=cleanfixharish.co.il,www.cleanfixharish.co.il
OIDC_ISSUER_URL=https://accounts.google.com
OIDC_SCOPE=openid email profile
OIDC_CLIENT_ID=<secret>
OIDC_CLIENT_SECRET=<secret>
JWT_SECRET_KEY=<secret>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
ADMIN_USER_EMAIL=info@cleanfixharish.co.il
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Keep `ENABLE_MOCK_DATA` unset. Railway automatically provides
`RAILWAY_ENVIRONMENT`, which disables runtime `create_all`; Alembic owns the
schema through the configured pre-deploy command.

## Validation before any cutover

1. Restore a database copy into the private Railway PostgreSQL service.
2. Confirm Alembic reaches `head` without changing or deleting customer rows.
3. Check `/health`, `/health/ready`, and `/api/config` on the Railway domain.
4. Test Google login only after the Railway preview callback is explicitly
   authorized, without removing the production callback.
5. Compare critical table counts with the source backup.
6. Exercise account, admin, lead, quote, asset, sitemap, and PWA flows.

Do not attach `cleanfixharish.co.il` or `www.cleanfixharish.co.il` and do not
change DNS until the owner approves the cutover phase.
