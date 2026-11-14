# Raj Durbar website: requirements

Status: **draft v0.1**, agreed 14 Nov 2026. Anything not yet decided is listed under
[Open questions](#7-open-questions-deferred-not-blocking).

## 1. Overview

Raj Durbar is an Indian & Nepalese restaurant. This project replaces the current Wix site at
**rajdurbar.co.uk** with our own site on AWS, adding:

- online table booking requests that staff confirm,
- a staff area to manage bookings and keep the menu, prices, opening hours and offers up to date.

Stack and repo layout are in the [README](../README.md); account setup is in
[aws-setup.md](aws-setup.md); page designs are in [design/](design/README.md).

| Part | Tech |
|---|---|
| Website | Astro + React, static, S3 + CloudFront |
| API | Spring Boot 3, Java 21, behind CloudFront at `/api/*` |
| Database | RDS Postgres (private, encrypted) |
| Email | Amazon SES |
| DNS / TLS | Route 53, ACM |
| Infra | Terraform, London (eu-west-2) |

## 2. MVP scope (v1)

### 2.1 Public pages

As in the designs, for phone and desktop:

- **Home**, including the **offers panel**
- **Menu**: content is managed by staff (see 2.4)
- **Book a table**
- **Our story**
- **Find us**: 31 The Broadway, New Haw, Addlestone KT15 3EU; phone 01932 348400; opening hours
  (staff-managed).
  - **Parking:** "Parking is available right in front of the restaurant."
  - **By train:** "Byfleet & New Haw station (South Western Railway) is about 1 km away, roughly a
    15-minute walk." Check the walking time on the ground before launch.
  - **By bus:** local buses stop on Byfleet Road near the station and on Woodham Lane. Exact route
    numbers are still to confirm (see open questions).
  - **Access:** "Our entrance is step-free and we have an accessible toilet. If you need anything
    else, just call us on 01932 348400."
- **Private dining and catering:** both are available, **by phone only** (01932 348400). There's no
  online form or booking for these in v1 (an online enquiry form comes in v2, see section 6). The design's "Email us about a party →" link becomes
  "Call us about private dining or catering", with a click-to-call `tel:` link on phones. The
  "up to [NUMBER] guests" placeholder is removed.

### 2.2 Table booking (request → staff confirm)

1. The guest enters date, time, party size, name, **email (required)** and phone, and can add a note
   (allergies, high chair, occasion). Email is required because confirmations are sent by email.
   The design's "Email (optional)" label and "We'll confirm by phone or text" copy change to
   "We'll email you to confirm".
2. The booking is saved as **Pending**, and the guest gets a "request received" email.
3. Staff **confirm** or **decline** it in the staff bookings screen, optionally with a message.
4. The guest gets a "confirmed" or "declined" email.

Rules:

- **Minimum notice: 1 hour.** Online requests must be for a time at least 1 hour from now.
- **Opening hours** (from the designs; staff can edit them in the admin screen):

  | Day | Hours |
  |---|---|
  | Mon–Thu | 5:30–10:30 pm |
  | Fri–Sat | 5–11 pm |
  | Sun | 5–10 pm |
  | Bank holidays | Normal hours for that day of the week |

  **Last orders** (kitchen): 30 minutes before closing every day. This is shown on Find us
  ("Last orders 30 minutes before closing") and doesn't affect bookings.

- **Time slots:** every 30 minutes from opening time, with the last slot 1 hour before closing
  (e.g. Mon 5:30 pm … 9:30 pm). This matches the Book a table design.
- **Party size online: 1–8.** For 9 or more, the guest is asked to call 01932 348400, as in the design.
  - Why: the biggest table seats 6 and can be stretched to 8. Anything larger means joining tables,
    which staff arrange by phone.
  - Requests for 7–8 guests are flagged on the staff screen ("large table") so staff check space
    before confirming.
- No automatic capacity limit in v1. Staff see how many tables are already booked at each time
  (staff add-booking design) and decide when confirming.
- No payment or card details in v1.
- Basic abuse protection: server-side validation, rate limiting per IP, and a hidden honeypot field.

Booking states: `PENDING → CONFIRMED | DECLINED`, and staff can set `CANCELLED` / `NO_SHOW` later.

### 2.3 Notifications

| Event | Guest | Staff |
|---|---|---|
| Request submitted | Email "request received" | Appears on staff screen |
| Confirmed / declined | Email | — |
| Staff edits time/party | Email with new details | — |

- Emails are sent via SES from **`info@rajdurbar.co.uk`** (the existing M365 mailbox), so guest
  replies land in that inbox. SES only sends; receiving stays with M365.
- There are no staff emails or SMS in v1. Staff watch the bookings screen, which refreshes
  automatically and highlights new pending requests.

### 2.4 Staff area

- **Sign in:** **one shared login** for the restaurant, used on the tablet/phone.
  - Trade-off accepted: there's no record of *which* person made a change.
  - Mitigations: strong password, sign-in rate limiting / lockout, idle session timeout,
    secure HttpOnly cookies, and changing the password whenever a staff member leaves.
- **Bookings:** list by day, filter by status, add a booking (phone/walk-in), edit, confirm, decline, cancel.
- **Content admin** (no developer needed):
  - Menu: sections, dishes, descriptions, prices, dietary/spice tags, show/hide.
  - Opening hours, including special hours.
  - Offers shown in the offers panel, with start/end dates.
  - Content is stored in Postgres and served by the API. The public site reads it at runtime,
    so changes show up straight away without a redeploy.

## 3. Domain, DNS and email

Current state (checked 14 Nov 2026):

| What | Provider today |
|---|---|
| Domain registration | GoDaddy |
| DNS | **Wix** (`ns14/ns15.wixdns.net`) |
| Website | Wix |
| Email | Microsoft 365, **bought through GoDaddy**. One mailbox, `info@rajdurbar.co.uk`, used for email only |

**Goal: leave Wix and GoDaddy entirely** to cut costs. Decisions:

| What | Moves to | Approx. cost after |
|---|---|---|
| DNS | **Route 53**, managed by Terraform | $0.50/month |
| Website | AWS (this project); cancel Wix after cutover | in the HLD estimate |
| Domain registration | **Route 53 Domains** | about $9–10/year for `.co.uk` (confirm on the AWS price list) |
| Email | **Exchange Online (Plan 1), bought directly from Microsoft**: email-only, 50 GB, Outlook apps. Same mailbox and address, no data migration | about £3–4/month |

Do these in order. Each step is independent and can be undone. The guides are in [dns-migration.md](dns-migration.md).

1. DNS → Route 53 (website still on Wix, email unchanged).
2. Domain registration → Route 53 Domains.
3. Microsoft 365 → direct with Microsoft (take the account over from GoDaddy, then cancel GoDaddy's subscription).
4. Website → AWS, then cancel Wix.

Rules:

- **Email must keep working.** Every live record is copied into Route 53 exactly (MX, autodiscover,
  M365 verification TXT, device-management and Skype/Teams CNAME/SRV records). The old zone had
  **two SPF records**, which is invalid, so they're merged into one. DMARC is added in monitor mode.
  M365 DKIM is turned on after the move.
- **SES:**
  - verify the domain using Easy DKIM CNAMEs;
  - set up a custom MAIL FROM subdomain (`mail.rajdurbar.co.uk`) with its own SPF, so the apex SPF
    record doesn't change and DMARC alignment passes;
  - request SES production access (move out of the sandbox) before launch.
- **TLS:** an ACM certificate in **us-east-1** (required by CloudFront) for `rajdurbar.co.uk` and
  `www.rajdurbar.co.uk`, DNS-validated in Route 53. Both names alias to CloudFront, and `www`
  redirects to the bare domain (or the other way round; pick one).

## 4. Environments and cutover

| Env | Address | Notes |
|---|---|---|
| Staging | `staging.rajdurbar.co.uk` | Deploys from `main` automatically |
| Production | `rajdurbar.co.uk` | Deploys need approval in the GitHub `production` environment |

Cutover from Wix happens in **two separate, low-risk phases**. The step-by-step guide is
[dns-migration.md](dns-migration.md).

1. **Move DNS first (now):** create the Route 53 zone as an exact copy of the current Wix zone,
   *including* the records that point the website at Wix. Then switch the nameservers in GoDaddy
   (currently `ns14/ns15.wixdns.net`). Visitors and email see no change. This unlocks the
   certificate, SES and `staging.rajdurbar.co.uk`.
2. **Move the website later:** when production is built and tested on staging, switch only the
   apex and `www` records from Wix to CloudFront (one Terraform change, reversible). Keep Wix about
   2 weeks as a fallback, then cancel it.

Rollback: phase 1, switch the GoDaddy nameservers back to the Wix ones. Phase 2, set the website
records back to Wix.

## 5. Non-functional requirements

- **Cost:** keep it low, no fixed launch date. Target roughly £30–50/month all-in; the database and
  API are most of it. The existing budget alerts are at $20 and $40.
- **Performance:** the public pages are static and cached at the edge. Aim for a Lighthouse
  performance score of 90 or more on mobile.
- **Accessibility:** WCAG 2.2 AA. The designs include a large-text phone view.
- **Privacy (UK GDPR):**
  - privacy notice page;
  - only the booking data that's needed is collected;
  - no tracking cookies in v1, so no cookie banner.
- **Data retention and deletion (UK GDPR "storage limitation"):**
  - UK GDPR sets no fixed maximum. Data may be kept only as long as it's needed for the purpose
    it was collected for. There are no payments, so no 6-year accounting rule applies.
  - **Retention period: 12 months after the booking date.** This covers handling complaints and
    disputes and recognising returning guests. It's stated in the privacy notice.
  - **Automatic deletion is required:** a scheduled job (daily) removes guest name, email, phone and
    notes from bookings older than 12 months, keeping only anonymous figures (date, time, party size,
    status) for reporting. The job is tested and its runs are logged.
  - Declined, cancelled and no-show bookings follow the same rule.
  - Guest emails from SES aren't stored in the database. SES/CloudWatch logs must not contain guest
    personal data, or must expire within the same period.
  - **Backups:** deleted data stays in RDS automated backups until they expire, so backup retention
    stays short (7 days in production) and is mentioned in the privacy notice.
  - **Right to erasure:** staff can delete a guest's details on request at any time (staff screen action).
  - Requests (access, erasure) are made to `info@rajdurbar.co.uk`.
- **Security:** the ground rules in the [README](../README.md) apply: no long-lived AWS keys,
  GitHub OIDC, human review of `infra/` changes, production approval. Security headers are already set
  in the `web` module.
- **Backups:** automated RDS backups; deletion protection on in production.

## 6. Later versions (v2+)

- Cookie-free analytics
- Google Maps embed and link to Google reviews on Find Us
- Link out to an online ordering / delivery platform
- Contact / enquiry form, emailed to the restaurant
- **Private dining and catering enquiry form:** date, guest numbers, event type, contact details,
  and message, emailed to `info@rajdurbar.co.uk`. Same 12-month retention and deletion rules as
  bookings.
- **Closed days and holiday closures, managed by staff:** staff block whole days or time ranges
  (e.g. Christmas, private events). Blocked times can't be requested online, and a notice shows on
  Book a table and Find us. Until then, closures are handled by declining requests and by editing
  opening hours.
- Not yet decided:
  - deposits / card details;
  - email or SMS alerts to staff;
  - individual staff accounts with MFA (upgrade from the shared login).

## 7. Open questions (deferred, not blocking)

None of these block the build; they can be filled in before launch.

1. **Review quote for the home page:** the owner picks one from the restaurant's Google Business
   Profile. Use a short quote with the reviewer's first name (or "Google review") and star rating,
   copied word for word. Ideally ask the reviewer first, since the review text is theirs. A live
   Google reviews widget comes with the v2 Google Maps/reviews feature.
2. Bus route numbers that stop nearest The Broadway (check the Surrey bus timetables).
3. Content from Wix: probably nothing to bring across. Check before cancelling Wix.

Cutover logins: the project owner holds GoDaddy, Wix and M365 admin access.
