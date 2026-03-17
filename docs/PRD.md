# ResumeIQ — Product Requirements Document

**Version:** 1.0  
**Last Updated:** March 2026  
**Author:** Dylan Wettlaufer  
**Status:** Active

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Market](#2-target-market)
3. [User Roles & Authentication](#3-user-roles--authentication)
4. [Scan Modes](#4-scan-modes)
5. [Core Features (V1)](#5-core-features-v1)
6. [Monetization & Billing](#6-monetization--billing)
7. [System Architecture](#7-system-architecture)
8. [AI Prompt Specifications](#8-ai-prompt-specifications)
9. [UI & UX Requirements](#9-ui--ux-requirements)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Out of Scope — V1](#12-out-of-scope--v1)
13. [V2 Roadmap](#13-v2-roadmap)

---

## 1. Product Overview

### 1.1 Vision

ResumeIQ is a subscription-based SaaS web application targeting **tech job seekers** — software engineers, data engineers, DevOps engineers, ML engineers, and related roles. It uses AI to analyze, score, and optimize resumes for technical roles. Users upload their resume and optionally a job description, receive structured scored feedback across five dimensions, selectively accept AI-suggested edits line-by-line, preview a diff of changes, and download a polished updated resume as PDF or DOCX.

The product is purpose-built for the tech hiring market. Generic resume tools miss domain-specific nuance: how to write about GitHub projects, how to quantify engineering impact, which cloud certifications matter for which roles, and what keywords FAANG and mid-size tech ATS systems actually filter on. ResumeIQ fills that gap.

### 1.2 Core Value Proposition

- Dual-mode analysis: general resume health scan and role-specific job match scan
- Structured, line-level AI edits that users accept or reject individually — not a black-box rewrite
- Side-by-side diff view before download so users stay in control of every change
- Export to PDF or DOCX with changes applied cleanly
- Full scan history persisted per authenticated user
- Tech-job-specific scoring, keyword libraries, and feedback framing

### 1.3 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Authentication | Clerk (email, Google OAuth, session management) |
| Database & Storage | Supabase (PostgreSQL + Row Level Security, Storage for resume files) |
| AI / LLM | Anthropic Claude API (`claude-sonnet-4-20250514`) via Anthropic SDK |
| Resume Parsing | `pdf-parse` (PDF), `mammoth` (DOCX), plain text textarea input |
| Resume Export | `jsPDF` + `docx` npm library for PDF and DOCX generation |
| Payments | Stripe (subscriptions, webhooks, Clerk metadata sync) |
| Deployment | Vercel (frontend + API routes) |

### 1.4 Important Auth Architecture Note

Because Clerk handles authentication (not Supabase Auth), RLS policies cannot use `auth.uid()`. All database writes from API routes use the **Supabase service role key server-side only**. The service role key must never be exposed to the client. RLS is enforced at the application layer: every API route validates the Clerk session and filters queries by `clerk_user_id` before touching the database.

---

## 2. Target Market

### 2.1 Primary Audience

Tech job seekers, specifically:

- New grad and early-career software engineers (0–3 years experience)
- Mid-level engineers targeting a role change or level-up
- Bootcamp graduates entering the industry
- International candidates navigating North American ATS systems
- Anyone applying to companies known for rigorous ATS filtering (FAANG, mid-size tech, YC startups)

### 2.2 Why Niche Over General

Generic resume tools (Jobscan, Resume Worded, Kickresume) already exist and compete on breadth. ResumeIQ wins by going deep on the tech hiring context:

- Feedback understands the difference between a good bullet for an SWE role vs a PM role
- Keyword library is curated for technical domains (cloud platforms, frameworks, certifications, methodologies)
- Scoring penalizes the patterns tech recruiters specifically dislike: responsibilities-only bullets, missing quantification, vague tech stack mentions, undifferentiated project descriptions
- Distribution channels (r/cscareerquestions, r/learnprogramming, Hacker News) are dense with the exact target user

### 2.3 Role Tracks (Used in Scoring & Feedback)

The app supports role-track selection to tune AI feedback:

- Software Engineer (SWE)
- Backend Engineer
- Frontend Engineer
- Full Stack Engineer
- Data Engineer
- DevOps / Platform Engineer
- Machine Learning Engineer
- Mobile Engineer (iOS / Android)
- General Tech (default if no track selected)

Role track is an optional field on the scan form. When provided, it is included in the Claude prompt to bias feedback and keyword evaluation toward that track's norms.

---

## 3. User Roles & Authentication

### 3.1 Authentication Provider: Clerk

All authentication is handled by Clerk. Unauthenticated users cannot access any analysis features — the app is fully auth-gated. Supported sign-in methods:

- Email + password
- Google OAuth

On first sign-in, a Clerk webhook (`user.created`) fires and creates a corresponding row in the Supabase `users` table. The `clerk_user_id` is the foreign key across all Supabase tables.

### 3.2 User Tiers

| Tier | Access | Notes |
|---|---|---|
| Unauthenticated | Public landing page and pricing page only | No trial, no free scan |
| Pro Monthly | Full access to all features, unlimited scans | Billed monthly via Stripe |
| Pro Annual | Full access to all features, unlimited scans | Billed annually, ~20% discount |

There is no free tier with limited scans in V1. The product is subscription-only post sign-up. The landing page communicates value clearly to justify this.

### 3.3 Subscription Status Sync

Subscription state is stored in Stripe and synced to Clerk's `publicMetadata`:

```json
{
  "subscription_status": "active" | "inactive" | "trialing",
  "plan": "pro_monthly" | "pro_annual" | null,
  "stripe_customer_id": "cus_xxx",
  "stripe_subscription_id": "sub_xxx"
}
```

The Next.js middleware reads Clerk session claims to gate access to all protected routes. The Supabase `users` table mirrors this state for query convenience.

---

## 4. Scan Modes

### 4.1 Mode A: General Resume Scan

The user provides only their resume (no job description). The AI evaluates the resume against broad tech industry best practices across five scored criteria.

**Scoring Criteria:**

| Criterion | What It Measures | Max Score |
|---|---|---|
| ATS | Standard section headings, no tables/graphics/columns that break parsers, keyword density, clean formatting, file format compatibility | 20 |
| Content | Quantified achievements, strong action verbs, appropriate detail per role, no responsibilities-only bullets, project impact clearly stated | 20 |
| Writing | Grammar, spelling, tone consistency, active voice, conciseness, no clichés or filler phrases | 20 |
| Job Match | Without a JD: general tech industry alignment, appropriate seniority signaling, role-track-appropriate language | 20 |
| Ready | Overall polish: all expected sections present (summary/objective, experience, education, skills, contact), formatting consistency, appropriate length (1 page for <5 yrs, 2 pages for 5+) | 20 |

Total score = sum of five criteria (0–100).

### 4.2 Mode B: Job Match Scan

The user provides both their resume and a job description. All five criteria are evaluated relative to the specific role. Job Match in this mode scores direct alignment: keyword overlap, required skills coverage, experience level fit, and title/role alignment.

The keyword gap analysis tab is **only available in Job Match mode**.

### 4.3 Key Behavioral Difference Between Modes

- General scan: ATS and Job Match scored against broad tech best practices
- Job match scan: all five scores re-weighted to reflect the specific role's requirements
- The Claude prompt is different in each mode — see Section 8 for full prompt specs
- Role track selection affects feedback framing in both modes

---

## 5. Core Features (V1)

### 5.1 Resume Input

Users can provide their resume in three ways:

- **PDF upload** (`.pdf`) — parsed server-side using `pdf-parse`
- **DOCX upload** (`.docx`) — parsed server-side using `mammoth`, preserving section structure
- **Plain text paste** — accepted as-is via a textarea fallback

File size limit: **5MB**. Accepted MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`.

Parsed resume text is stored in the Supabase `scans` table. The original file is stored in Supabase Storage and linked to the scan record. If parsing fails (e.g. scanned/image PDF), the user is prompted to paste as text instead.

### 5.2 Job Description Input (Job Match Mode Only)

- Paste text directly into a textarea
- Upload PDF or DOCX — parsed server-side identically to resume parsing
- JD text is passed to the Claude prompt and is stored in the `scans` table for history re-opening
- JD job title and company name are extracted by Claude and stored separately

### 5.3 Analysis & Scoring

On submission the app calls `POST /api/analyze`, which:

1. Validates Clerk session and active subscription status
2. Parses the uploaded file(s) server-side
3. Constructs the Claude prompt based on scan mode and role track
4. Calls the Anthropic SDK (`claude-sonnet-4-20250514`, temperature 0, max_tokens 4096)
5. Receives and validates a strictly typed JSON response
6. Inserts a row into the Supabase `scans` table
7. Uploads the original resume file to Supabase Storage
8. Returns the scan result JSON to the client

Claude must return valid JSON only — no markdown, no prose, no code fences. The API route validates the response schema before saving or returning. If validation fails, it retries once. On second failure it returns a 500 with a user-facing error message.

### 5.4 Feedback Display

Results UI has two tabs:

**Suggestions Tab**

- List of feedback items, each containing: `severity` (high / medium / low), `section`, `title`, `description`, `original_line` (nullable), `suggested_line` (nullable)
- Each item has an **Accept** and **Dismiss** button
- **Accept All** button accepts all non-dismissed suggestions
- Accepted items are visually marked (green tint) and queued for the rewrite step
- Severity shown as a colored dot: red (high), amber (medium), green (low)

**Keywords Tab** (Job Match mode only)

- Matched keywords (green pills): present in both resume and JD
- Missing keywords (red pills): present in JD but absent from resume
- Missing keywords link to relevant feedback items in the Suggestions tab

### 5.5 AI Rewrite & Diff View

When the user clicks **Generate updated resume** (requires at least one accepted suggestion):

1. A second Claude call is made to `POST /api/rewrite`
2. The API passes the original resume text and the array of accepted feedback item objects
3. Claude rewrites **only the specific lines identified in accepted feedback items** — the rest of the resume is untouched
4. The API returns a diff array: `[{ section, original_line, revised_line }]`
5. The UI renders a **side-by-side diff view**: original on the left (red strikethrough on changed text), revised on the right (green highlight on new text)
6. The user can un-accept individual changes in the diff view before downloading

### 5.6 Export / Download

After reviewing the diff, the user clicks Download. The client generates the output file with accepted changes applied:

- **PDF export**: rendered client-side using `jsPDF`, clean single-column resume template
- **DOCX export**: generated client-side using the `docx` npm library
- Original formatting is best-effort preserved; a clean standard template is used if the input structure is ambiguous
- Default filename: `[FirstName]_[LastName]_Resume.[ext]`

### 5.7 Scan History

All completed scans are saved and accessible from the History page. Each entry stores:

- Scan date and mode (general / job match)
- Overall score and five sub-scores
- Job title and company parsed from the JD (Job Match mode)
- Role track if selected
- Full feedback JSON
- Link to re-open the results view in read-only state

Users can delete individual history entries. Deletion removes the Supabase row and any associated file in Supabase Storage.

---

## 6. Monetization & Billing

### 6.1 Stripe Integration Flow

1. User clicks Subscribe on the pricing page
2. Frontend calls `POST /api/billing/create-checkout` → creates a Stripe Checkout Session with `clerk_user_id` in metadata
3. On successful payment, Stripe fires `checkout.session.completed` to `POST /api/webhooks/stripe`
4. Webhook handler updates Clerk user `publicMetadata` and the Supabase `users` table
5. On cancellation or failure, Stripe fires `customer.subscription.updated` / `customer.subscription.deleted` → same handler sets `subscription_status` to `inactive`

All webhook handlers use **idempotency keys** to prevent duplicate processing on Stripe retries.

### 6.2 Plans

| Plan | Billing | Access |
|---|---|---|
| Pro Monthly | Monthly recurring | Full feature access, unlimited scans |
| Pro Annual | Annual recurring (~20% discount) | Full feature access, unlimited scans |

### 6.3 Access Gating

Next.js middleware intercepts all requests to `/dashboard`, `/scan`, `/history`, and all `/api/analyze` and `/api/rewrite` routes. Checks:

1. Clerk session is valid (user is signed in)
2. Clerk `publicMetadata.subscription_status === 'active'`

If either fails → redirect to `/pricing`. API routes perform the same check server-side as a second layer of defense.

### 6.4 Billing Management

Users manage their subscription (cancel, upgrade, update payment method) via the Stripe Customer Portal, accessible from account settings. Triggered by `POST /api/billing/portal` which creates a portal session URL and redirects.

---

## 7. System Architecture

### 7.1 Route Map

| Route | Visibility | Description |
|---|---|---|
| `/` | Public | Marketing landing page, feature overview, pricing CTA |
| `/pricing` | Public | Subscription plan selection, Stripe Checkout trigger |
| `/sign-in`, `/sign-up` | Public | Clerk auth pages |
| `/dashboard` | Protected | User home: quick-start scan, recent history summary |
| `/scan` | Protected | Main scan interface: upload, input, results, diff view |
| `/history` | Protected | Full scan history list with re-open links |
| `/account` | Protected | Account settings, subscription management link |
| `/api/analyze` | Protected API | Runs Claude analysis, saves scan to Supabase |
| `/api/rewrite` | Protected API | Runs Claude line-level rewrite, returns diff |
| `/api/billing/create-checkout` | Protected API | Creates Stripe Checkout Session |
| `/api/billing/portal` | Protected API | Creates Stripe Customer Portal session |
| `/api/webhooks/stripe` | Public (Stripe-signed) | Stripe webhook handler |
| `/api/webhooks/clerk` | Public (Clerk-signed) | Clerk webhook — creates Supabase user on sign-up |

### 7.2 Supabase Database Schema

#### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Supabase-generated |
| `clerk_user_id` | `text` UNIQUE | Foreign key from Clerk |
| `email` | `text` | Synced from Clerk on creation |
| `subscription_status` | `text` | `active` \| `inactive` \| `trialing` |
| `plan` | `text` | `pro_monthly` \| `pro_annual` \| `null` |
| `stripe_customer_id` | `text` | Stripe customer ID |
| `stripe_subscription_id` | `text` | Stripe subscription ID |
| `created_at` | `timestamptz` | Auto-set |

#### `scans`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Supabase-generated |
| `user_id` | `uuid` FK | References `users.id` |
| `mode` | `text` | `general` \| `job_match` |
| `role_track` | `text` | Optional. e.g. `swe`, `backend`, `devops`, `ml` |
| `resume_text` | `text` | Parsed plain text of uploaded resume |
| `jd_text` | `text` | Parsed JD text (null for general scans) |
| `jd_title` | `text` | Job title extracted from JD (nullable) |
| `jd_company` | `text` | Company extracted from JD (nullable) |
| `overall_score` | `integer` | 0–100 |
| `score_ats` | `integer` | 0–20 |
| `score_content` | `integer` | 0–20 |
| `score_writing` | `integer` | 0–20 |
| `score_job_match` | `integer` | 0–20 |
| `score_ready` | `integer` | 0–20 |
| `feedback_json` | `jsonb` | Full structured feedback array from Claude |
| `keywords_matched` | `text[]` | Matched keywords (job_match mode only) |
| `keywords_missing` | `text[]` | Missing keywords (job_match mode only) |
| `resume_file_path` | `text` | Supabase Storage path to original file |
| `created_at` | `timestamptz` | Auto-set |

**RLS Policy:** Authenticated users can only `SELECT`, `INSERT`, and `DELETE` rows where `user_id` matches their own Supabase user ID. All writes from API routes use the service role key (server-side only). The service role key is **never exposed to the client**.

### 7.3 Supabase Storage

- **Bucket:** `resumes` (private, not publicly accessible)
- **Path convention:** `{clerk_user_id}/{scan_id}/resume.{ext}`
- Files uploaded from API routes using the service role key
- Signed URLs (60-second expiry) generated server-side when a user re-opens a history entry
- Files deleted when the parent scan row is deleted

### 7.4 Data Flow: Analysis Request

```
1. Client        → POST /api/analyze (multipart: resume file, optional JD file, mode, role_track)
2. API Route     → Validate Clerk session + subscription_status
3. API Route     → Parse resume with pdf-parse or mammoth → plain text
4. API Route     → Parse JD text if provided
5. API Route     → Build Claude prompt (mode + role_track aware)
6. Anthropic API → Return structured JSON (scores + feedback + keywords)
7. API Route     → Validate JSON schema
8. API Route     → INSERT row into scans table
9. API Route     → Upload original file to Supabase Storage
10. API Route    → Return scan result JSON to client
11. Client       → Render score dashboard, suggestions list, keywords tab
```

### 7.5 Data Flow: Rewrite Request

```
1. Client        → POST /api/rewrite (scan_id, accepted_feedback_item_ids[])
2. API Route     → Validate Clerk session + subscription
3. API Route     → Fetch resume_text from scans table (filtered by user)
4. API Route     → Build rewrite prompt (original text + accepted items only)
5. Anthropic API → Return diff array [{ section, original_line, revised_line }]
6. API Route     → Return diff to client
7. Client        → Render side-by-side diff view
8. Client        → User confirms → generate PDF or DOCX client-side → download
```

---

## 8. AI Prompt Specifications

All Claude calls use model `claude-sonnet-4-20250514`, `max_tokens: 4096`, `temperature: 0`.

Claude must return **valid JSON only** — no markdown, no prose, no code fences. The API route validates the schema and retries once on failure.

### 8.1 JSON Response Schema (Analysis — Both Modes)

```json
{
  "overall_score": "<integer 0-100>",
  "scores": {
    "ats": "<integer 0-20>",
    "content": "<integer 0-20>",
    "writing": "<integer 0-20>",
    "job_match": "<integer 0-20>",
    "ready": "<integer 0-20>"
  },
  "feedback": [
    {
      "id": "<unique string>",
      "severity": "high | medium | low",
      "section": "<e.g. Experience, Skills, Summary>",
      "title": "<short title>",
      "description": "<actionable explanation>",
      "original_line": "<exact line from resume, or null>",
      "suggested_line": "<replacement line, or null>"
    }
  ],
  "keywords_matched": ["<string>"],
  "keywords_missing": ["<string>"],
  "jd_title": "<string or null>",
  "jd_company": "<string or null>"
}
```

### 8.2 System Prompt — General Scan

```
You are an expert resume coach and ATS specialist with deep knowledge of the tech hiring market. Analyze the resume below and return ONLY a valid JSON object — no markdown, no prose, no code fences — that exactly matches the schema provided.

Score the resume on five criteria, each out of 20:
- ATS: standard section headings, absence of tables/graphics/multi-column layouts that break ATS parsers, keyword density, clean formatting
- Content: quantified achievements, strong action verbs, no responsibilities-only bullets, project impact stated clearly
- Writing: grammar, spelling, active voice, conciseness, no clichés or filler phrases
- Job Match: general tech industry alignment, appropriate seniority signaling, role-track-appropriate language (use the role track provided if given)
- Ready: section completeness (summary, experience, education, skills, contact), formatting consistency, appropriate length

Provide 4–8 feedback items. Each feedback item must include an original_line (the exact text from the resume) and a suggested_line where a line-level change is being recommended — set both to null for structural or section-level observations. Set keywords_matched and keywords_missing to empty arrays. Set jd_title and jd_company to null.
```

### 8.3 System Prompt — Job Match Scan

```
You are an expert resume coach, ATS specialist, and technical recruiter with deep knowledge of the tech hiring market. Analyze the resume against the job description below and return ONLY a valid JSON object — no markdown, no prose, no code fences — that exactly matches the schema provided.

All five scoring criteria must be evaluated relative to the specific role described in the job description:
- ATS: as above, but also check that ATS-critical keywords from the JD appear in the resume
- Content: as above, with emphasis on whether achievements are relevant to the target role
- Writing: as above
- Job Match: score based on keyword overlap, required skills coverage, experience level fit, and role/title alignment with the JD
- Ready: as above

Extract and return:
- keywords_matched: keywords present in both the resume and the JD
- keywords_missing: keywords required or strongly preferred in the JD that are absent from the resume
- jd_title: the job title extracted from the JD (null if unclear)
- jd_company: the company name extracted from the JD (null if unclear)

Provide 5–10 feedback items, prioritizing gaps that directly reduce job match score. Each feedback item must include original_line and suggested_line where a line-level change is being recommended.
```

### 8.4 System Prompt — Rewrite

```
You are an expert resume editor. You will receive the original resume text and a list of accepted feedback items. Each feedback item contains a description of the change needed, the original_line to be changed, and the suggested_line that was proposed.

Your task: rewrite ONLY the specific lines identified in the accepted feedback items. Do not change any other content. Preserve the overall tone and voice of the resume.

Return ONLY a valid JSON array — no markdown, no prose, no code fences. Each element must be:
{
  "section": "<section name>",
  "original_line": "<exact original line>",
  "revised_line": "<your improved version implementing the feedback>"
}

The revised_line must implement the suggestion from the feedback item. If a suggested_line was provided in the feedback item, use it as a strong starting point but feel free to refine it to read naturally in context.
```

### 8.5 User Message Structure

**General scan:**
```
ROLE TRACK: {role_track | "General Tech"}

--- RESUME ---
{resume_text}
```

**Job match scan:**
```
ROLE TRACK: {role_track | "General Tech"}

--- RESUME ---
{resume_text}

--- JOB DESCRIPTION ---
{jd_text}
```

**Rewrite:**
```
--- ORIGINAL RESUME ---
{resume_text}

--- ACCEPTED CHANGES ---
{JSON.stringify(accepted_feedback_items)}
```

---

## 9. UI & UX Requirements

### 9.1 Scan Page Layout

Two-panel layout on desktop (≥768px), stacked on mobile:

- **Left sidebar (340px):** Scan mode toggle (General / Job Match), role track selector (dropdown), resume input section (upload zone + text paste toggle), JD input section (conditionally visible in Job Match mode), Analyze button
- **Right main panel:** Score ring + sub-score bars, tab bar (Suggestions | Keywords), feedback list with Accept/Dismiss per item, Accept All button, Generate updated resume button (disabled until ≥1 item accepted)
- **Diff view:** Replaces the feedback list after rewrite is generated. Download PDF and Download DOCX buttons at the bottom.

### 9.2 Score Display

- Overall score: animated SVG ring, color-coded by range
  - 0–49: red (`#E24B4A`)
  - 50–74: amber (`#EF9F27`)
  - 75–100: green (`#639922`)
- Verdict label: `Needs major work` (0–49) | `Needs improvement` (50–74) | `Strong` (75–89) | `Excellent` (90–100)
- Five sub-scores as labeled progress bars with numeric values

### 9.3 Feedback Items

- Severity dot: red (high), amber (medium), green (low)
- Each item shows: section label, title, description
- If `original_line` and `suggested_line` are present: render a mini before/after preview below the description
- Accept: item turns green, checkmark icon, queued for rewrite
- Dismiss: item collapses with strikethrough styling

### 9.4 Diff View

- Side-by-side: original (left), revised (right)
- Inline highlights: red background + strikethrough for removed text, green background for added text
- Undo icon per changed line to revert that specific change before downloading
- Download PDF and Download DOCX buttons at the bottom of the view

### 9.5 History Page

- List sorted by date descending
- Each row: date, mode badge (`General` | `Job Match`), role track badge (if set), job title + company (Job Match mode), overall score pill, Re-open button
- Re-open renders the original results view read-only (no re-analysis; diff and download still available if previously generated)
- Delete icon per row with a confirmation dialog

### 9.6 Landing Page Requirements

Must communicate clearly to the target audience:

- Headline focused on tech job seekers (not generic "improve your resume")
- Feature highlights calling out ATS optimization for tech roles, keyword gap analysis, line-level AI edits
- Pricing section with monthly / annual toggle
- No free tier — justify value clearly before the CTA
- Social proof section (placeholder for testimonials / "used by X job seekers" once data exists)

---

## 10. Error Handling & Edge Cases

| Scenario | Handling |
|---|---|
| File upload > 5MB | Reject client-side before upload with size limit message |
| Unsupported file type | Reject client-side with supported format list |
| PDF parsing fails (scanned/image PDF) | Return user-facing error: "Could not extract text from this PDF. Please paste your resume as text instead." |
| Claude returns invalid JSON | Retry once. On second failure return 500: "Analysis failed, please try again." |
| Claude API timeout (>30s) | Return 504. Do not save incomplete scan to history. |
| Stripe webhook delivery failure | Stripe retries automatically. Idempotency keys on handler prevent duplicate processing. |
| User accesses protected route with inactive subscription | Middleware redirects to `/pricing` with a session message |
| Rewrite diff references a line not found in original | Skip that item silently, log server-side warning |
| Empty resume text after parsing | Return validation error before calling Claude: "Could not read resume content. Try a different format." |
| Clerk webhook fires before Supabase insert completes | Webhook handler uses upsert to handle race conditions |

---

## 11. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Analysis latency (p50) | < 8 seconds from submit to results rendered |
| Rewrite latency (p50) | < 6 seconds |
| File upload latency | < 2 seconds for files up to 2MB |
| Claude API error rate | < 1% |
| Uptime | > 99.5% (Vercel + Supabase SLAs) |
| Mobile responsiveness | Fully responsive down to 375px viewport |
| WCAG compliance | AA level for all interactive elements |
| Data retention | Scan history retained indefinitely while subscription is active; user can delete at any time |
| Account deletion | On `user.deleted` Clerk webhook: all Supabase rows and Storage files purged |

---

## 12. Out of Scope — V1

The following are intentionally excluded from V1 to keep scope focused:

- GitHub integration / project description import
- Role-track-specific scoring presets beyond prompt-level tuning
- Cover letter generation or analysis
- LinkedIn profile optimization
- Multi-resume comparison
- Team or recruiter-facing features
- In-app WYSIWYG resume editor
- Email notifications or scan reminders
- Free tier with scan limits
- Mobile native app (iOS / Android)
- Interview prep or question generation features

---

## 13. V2 Roadmap

These features are explicitly planned for V2 and should be kept in mind when making V1 architectural decisions to avoid painting into a corner.

### 13.1 GitHub Integration

**Goal:** Allow users to connect their GitHub account and import project data to auto-generate stronger resume bullets.

**How it works:**
- User authenticates with GitHub via OAuth (through Clerk's GitHub connection or a separate OAuth flow)
- App fetches the user's public repos via GitHub API: repo name, description, language, stars, commit count, README summary
- A dedicated Claude call ingests the repo data and generates resume-ready bullet suggestions for each project: quantified impact, tech stack callouts, achievement framing
- User selects which suggestions to include before running the main resume scan
- Generated bullets appear in the resume input pre-populated, which the user can edit before analyzing

**Data needed in V2 schema:** `github_username`, `github_repos_cache` (jsonb) on the `users` table.

### 13.2 Role-Track Scoring Presets

**Goal:** Deeper, track-specific scoring rather than just prompt-level tuning.

**How it works:**
- Each role track (SWE, DevOps, ML, etc.) has a defined keyword library, a weighting bias for the five scoring criteria, and a set of track-specific red flags (e.g. a DevOps resume without mentioning CI/CD is a high-severity gap; an ML resume without mentioning any datasets or model metrics is penalized)
- These presets are stored as config (JSON or DB table) and injected into the Claude prompt as additional context
- The scoring rubric becomes track-aware rather than relying solely on Claude's general knowledge

**New table needed:** `role_track_configs` with columns: `track`, `keyword_library` (text[]), `scoring_weights` (jsonb), `red_flags` (jsonb).

### 13.3 Tech Keyword Library

**Goal:** A curated, maintained keyword database for tech roles used to power the keyword gap analysis with higher precision than Claude's general knowledge alone.

**How it works:**
- Keywords organized by category (cloud platforms, languages, frameworks, certifications, methodologies, tools)
- Used as supplementary context in the Job Match scan prompt: "Also check for these role-relevant keywords that are commonly required but easy to miss: ..."
- Updated quarterly as the tech hiring landscape shifts

**Implementation:** Static JSON config in V2, potentially a DB table in V3 if we want admin-editable.

### 13.4 Interview Prep Mode

**Goal:** After a successful scan, offer AI-generated interview prep based on the job description.

**How it works:**
- User clicks "Prep for this role" from a Job Match scan result
- Claude generates: likely behavioral questions, likely technical questions based on the JD's stack, suggested STAR-format talking points derived from the user's resume bullets
- Results displayed in a separate prep view and saved to history alongside the scan

**Data needed:** `interview_prep_json` column on the `scans` table (nullable).

### 13.5 Multi-Resume Management

**Goal:** Let users maintain multiple versions of their resume (e.g. a backend-focused version and a full-stack version) and run scans against each.

**How it works:**
- Users can save named resume versions to their account
- When starting a scan, they choose from saved resumes or upload a new one
- History is organized by resume version

**New table needed:** `saved_resumes` with columns: `id`, `user_id`, `name`, `resume_text`, `file_path`, `created_at`.

---

*End of Document*
