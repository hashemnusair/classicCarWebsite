# Classic Car (Jordan) — Website PRD
**Project:** Classic Car public website (English / Arabic)  
**Owner:** Classic Car  
**Prepared by:** Hashem + team (draft)  
**Version:** v0.1 (Draft)  
**Primary goal:** A premium, high-performance website that makes browsing inventory and contacting the showroom effortless.

---

## 1) Context & Problem
Classic Car’s current website is unreliable and weak on:
- **UX:** hard to search, unclear navigation, low trust
- **Performance:** slow, heavy, poor mobile experience
- **Brand:** doesn’t reflect “high-end dealership” positioning

This project rebuilds the website from scratch to match the brand: **premium, modern, dark aesthetic with racing‑red accents**, bilingual (EN/AR), and built for speed and conversions.

---

## 2) Objectives (What “success” looks like)
### Business objectives
- Increase **qualified leads** (WhatsApp, calls, forms) from inventory browsing.
- Increase **trust**: clean visuals, fast load, consistent brand feel.
- Improve **discoverability**: SEO-ready inventory pages and structured content.

### User objectives
- Find a car quickly (filter/search/sort).
- View full details + high-quality photos fast.
- Contact Classic Car in 1–2 taps (especially on mobile).

### Success metrics (trackable)
- Lead events per week (WhatsApp click / Call click / Form submit).
- Inventory engagement: search usage, filter usage, detail-page views.
- Time-to-first-interaction and Lighthouse scores (see §10).

---

## 3) Scope
### In scope (MVP)
- Marketing pages (Home, Company/About, Branches, Contact)
- **Inventory system** (browse, filters, search, vehicle details)
- Lead capture (WhatsApp, call, contact form, “book a viewing”)
- Bilingual **English / Arabic** with a visible language toggle
- Admin/CMS for managing cars + content
- SEO + analytics foundation

### Out of scope (initial)
- Full e-commerce / checkout
- Payment, financing applications, credit checks
- Auction features
- Customer accounts (wishlists can be Phase 2)
- A complex “sell your car” marketplace (optional Phase 2)

---

## 4) Users & Personas
1) **Buyer / browser (mobile-first):** wants to quickly see “what’s available” and message on WhatsApp.
2) **Serious buyer:** compares a few cars, cares about details (mileage, specs, options, condition, origin).
3) **Admin / staff:** adds/updates cars, marks sold, uploads photos, manages bilingual content.

---

## 5) Key User Journeys
1) **Browse → Filter → Details → WhatsApp**
2) **Search by make/model → Shortlist mentally → Call**
3) **Open a shared car link → View gallery/specs → Book viewing**
4) **Change language (EN/AR) → Continue browsing without losing context**
5) **Admin adds a new car in <10 minutes** (including photos + translations)

---

## 6) Sitemap (Proposed)
- **Home**
- **Inventory**
  - Inventory listing (filters + search)
  - Vehicle details (`/inventory/{slug}`)
- **Company / About**
- **Branches / Locations**
- **Contact**
- Optional: **Services** (warranty, sourcing, inspection process) *(can be merged into About)*

---

## 7) Functional Requirements

### 7.1 Global requirements
- Sticky header with: Inventory, Company, Branches, Contact + language toggle (EN/AR).
- Persistent CTAs (mobile-friendly):
  - WhatsApp
  - Call
- Footer with:
  - Contact info (phone, email)
  - Social links
  - Branch links
  - Working hours (if provided)

### 7.2 Home page
**Goal:** premium first impression + quick path to inventory + social proof.
- Hero section:
  - One strong image/video background (optimized)
  - Primary CTA: “Browse Inventory”
  - Secondary CTA: “Contact / WhatsApp”
- “Featured inventory” (curated list)
- “New arrivals” (auto: most recently added)
- Quick brand proof blocks:
  - Years in business (established 1995 — if verified)
  - Review highlights (if available)
  - Key brand promises (quality, inspection, sourcing)
- Branch/location teaser (map preview optional)

### 7.3 Inventory listing (core)
**Goal:** fastest possible discovery with strong filters.
- Search bar supporting:
  - Make, model, trim keywords
  - Year (e.g., “2022”)
- Filters (faceted):
  - Make, model (model options update based on make)
  - Year range
  - Mileage range
  - Body type (SUV, sedan, coupe, etc.)
  - Transmission, drivetrain (if provided)
  - Fuel type (gas/hybrid/electric)
  - Exterior color (optional)
  - Origin: Local / Imported + imported country (optional)
  - Availability: Available / Reserved / Sold (sold hidden by default)
  - **Price handling** (configurable):
    - Option A: show exact price
    - Option B: hide price (“Price on request”)
    - Option C: “price band” filter (e.g., Entry / Mid / High / Ultra) even if exact price is hidden
- Sort options:
  - Newest
  - Year (desc/asc)
  - Mileage (asc)
  - Price (if enabled)
- Pagination or infinite scroll (choose based on performance tests)
- Inventory card requirements:
  - 1–2 optimized images
  - Make/Model/Year/Trim
  - Mileage (if available)
  - Key tags (e.g., “Hybrid”, “AMG”, “Warranty”, “Agency”, “Imported”)
  - Primary CTA: “View details”

### 7.4 Vehicle details page (core)
**Goal:** high trust + fast contact conversion.
- Title: Year + Make + Model + Trim
- Gallery:
  - Fast, responsive, swipeable
  - Fullscreen viewer
  - Captions optional
- Key specs panel:
  - Year, mileage, engine, transmission, drivetrain, fuel, color, interior
  - Origin + imported country (if applicable)
  - VIN (optional; can be hidden)
- Description block (bilingual)
- Feature list (options/tech packages)
- Price display rules:
  - If price hidden: show “Price on request” + emphasize WhatsApp/Call
- CTAs (always visible on mobile):
  - WhatsApp “Ask about this car” (prefilled message includes car name + link)
  - Call
  - Book viewing (form)
- Share:
  - Copy link
  - Share to WhatsApp
- Similar cars (same make/model or same segment)

### 7.5 Company / About
- Brand story (bilingual)
- What makes Classic Car different:
  - sourcing, inspection, showroom experience, after-sales support
- Optional: team photos, showroom photos
- Optional: FAQs

### 7.6 Branches / Locations
- Branch list with:
  - Address (bilingual)
  - Google Maps link
  - Working hours
  - Phone/WhatsApp per branch (if different)
- Optional: embedded map (only if performance impact is acceptable)

### 7.7 Contact
- Contact methods:
  - WhatsApp
  - Call
  - Email
  - Contact form (spam-protected)
- Contact form fields (MVP):
  - Name
  - Phone
  - Preferred contact method (WhatsApp/Call/Email)
  - Message
  - Optional: “Car of interest” (auto-filled when launched from car page)
- Post-submit:
  - Thank you screen + “Open WhatsApp” fallback CTA

---

## 8) Multi-language (English / Arabic)
- Language toggle always visible (header).
- Requirements:
  - Full UI translation (navigation, buttons, labels)
  - Content translation (about text, car descriptions, branch info)
  - **RTL support** for Arabic (layout + alignment + components)
  - URL strategy (recommended):
    - `/en/...` and `/ar/...` with automatic locale detection optional
  - SEO:
    - `hreflang` tags for EN/AR
    - locale-specific metadata (titles/descriptions)

**Content workflow assumption (MVP):**
- Admin enters EN + AR fields (manual entry).
- Optional Phase 2: “auto-translate draft” inside admin (with human review).

---

## 9) Admin / CMS Requirements
### 9.1 Roles
- Admin: full access
- Editor: add/edit inventory + content
- Viewer: read-only analytics/dashboard (optional)

### 9.2 Inventory management
- Add/edit car
- Upload/reorder images (bulk upload)
- Mark availability: available / reserved / sold
- Slug generation (stable links)
- Duplicate car (to speed entry)
- Bulk operations (Phase 2):
  - CSV import/export
  - Batch status updates

### 9.3 Content management
- Home page featured list ordering
- About/Branches/Contact content
- Site settings:
  - WhatsApp number(s)
  - Phone number(s)
  - Email
  - Social links
  - Brand color tokens (safe configuration)
  - Price mode (show/hide/band)

---

## 10) Non-functional Requirements (NFRs)

### 10.1 Performance targets
- Lighthouse (mobile):
  - Performance: **90+**
  - Accessibility: **90+**
  - Best Practices: **90+**
  - SEO: **90+**
- Core Web Vitals targets:
  - LCP < 2.5s (mobile)
  - CLS < 0.1
  - INP “good” range
- Image handling:
  - Next-gen formats (WebP/AVIF)
  - Responsive sizes + lazy loading
  - CDN delivery
- Avoid heavy third-party scripts (maps, chat widgets) unless justified.

### 10.2 Reliability
- 99.9% uptime target (via managed hosting/CDN)
- Graceful error handling for:
  - empty inventory
  - missing photos
  - CMS outages (cached pages still serve)

### 10.3 Security
- HTTPS everywhere
- Form spam protection (honeypot + rate limiting + optional reCAPTCHA)
- Admin auth with strong passwords + 2FA (if supported)
- Audit log for admin actions (ideal)

### 10.4 Accessibility
- Keyboard navigable filters and menus
- Contrast safe in dark theme
- Focus states visible
- Screen-reader labels for controls

---

## 11) Design & UX Direction (High-level)
- Brand feel: **high-end showroom + motorsport edge**
- Visual direction:
  - Dark UI foundation
  - **Racing-red** accents reserved for CTAs, highlights, and active states
  - Plenty of whitespace/spacing (even in dark mode) to feel premium
  - Clean motion (subtle micro-interactions; no “cheap” animations)
- UX principles:
  - Inventory search is the center of the site
  - “Contact in one tap” always available
  - Fast, predictable navigation
  - Mobile-first layouts with thumb-friendly controls

---

## 12) Data Model (MVP)
### Vehicle
- id
- status: available | reserved | sold
- make, model, trim
- year
- mileage (km)
- price (number) *(optional)*
- price_mode: show | hide | band
- price_band: entry | mid | high | ultra *(optional)*
- exterior_color, interior_color
- body_type
- transmission
- drivetrain
- engine
- fuel_type
- origin: local | imported
- import_country *(optional)*
- description_en, description_ar
- features_en[], features_ar[]
- media: images[] (url, alt text, order), optional video
- tags[] (e.g., “AMG”, “M Performance”, “Hybrid”, “Agency”)
- created_at, updated_at
- seo: title/description per locale (optional)

### Branch
- name_en, name_ar
- address_en, address_ar
- google_maps_url
- phone, whatsapp
- hours_en, hours_ar

---

## 13) Integrations
- WhatsApp deep links with prefilled message templates
- Google Maps links (embed optional)
- Analytics:
  - GA4 or equivalent
  - Track lead events + inventory usage events
- Optional:
  - Meta Pixel (if ads planned)
  - Search Console setup (SEO monitoring)

---

## 14) Content Requirements (Assets needed)
- Logo files (SVG preferred)
- Brand colors (primary red + neutrals)
- 10–20 flagship vehicle photos for homepage/hero
- Company story (EN/AR)
- Branch details (EN/AR)
- Contact details + working hours
- Inventory photos (consistent style guidelines strongly recommended)

---

## 15) QA & Acceptance Criteria (MVP)
- Works on latest Chrome/Safari/Firefox + iOS/Android browsers
- Inventory search + filters work correctly (including Arabic)
- Vehicle detail pages load fast and share correctly
- WhatsApp/call buttons work on mobile
- Admin can add a car end-to-end (EN/AR, images, publish)
- No layout breaks in RTL (Arabic)
- Lighthouse targets met on key pages:
  - Home, Inventory, Vehicle details

---

## 16) Open Questions (decisions to finalize)
1) Inventory size range now + expected growth (e.g., 40–100 cars? 300+ later?)
2) Pricing policy:
   - show exact prices, hide, or bands?
3) Lead routing:
   - one WhatsApp number or per-branch?
4) Do you want “sold” cars publicly visible as an archive (trust signal) or hidden?
5) Source of inventory:
   - manual entry only, or CSV import, or existing system export/API?
6) Do you need a “request sourcing” / “find me a car” form?
7) Any specific compliance needs for Arabic copy / phrasing?

---

## 17) Suggested Phases
### Phase 1 (MVP)
- Full redesign + bilingual + inventory + CMS + lead capture + SEO foundation

### Phase 2
- CSV import, advanced analytics dashboard, saved searches, featured collections, sold archive, richer editorial content

### Phase 3
- Deeper integrations (DMS), automated syndication to social, advanced CRM routing

---

## 18) Notes from current brand context (from provided assets)
- Logo is black + red/white, modern “motorsport” look.
- Showroom signage includes Arabic, so RTL support is required.
- Current website has basic structure but needs a complete rebuild for quality and speed.

