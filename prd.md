# Product Requirements Document (PRD): Panya Global (Packers & Movers Platform)

## 1. Product Overview
Panya Global is a comprehensive logistics, relocation, and consignment management platform tailored specifically for the Packers & Movers business. It digitizes and streamlines the end-to-end relocation process—from initial lead capture (quotes), pre-move surveys, and booking, to consignment tracking, online payments, and invoicing.

## 2. Problem Statement
The relocation industry is notoriously fragmented and stressful for customers. Customers face anxiety due to opaque pricing, lack of real-time tracking, hidden damages, and poor communication. On the business side, packers and movers struggle with managing leads, disjointed operational tools (using separate apps for quotations, surveys, tracking, and invoicing), and fraudulent claims. 

A unified digital solution is needed to build trust with customers while optimizing internal business operations.

## 3. Target Users
- **End Customers (B2C & B2B):** Individuals moving homes, or businesses conducting workspace relocations. They need transparency, tracking, and easy online payments.
- **Admin / Operations Managers:** Internal staff managing leads, dispatch, tracking, invoicing, and customer support cases.
- **Surveyors / Field Agents:** Staff conducting pre-move surveys to estimate cargo volume, weight, and special packing requirements.
- **Partners / Affiliates:** Third-party drivers, vendors, or franchise owners collaborating on the logistics network.

## 4. Core Features (Currently Implemented)
Based on your current application architecture, you already have a very robust foundation:
- **Lead Generation & Quotes:** Customers can request and track their quotes (`Quote.tsx`, `TrackQuote.tsx`).
- **Consignment Tracking:** Real-time milestone status updates for customers (`CustomerTracking.tsx`, `TrackConsignment.tsx`).
- **Admin Dashboard:** Centralized management of quotations, surveys, support cases, and invoices (`Admin.tsx`).
- **Online Payments & Invoicing:** Integrated payment gateway with backend invoice generation (`PayOnline.tsx`, `setup_invoices.php`).
- **Insurance / Warranty:** Options for covering goods against damage (`EasyCoverWarranty.tsx`).
- **Fraud Detection:** Educating customers and verifying authentic operations to prevent scams (`DetectFraud.tsx`).
- **Workspace Relocation:** Specialized flow for B2B/corporate office moves.
- **Customer Support:** Chat widget, service inquiries, and case management.

## 5. Recommended Features to Add (Industry Standards)
*Since you asked to include things you might have missed, here are features that will take your platform to the next level:*

- **Automated Visual Inventory Builder:** Instead of customers typing out their items, give them a visual checklist (e.g., "Living Room: 1 Sofa, 2 TVs") to automatically estimate the move's volume (CBM/CFT).
- **Driver/Agent Mobile PWA:** A simple mobile-friendly view for drivers to update consignment status on the road, upload photos of cargo (pre-loading/post-unloading to avoid false damage claims), and capture customer e-signatures.
- **Dynamic Price Estimator:** An algorithm estimating base costs depending on distance (Google Maps API integration), volume, and building constraints (e.g., floor number, lack of elevator).
- **WhatsApp/SMS Integration:** Automated alerts triggered via webhooks for quote generation, driver dispatch, and successful delivery. This significantly reduces customer anxiety.
- **Automated Review Collection:** Automated post-move emails/messages asking for a Google/Trustpilot review when a consignment is marked as "Delivered".

## 6. User Stories
**Customers:**
- As a customer, I want to request an estimate online so I don't have to call multiple movers.
- As a customer, I want to track my consignment via a Tracking ID so I know exactly when my belongings will arrive.
- As a customer, I want to view my insurance/warranty options to protect my valuable fragile items.
- As a customer, I want to pay my invoice online securely to avoid dealing with large amounts of cash on delivery.

**Administrators:**
- As an admin, I want a centralized dashboard to see all pending quotes so I can follow up with leads quickly.
- As an admin, I want to generate and send PDF invoices to customers automatically based on their final survey.
- As an admin, I want to manage customer support cases efficiently to maintain high CSAT scores.

**Surveyors:**
- As a surveyor, I want to log the findings of my pre-move survey digitally so operations can finalize the quotation without paper trails.

## 7. MVP Scope (Minimum Viable Product)
If you are planning a phased rollout or simplifying for version 1, ensure these are flawless:
- Landing page with clear Services, About, Contact, and Branch locations.
- "Request a Quote" form that successfully feeds into the Admin panel.
- Admin panel to view leads, create manual quotes, and update tracking statuses.
- Basic Consignment Tracking (Admin manually updates statuses like "Dispatched", "In Transit", "Delivered").
- Secure online payment gateway integration.

## 8. Success Metrics (KPIs)
How will you know the app is successful for the business?
- **Lead Conversion Rate:** % of website visitors who submit a quote request.
- **Quote-to-Booking Ratio:** % of generated quotes that convert into actual paid bookings.
- **Customer Satisfaction (CSAT/NPS):** Average rating submitted post-delivery.
- **Operational Efficiency:** Reduction in manual customer support phone calls (thanks to self-serve tracking).
- **Payment Collection Rate:** % of invoices paid seamlessly via the online portal.

## 9. Out of Scope / Features to Avoid in V1
- **Live GPS Truck Tracking (Hardware):** Integrating physical GPS hardware on trucks is expensive and complex. Stick to milestone-based status updates (e.g., Dispatched, Reached Hub) for now.
- **Fully Automated Binding Prices without Survey:** Packing and moving has too many variables (narrow stairs, extremely heavy antique items) to give a 100% accurate final price without human review. Provide "estimates" online, but keep the final price contingent on a physical/virtual survey.
- **Multi-tenant SaaS Architecture:** Unless you intend to sell this software to *other competing packers and movers*, keep the database strictly single-tenant to save on development and maintenance complexity.
