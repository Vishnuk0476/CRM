# Requirements — Quotation Module v1

**Project:** PanyaFlow CRM — Quotation Builder
**Client:** Panya Global Relocation Pvt. Ltd.
**Stack:** React + Vite + TypeScript + PHP + PostgreSQL + jsPDF

---

## v1 Scope Overview

Build a complete, professional Quotation system for a relocation / packers and movers company. The system must allow users to create, send, track, revise, and convert quotations to invoices. The PDF output must exactly match the existing company format. T&C and Include/Exclude sections must be **editable from the CRM** (not hardcoded) so the operations team can update them without code changes.

---

## Category: Database & Schema (DB)

| ID | Requirement |
|----|-------------|
| DB-01 | Create `quotations` table with all fields (client, move details, financials, terms, status, version, timestamps, internal fields) |
| DB-02 | Create `quotation_line_items` table linked via `quotation_id` with `ON DELETE CASCADE` |
| DB-03 | Create indexes for case_id, status, and quotation_id on line items |
| DB-04 | Implement `generateQuotationNumber()` returning `QT-YEAR-XXXX` format with year-prefixed counter |
| DB-05 | Schema must support `parent_quotation_id` for revision chaining (V1, V2, V3) |
| DB-06 | Schema must support revision history (all versions of same family share the same `quotation_number`) |

---

## Category: Dynamic Settings & Templates (SET) — CRITICAL USER NEED

The user explicitly stated that T&C and Include/Exclude change frequently and must be editable from CRM without code changes.

| ID | Requirement |
|----|-------------|
| SET-01 | Store **company info** (name, address, GSTIN, PAN, phone, email, website, bank details, UPI, logo URL) in a settings table |
| SET-02 | Store **T&C templates** in DB with version + active flag — admin can edit/add/disable without redeploy |
| SET-03 | Store **Include templates** in DB — bullet list items editable from CRM |
| SET-04 | Store **Exclude templates** in DB — bullet list items editable from CRM |
| SET-05 | Store **payment schedule templates** in DB (e.g., "50% advance + 50% before unloading", "100% advance", "30/70 split") |
| SET-06 | Store **default validity days** and **default GST rates** in settings |
| SET-07 | Settings CRUD API: create, list, update, delete templates with active/inactive flag |

---

## Category: Core API Endpoints (API)

| ID | Requirement |
|----|-------------|
| API-01 | `create.php` — validate, generate number, compute financials, insert quotation + line items, log activity |
| API-02 | `list.php` — paginated with filters (status, case_id, date range, search) and aging flags (`days_since_sent`, `is_expiring_soon`) |
| API-03 | `detail.php` — return full quotation + line items + case + survey + linked invoice + revision history + company settings |
| API-04 | `update.php` — recalculate financials on every save, replace line items, require confirmation flag for sent/accepted status |
| API-05 | `send.php` — handle WhatsApp URL generation + email with PDF attachment; update `sent_at` and status |
| API-06 | `accept.php` — set status=accepted, update case milestone, create notification |
| API-07 | `reject.php` — set status=rejected, store reason, create notification |
| API-08 | `revise.php` — clone quotation + line items, increment version, parent linkage, clear timestamps, mark original as `revised` |
| API-09 | `convert-to-invoice.php` — verify accepted, create invoice with copied fields, mark quotation `converted` |
| API-10 | `check-expiry.php` — cron job: mark expired quotations + create expiring-soon notifications (2 days before) |
| API-11 | Financial calculation engine: subtotal, discount (amount or percent), taxable amount, GST base with proportional discount, CGST/SGST/IGST auto-switch, total_tax, grand_total |

---

## Category: Frontend Builder UI (UI)

| ID | Requirement |
|----|-------------|
| UI-01 | `QuotationWizard.tsx` — 4-step wizard with progress bar (Client/Move → Services → Terms → Review) |
| UI-02 | `LineItemsEditor.tsx` — reusable component with inline editing, autocomplete, add/remove/reorder, service catalog |
| UI-03 | `GSTCalculator.tsx` — animated badge switching between CGST+SGST (intra-state) and IGST (inter-state) |
| UI-04 | Service catalog (23 predefined services) with quick-add chips and default description/rate/GST% on selection |
| UI-05 | Live totals panel: subtotal, discount, taxable, GST line, grand total, amount in words — all update on every keystroke |
| UI-06 | Discount toggle: radio button between Rs amount and percent with correct calculation |
| UI-07 | Pincode auto-fill for city and state (use postalpincode.in API) |
| UI-08 | Auto-fill client details when case is selected from dropdown |
| UI-09 | Auto-detect same-state vs inter-state from origin_state and destination_state |

---

## Category: List, Detail & Settings UI (PAGE)

| ID | Requirement |
|----|-------------|
| PAGE-01 | `QuotationsList.tsx` — 4 stats cards (total/pending/accepted/expiring) + filters + table with status badges |
| PAGE-02 | `QuotationDetail.tsx` — two-column layout with sidebar actions (Preview PDF, Download, WhatsApp, Email, Accept, Reject, Revise, Convert) + revision history |
| PAGE-03 | **Settings UI: T&C editor** — list, add, edit, disable T&C templates — **CRITICAL for user** |
| PAGE-04 | **Settings UI: Include/Exclude editor** — bullet-list editor for both sections — **CRITICAL for user** |
| PAGE-05 | Settings UI: Payment schedule template editor |
| PAGE-06 | Settings UI: Company info editor (logo upload, bank details, GSTIN, etc.) |
| PAGE-07 | Status badge system with spec colors (draft=gray, sent=blue, accepted=green, rejected=red, expired=red-outline, revised=amber, converted=teal) |

---

## Category: PDF Generation (PDF) — FORMAT STABILITY

| ID | Requirement |
|----|-------------|
| PDF-01 | `generateQuotationPDF.ts` — produces A4 portrait PDF with all 11 sections |
| PDF-02 | Header band: navy bg, company name, tagline, ISO/IFCCA strip, large "QUOTATION" title, QT number, date, valid until, status badge |
| PDF-03 | 4px orange accent strip below header |
| PDF-04 | Meta row: BHK, Distance, Move Date, GST, Boxes chips |
| PDF-05 | From/To two-column boxes with light blue border, GSTIN, PAN, contact |
| PDF-06 | Move details box (light blue bg) with route row (orange arrow) and 3-column detail grid |
| PDF-07 | Services table: navy header, alternating row bg, service name + description, qty, unit, rate, GST%, amount |
| PDF-08 | Totals block: subtotal, discount, taxable, GST line (CGST+SGST or IGST), Grand Total (navy bg, orange text), Amount in Words |
| PDF-09 | Payment schedule + Bank details two-column section |
| PDF-10 | Signature blocks (Client Acceptance + Authorized Signatory with company stamp circle) |
| PDF-11 | Terms & Conditions section (numbered list) — content from **active T&C template** in DB |
| PDF-12 | Footer (navy bg): phone, email, website, page indicator |
| PDF-13 | Filename format: `QT-2026-XXXX.pdf` |
| PDF-14 | Amount in words in Indian format (e.g., "Eighty-One Thousand Seven Hundred Ninety-Seven Rupees Only") |
| PDF-15 | **PDF format must remain stable** across T&C/Include/Exclude template changes — only content fields update, layout/colors/structure unchanged |

---

## Category: Communications (COMM)

| ID | Requirement |
|----|-------------|
| COMM-01 | WhatsApp send — open `wa.me/91<phone>?text=<encoded-message>` with pre-filled professional summary |
| COMM-02 | Email send — generate PDF, attach to email via existing emailService, send to client email |
| COMM-03 | WhatsApp message template with bold fields, GST type, validity, call-to-action |

---

## Category: Automation & Notifications (AUTO)

| ID | Requirement |
|----|-------------|
| AUTO-01 | Auto-create follow-up task 3 days after quotation is sent |
| AUTO-02 | Auto-create notification when quotation expires or is expiring in 2 days |
| AUTO-03 | Log activity for all major events (created, sent, accepted, rejected, revised, converted) |
| AUTO-04 | Notification to manager on send and accept; notification to consultant on reject with reason |

---

## Category: Polish & UX (POL)

| ID | Requirement |
|----|-------------|
| POL-01 | Mobile responsive: wizard one-section-per-screen, line items as cards, sticky totals, full-width action buttons |
| POL-02 | Empty states: illustrations + "Create your first quotation" / "Add services" prompts |
| POL-03 | Loading states: skeleton rows, PDF progress indicator, button spinners |
| POL-04 | Indian number format throughout (`₹1,23,456` not `₹123456`) |
| POL-05 | Compact views: large amounts in lakhs (`₹1.2L`) |
| POL-06 | Confetti animation on accepted status |
| POL-07 | All UI colors strictly per spec (navy `#0B2D4E`, orange `#F57C00`, success green, danger red, info blue, amber, gray) |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1 | Pending |
| DB-02 | Phase 1 | Pending |
| DB-03 | Phase 1 | Pending |
| DB-04 | Phase 1 | Pending |
| DB-05 | Phase 1 | Pending |
| DB-06 | Phase 1 | Pending |
| SET-01 | Phase 1 | Pending |
| SET-02 | Phase 1 | Pending |
| SET-03 | Phase 1 | Pending |
| SET-04 | Phase 1 | Pending |
| SET-05 | Phase 1 | Pending |
| SET-06 | Phase 1 | Pending |
| SET-07 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 2 | Pending |
| API-05 | Phase 2 | Pending |
| API-06 | Phase 2 | Pending |
| API-07 | Phase 2 | Pending |
| API-08 | Phase 2 | Pending |
| API-09 | Phase 2 | Pending |
| API-10 | Phase 2 | Pending |
| API-11 | Phase 2 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 3 | Pending |
| UI-06 | Phase 3 | Pending |
| UI-07 | Phase 3 | Pending |
| UI-08 | Phase 3 | Pending |
| UI-09 | Phase 3 | Pending |
| PAGE-01 | Phase 4 | Pending |
| PAGE-02 | Phase 4 | Pending |
| PAGE-03 | Phase 4 | Pending |
| PAGE-04 | Phase 4 | Pending |
| PAGE-05 | Phase 4 | Pending |
| PAGE-06 | Phase 4 | Pending |
| PAGE-07 | Phase 4 | Pending |
| PDF-01 | Phase 5 | Pending |
| PDF-02 | Phase 5 | Pending |
| PDF-03 | Phase 5 | Pending |
| PDF-04 | Phase 5 | Pending |
| PDF-05 | Phase 5 | Pending |
| PDF-06 | Phase 5 | Pending |
| PDF-07 | Phase 5 | Pending |
| PDF-08 | Phase 5 | Pending |
| PDF-09 | Phase 5 | Pending |
| PDF-10 | Phase 5 | Pending |
| PDF-11 | Phase 5 | Pending |
| PDF-12 | Phase 5 | Pending |
| PDF-13 | Phase 5 | Pending |
| PDF-14 | Phase 5 | Pending |
| PDF-15 | Phase 5 | Pending |
| COMM-01 | Phase 6 | Pending |
| COMM-02 | Phase 6 | Pending |
| COMM-03 | Phase 6 | Pending |
| AUTO-01 | Phase 6 | Pending |
| AUTO-02 | Phase 6 | Pending |
| AUTO-03 | Phase 6 | Pending |
| AUTO-04 | Phase 6 | Pending |
| POL-01 | Phase 6 | Pending |
| POL-02 | Phase 6 | Pending |
| POL-03 | Phase 6 | Pending |
| POL-04 | Phase 6 | Pending |
| POL-05 | Phase 6 | Pending |
| POL-06 | Phase 6 | Pending |
| POL-07 | Phase 6 | Pending |

**Total: 65 requirements across 8 categories — 100% coverage planned**
