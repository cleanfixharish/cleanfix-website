# Architecture Design

## System Overview
CleanFixHarish is a full business operating platform with a bilingual (EN/HE) public website, CRM system, admin management, WhatsApp integration, and lead generation. Built with React frontend and Atoms Cloud backend.

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Backend: Atoms Cloud (Auth, Database, Edge Functions)
- Styling: Tailwind CSS with custom theme (Raleway + Lora fonts)
- State: React Context (Language, Auth) + TanStack Query
- Routing: React Router v6

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Public Website | Bilingual marketing pages | Index.tsx, ServicesPage.tsx, HowItWorksPage.tsx, WhyTrustUsPage.tsx, AboutPage.tsx |
| Partners Directory | Local business listings | PartnersPage.tsx |
| Lead Generation | Quote request form + WhatsApp CTA | QuotePage.tsx, whatsapp.ts |
| Admin CRM | Lead pipeline, partner management | AdminPage.tsx |
| i18n | English/Hebrew translations + RTL | i18n.ts, LanguageContext.tsx |
| Auth | Admin login via Atoms Cloud | AuthContext.tsx |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| i18n approach | Custom context + translations object | Lightweight, no extra deps, full control |
| RTL support | dir attribute + CSS | Native browser RTL with minimal overrides |
| WhatsApp integration | wa.me deep links | No API key needed, works on all devices |
| Admin auth | Atoms Cloud auth | Reuses existing auth system, no custom login |
| CRM data | Atoms Cloud entities | Built-in CRUD, no custom backend needed |

## File Tree Plan
```
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ui/ (shadcn components)
├── contexts/
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── i18n.ts
│   ├── utils.ts
│   └── whatsapp.ts
└── pages/
    ├── Index.tsx
    ├── ServicesPage.tsx
    ├── HowItWorksPage.tsx
    ├── WhyTrustUsPage.tsx
    ├── PartnersPage.tsx
    ├── AboutPage.tsx
    ├── QuotePage.tsx
    └── AdminPage.tsx
```

## Implementation Guide
1. Database tables: services, partners, leads, site_content (all created with mock data)
2. Frontend uses Atoms Cloud client for entity CRUD operations
3. Quote form creates lead entries directly in the database
4. Admin dashboard queries leads/partners with auth-gated access
5. WhatsApp links use wa.me format with pre-filled messages
6. Language toggle persists to localStorage, updates document dir attribute