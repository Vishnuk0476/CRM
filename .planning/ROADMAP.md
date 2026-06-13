# Roadmap — Quotation Module v1

**Project:** PanyaFlow CRM — Quotation Builder
**Client:** Panya Global Relocation Pvt. Ltd.
**Last Updated:** 02 June 2026

---

## User's Stated Priorities (Critical)

1. **Logo strictly** — Company logo must appear on PDF and CRM UI at all times
2. **T&C editable from CRM** — Terms & Conditions change frequently → must be DB-backed templates with editor UI (no code changes needed)
3. **Include/Exclude editable from CRM** — Same as T&C: bullet lists managed from CRM
4. **Format stability** — PDF format must NOT change when T&C/Include/Exclude content is updated
5. **Sleek / clean / minimal design** — UI must be polished, no clutter

---

## Phases

- [x] **Phase 1: Foundation — Schema & Dynamic Settings** — Database tables, settings/templates, auto-number, settings CRUD API
- [x] **Phase 2: Quotation Core APIs** — All 11 PHP endpoints (CRUD + lifecycle + cron) with financial engine
- [ ] **Phase 3: Quotation Builder UI** — 4-step wizard, line items editor, GST calculator, live calculations
- [ ] **Phase 4: List, Detail & Settings UI (CRM)** — Quotations list/detail pages + T&C and Include/Exclude editor
- [ ] **Phase 5: Branded PDF Generation** — Exact 11-section PDF layout with company logo, stable format
- [ ] **Phase 6: Communications, Automation & Polish** — WhatsApp/Email send, follow-ups, notifications, mobile polish

---

## Phase Details

### Phase 1: Foundation — Schema & Dynamic Settings

**Goal:** The data layer exists so quotations, line items, company info, T&C templates, include/exclude templates, and payment schedules can be persisted, queried, and updated — all from the CRM UI, never requiring code changes.

**Depends on:** Nothing (first phase)

**Requirements:** DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, SET-01, SET-02, SET-03, SET-04, SET-05, SET-06, SET-07

**Success Criteria** (what must be TRUE for users):
1. `quotations` and `quotation_line_items` tables exist with all required columns and `ON DELETE CASCADE` linkage
2. Calling `generateQuotationNumber($conn)` returns a unique `QT-2026-XXXX` value, year-scoped
3. `company_settings` row exists and is editable; logo URL is queryable for the PDF generator
4. T&C templates are stored as DB rows (not hardcoded) and have an `is_active` flag — adding a new T&C or disabling an old one requires no code change
5. Include/Exclude templates and payment schedule templates are stored in DB with active/inactive state
6. Settings API endpoints (`GET /api/crm/settings/company`, `GET/POST/PUT/DELETE /api/crm/settings/templates/:type`) work for an authenticated admin

**Plans:** 0/3 plans executed

---

### Phase 2: Quotation Core APIs

**Goal:** A consultant can create, list, view, edit, send, accept, reject, revise, and convert a quotation to an invoice through the API, with all financial calculations (subtotal, discount, GST, grand total) computed correctly on the server.

**Depends on:** Phase 1

**Requirements:** API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10, API-11

**Success Criteria** (what must be TRUE for users):
1. `POST /api/crm/quotations/create` returns a full quotation with `QT-2026-0001` format number, correct line items, and computed financials (subtotal, discount, GST, grand total) for both intra-state and inter-state scenarios
2. `GET /api/crm/quotations/list` returns paginated quotations with filters (status, case, date range, search) and exposes `days_since_sent` and `is_expiring_soon` flags
3. `GET /api/crm/quotations/detail?id=X` returns the quotation + sorted line items + linked case + survey + revision history + active T&C/Include/Exclude templates
4. `POST /api/crm/quotations/update` recalculates all financials, replaces line items, and requires a confirmation flag for `sent` or `accepted` status
5. `POST /api/crm/quotations/send` returns a WhatsApp URL + email payload, sets `sent_at`, updates status to `sent`, logs activity
6. `POST /api/crm/quotations/accept` and `/reject` update status, set timestamps, update case milestone, create notifications
7. `POST /api/crm/quotations/revise` creates a new quotation with version+1, parent linkage, copies all line items, marks the original as `revised`
8. `POST /api/crm/quotations/convert-to-invoice` requires `accepted` status, creates a new invoice, marks quotation `converted`
9. `GET /api/crm/quotations/check-expiry` marks expired quotations and creates expiring-soon notifications (2 days out)

**Plans:** TBD

---

### Phase 3: Quotation Builder UI

**Goal:** A consultant can create a new quotation end-to-end through a 4-step wizard, with all amounts updating live as they type.

**Depends on:** Phase 2

**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08, UI-09

**Success Criteria** (what must be TRUE for users):
1. Visiting `/admin/accounts/quotations/new` shows a 4-step wizard with a progress bar (Client/Move → Services → Terms → Review)
2. In Step 1, entering origin and destination state triggers a live GST badge: green "CGST+SGST (Intra-state)" for same state, blue "IGST (Inter-state)" for different states, with smooth transition
3. Step 2 shows a line items table where the user can add/remove rows, reorder via drag or arrows, type a service name with autocomplete from the 23-item catalog, and select quantity, unit, rate, GST%
4. The right-side sticky totals panel updates on every keystroke: subtotal, discount, taxable, GST, grand total, and Indian-format amount in words (e.g., "Eighty-One Thousand Seven Hundred Ninety-Seven Rupees Only")
5. Discount can be toggled between Rs amount and percent via a radio, with correct recalculation
6. Entering a 6-digit pincode auto-fills city and state (via postalpincode.in); selecting a case from the dropdown pre-fills client details
7. Step 3 shows payment schedule options pulled from DB templates + custom text option; T&C defaults to the active template
8. Step 4 shows a preview with three action buttons: Save as Draft, Create and Preview PDF, Create and Send Now

**Plans:** TBD

---

### Phase 4: List, Detail & Settings UI (CRM)

**Goal:** A consultant can browse, filter, and act on quotations, and the operations team can manage T&C and Include/Exclude templates from the CRM without touching code.

**Depends on:** Phase 3

**Requirements:** PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07

**Success Criteria** (what must be TRUE for users):
1. The Quotations list page shows 4 stat cards (Total this month, Pending response, Accepted this month, Expiring this week), a filter bar (status, date, search, consultant), and a paginated table with status badges in spec colors
2. Clicking a quotation opens a detail page with a 70/30 layout: main content on the left (header, from/to, move details, services, totals, payment, bank, T&C) and a sticky action sidebar on the right (Preview/Download PDF, WhatsApp, Email, Mark Accepted, Mark Rejected, Revise, Convert)
3. A revision history section shows V1/V2/V3 with status and date, each linking to the respective quotation
4. **A Settings page lets the admin list, add, edit, activate/deactivate, and delete T&C templates** — and any new quotation created after the change uses the new T&C
5. **A Settings page lets the admin manage Include/Exclude bullet lists** — operations can add or remove bullets and changes reflect in the quotation form and PDF
6. The Settings page also allows editing payment schedule templates and company info (logo, GSTIN, bank, UPI)
7. Status badges match the spec exactly: draft=gray, sent=blue, accepted=green, rejected=red, expired=red-outline, revised=amber, converted=teal

**Plans:** TBD

---

### Phase 5: Branded PDF Generation

**Goal:** A consultant can preview or download a PDF that exactly matches the existing company quotation format (header, accent strip, from/to, move details, services, totals, payment, signature, T&C, footer), with the company logo and stable layout.

**Depends on:** Phase 4

**Requirements:** PDF-01, PDF-02, PDF-03, PDF-04, PDF-05, PDF-06, PDF-07, PDF-08, PDF-09, PDF-10, PDF-11, PDF-12, PDF-13, PDF-14, PDF-15

**Success Criteria** (what must be TRUE for users):
1. Clicking "Preview PDF" or "Download PDF" generates an A4 PDF with no errors in under 5 seconds
2. All 11 sections render in the correct order: header band → orange strip → meta chips → from/to → move details → services table → totals → payment+bank → signature → T&C → footer
3. The Panya Global company logo appears in the header at the correct size and position (loaded from company settings)
4. Color palette matches the spec: navy `#0B2D4E`, orange `#F57C00`, light blue box borders
5. GST renders correctly: CGST 9% + SGST 9% for same-state, IGST 18% for inter-state, with proper line items
6. The amount in words line is grammatically correct in Indian English ("Eighty-One Thousand Seven Hundred Ninety-Seven Rupees Only")
7. The downloaded file is named `QT-2026-XXXX.pdf` matching the quotation number
8. **The PDF format and layout remain stable when T&C/Include/Exclude content is changed in Settings** — only the content of those fields updates; structure, colors, font sizes, and section ordering do not change
9. The PDF visually matches the reference images: Page 1 (cover + details + services + totals + payment + bank), Page 2 (T&C + signature + footer)

**Plans:** TBD

---

### Phase 6: Communications, Automation & Polish

**Goal:** Quotations can be delivered to clients via WhatsApp or email with one click, follow-ups are auto-created, expiry notifications fire, and the entire experience works on mobile.

**Depends on:** Phase 5

**Requirements:** COMM-01, COMM-02, COMM-03, AUTO-01, AUTO-02, AUTO-03, AUTO-04, POL-01, POL-02, POL-03, POL-04, POL-05, POL-06, POL-07

**Success Criteria** (what must be TRUE for users):
1. Clicking "Send via WhatsApp" opens a new tab to `wa.me/91<phone>?text=...` with a pre-filled, professional message including QT number, BHK, route, total, GST type, validity, and call-to-action
2. Clicking "Send via Email" generates the PDF, attaches it, and sends via the existing emailService to the client's email
3. When a quotation is sent, a follow-up task is auto-created for 3 days later with a pre-written message
4. The daily cron marks expired quotations and creates expiring-soon notifications (2 days before) for the consultant
5. Notifications are created for the manager on sent and accepted; for the consultant on rejected (with reason)
6. On mobile (≤768px): the wizard displays one section per screen with swipe between steps, line items become a card list, totals float as a sticky bottom card, and action buttons are full-width
7. Empty states have illustrations and CTAs ("Create your first quotation", "Add services")
8. Loading states show skeleton rows in tables and a progress indicator with percentage during PDF generation
9. All amounts use Indian comma format (`₹1,23,456`) and compact lakhs format in summary cards (`₹1.2L`)
10. All UI colors strictly match the design system: navy `#0B2D4E`, orange `#F57C00`, success green `#16A34A`, danger red `#DC2626`, info blue `#2563EB`, amber `#D97706`, gray `#64748B`

**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Schema & Dynamic Settings | 0/3 | Planned    |  |
| 2. Quotation Core APIs | 0/? | Not started | - |
| 3. Quotation Builder UI | 0/? | Not started | - |
| 4. List, Detail & Settings UI (CRM) | 0/? | Not started | - |
| 5. Branded PDF Generation | 0/? | Not started | - |
| 6. Communications, Automation & Polish | 0/? | Not started | - |

---

## Coverage

- Total v1 requirements: **65**
- Mapped to phases: **65 / 65** (100%)
- Orphaned: **0**
- Duplicated: **0**

### Phase Load

| Phase | Requirements | Categories |
|-------|--------------|------------|
| 1 | 13 | DB, SET |
| 2 | 11 | API |
| 3 | 9 | UI |
| 4 | 7 | PAGE |
| 5 | 15 | PDF |
| 6 | 14 | COMM, AUTO, POL |

### Critical Path Notes

- **Phase 1 → Phase 4** is the user's primary concern: dynamic T&C and Include/Exclude must be editable from CRM
- **Phase 5** delivers the stable PDF format
- **Phase 3 + Phase 4** deliver the sleek/clean/minimal UI
- All four user priorities are addressed across the six phases

---

## Resolved Coverage Notes

- **CRITICAL: DB-driven templates** — T&C (SET-02) and Include/Exclude (SET-03, SET-04) live in DB tables with editor UI in Phase 4 (PAGE-03, PAGE-04). This addresses the user's #1 pain point.
- **PDF stability** — PDF-15 explicitly requires format/layout to remain stable when T&C/Include/Exclude content is updated. Only content fields flow into the PDF; structure is fixed.
- **Existing project** — An older QuotationBuilder.tsx and QuotationPDFTemplate.tsx exist with hardcoded T&C (`DEFAULT_TERMS` constant) and HTML-to-image based PDF. The new module will be a **clean rebuild** in the proper location, with the option to deprecate the old files after cutover.
- **Database driver** — Spec uses PostgreSQL functions (`pg_query_params`); existing project uses PDO. Phase 1 will use PDO with `pg_*` style placeholders for compatibility, or migrate to PostgreSQL-native functions if the project has moved to Postgres (verify during planning).
