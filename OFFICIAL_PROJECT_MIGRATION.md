# CleanFixHarish Official Project Migration

Migration completed on 2026-09-07.

## Official working folder

`C:\Users\Aviel\Documents\ChatGPT\CleanFixHarish Production`

This folder is the official local working copy. It tracks:

`https://github.com/cleanfixharish/cleanfix-website.git`

The active local branch is `main`, tracking `origin/main`.

## What is included

- The complete GitHub product repository: frontend, backend, Android project, assets, deployment configuration, scripts, pricing implementation, visual system, and podcast files.
- Unpublished product, UX, growth, finance, cross-platform, Cursor, and Perplexity planning documents recovered from the previous worktree.
- Unpublished English and Hebrew podcast scripts recovered from the previous worktree.
- Curated business and operating documents from the Desktop archive under `project_materials/business/`.
- The original knowledge package under `project_materials/brain/`.
- Perplexity market and pricing research under `project_materials/research/`.
- Website photos, brand images, screenshots, preview material, and podcast source material under `project_materials/media/`.
- Two unpublished code improvements: expanded credential exclusions in `.gitignore` and SEO metadata for the About and Partners pages.

## What was intentionally excluded

- `Github Tokken.txt` and the `Jason/` OAuth client-secret folder.
- Google Cloud local credential databases and configuration under `.tools/`.
- `.git/` folders from older repositories.
- `node_modules/`, `.venv/`, package stores, test output, caches, compiled output, and temporary staging folders.
- Duplicate repository copies and generated ZIP archives already represented by the official Git repository or copied source folders.
- A Header file change that contained no content difference and was only a line-ending artifact.

These exclusions prevent credential leakage, repository corruption, unnecessary duplication, and hundreds of megabytes of disposable generated files.

## Safety status

- Original files were copied, not deleted.
- No production deployment, DNS change, branch merge, or remote push was performed during this migration.
- A local scan found no GitHub-token, OpenAI-key, Google-client-secret, or private-key patterns in the official working folder.

## Next controlled step

Review the new files, run product tests, and commit the migration to a dedicated branch. Push or deployment requires a separate explicit decision.
