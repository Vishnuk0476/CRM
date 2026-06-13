# State — Quotation Module v1

**Project:** PanyaFlow CRM — Quotation Builder
**Client:** Panya Global Relocation Pvt. Ltd.
**Started:** 02 June 2026
**Last Updated:** 02 June 2026
**Status:** Roadmap approved by user — ready for Phase 1 planning

---

## Project Reference

**Core value:** A relocation/packers-and-movers company needs a professional, branded quotation system that lets consultants create, send, track, and convert quotations to invoices, while operations can update terms-and-conditions and include/exclude lists from the CRM without code changes.

**Current focus:** Phase 1 — Foundation (database schema and dynamic settings tables for T&C, Include/Exclude, payment schedules, company info).

**Critical user requirements:**
- T&C and Include/Exclude must be **editable from the CRM** (DB-backed templates) — they change frequently
- PDF format must **remain stable** — only content fields update, layout/colors do not change
- UI must be **sleek, clean, minimal** with strict color palette
- Company logo must appear on PDF and CRM UI at all times

---

## Current Position

- **Phase:** 3 of 6 — Quotation Builder UI
- **Plan:** 0 of TBD
- **Status:** Not started
- **Progress:** 24/65 requirements complete (37%)

```
[███████░░░░░░░░░░░░░] 37%
```

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Total phases | 6 |
| Total requirements | 65 |
| Phases complete | 0 |
| Requirements complete | 0 |
| Plans executed | 0 |
| Time elapsed | 0 days |

---

## Accumulated Context

### Decisions

- **Stack confirmed:** React + Vite + TypeScript + PHP + PostgreSQL + jsPDF + jsPDF-autotable
- **Phase count:** 6 (Standard depth) — comprehensive enough to capture all 8 parts of the spec without bloat
- **Settings-first approach:** Phase 1 establishes dynamic templates up front; this is the user's #1 pain point and unlocks Phase 4's settings UI
- **PDF is a separate phase:** Phase 5 isolates PDF work to ensure format stability and prevent regressions
- **Existing project handling:** The older `QuotationBuilder.tsx` (1334 lines) and `QuotationPDFTemplate.tsx` use hardcoded `DEFAULT_TERMS` and html-to-image. The new module will be a clean rebuild. Old files can be deprecated after cutover.
- **Database driver:** Spec uses PostgreSQL functions; existing code uses PDO. Phase 1 will use PDO with parameterized queries for cross-compatibility — verify actual DB engine during Phase 1 planning.

### Open Questions

- Confirm database engine (PostgreSQL vs MySQL) — affects how `generateQuotationNumber` is written
- Confirm logo asset location for PDF (CDN URL vs local path)
- Confirm email service interface (existing `emailService.php`) for `send.php`
- Confirm notification/activity-log APIs (existing tables) for `send/accept/reject/revise/convert` events
- Confirm cron job runner (system cron vs scheduled task) for `check-expiry.php`

### Todos

- [ ] **Phase 1: Plan in detail** — run `/gsd-plan-phase 1` (database schema + settings tables)
- [ ] **Phase 1: Execute** — SQL migration, numbering function, settings CRUD API, default seed data
- [ ] **Phase 1: Verify** — settings round-trip works (create → list → update → delete)

### Blockers

None.

---

## Session Continuity

**Resumption context:** When resuming work, the next step is to plan Phase 1 in detail. The user has approved the overall roadmap structure (6 phases) and the requirements categorization. Begin by running the phase planner for Phase 1 with focus on:
1. SQL migration file design (all 8 tables: quotations, line items, company_settings, tc_templates, include_templates, exclude_templates, payment_schedule_templates, plus indexes)
2. Numbering function placement (shared util)
3. Settings API contract (REST endpoints, JSON request/response shapes)
4. Default seed data (extract from current `DEFAULT_TERMS` in QuotationBuilder.tsx and the reference image's T&C section)

**Approved:** Roadmap approved on 02 June 2026. Next step is `/gsd-plan-phase 1` to plan the database schema, settings tables, numbering function, and settings CRUD API in detail before execution.
