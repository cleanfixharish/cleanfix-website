# CleanFixHarish agent rules

These rules apply to every coding or operations agent working in this repository.

## Quality, security and model budget

- Use the least expensive model that fully meets the task's quality, reliability, privacy and security requirements.
- Never weaken correctness, verification, privacy or security to save credits.
- Reserve the strongest models for genuinely high-risk or complex work such as security, financial, legal, customer-data, architecture and production-release decisions.
- Prefer deterministic code, tests and local CLI checks when a model call adds no material value.
- Check available quota before unattended model-heavy work when the provider exposes usage data. Keep capacity in reserve for incidents and owner-critical work.
- Use bounded retries. Do not repeatedly call an exhausted, rate-limited or failing model; fall back safely to an appropriate available model or deterministic tooling.
- Do not enable paid or unattended AI workflows until their limits, fallback behavior and owner controls are configured and verified.

## Production controls

- Use CLI and repository automation for engineering work whenever practical.
- Keep advertising and automatic publication disabled until the owner explicitly resumes that scope.
- Test database mutations in the isolated staging environment. Do not use production customer data for destructive or mutation testing.
- Production releases require green automated checks, successful staging evidence, a healthy rollback path and post-release smoke verification.
- Never print secrets, access tokens, database URLs or customer records into logs, issues or chat.
