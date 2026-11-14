# Raj Durbar: project checklist

Work through this top to bottom. It's built to span several days: each phase can be stopped
safely at its end, and **⏸ = safe place to pause**. Tick boxes as you go (`[ ]` → `[x]`). GitHub
shows them as checkboxes and counts progress. Add a line to the [progress log](#progress-log)
at the end of each session.

Detailed steps: [dns-migration.md](dns-migration.md) (DNS, domain, email) ·
[aws-setup.md](aws-setup.md) (account) · [hld.md](hld.md) (design) ·
[requirements.md](requirements.md) (what we're building).

**Never needed in a hurry:** every phase until 9 leaves the Wix site and `info@` email working.

---

## Phase 0: Planning ✅

- [x] Requirements agreed: [requirements.md](requirements.md) (PR #1)
- [x] High-level design: [hld.md](hld.md) (PR #2)
- [x] Website designs exported to `docs/design/`
- [ ] DNS Terraform + runbook + this checklist reviewed and merged (PR #3)

## Phase 1: AWS account and bootstrap

Mostly done earlier. Confirm each item still holds.

- [ ] Root user has MFA and no access keys ([aws-setup §2](aws-setup.md#2-lock-down-root))
- [ ] Identity Center login works: `aws sso login --profile rajdurbar`, then `aws sts get-caller-identity` shows the account
- [ ] Bootstrap applied, and its state is in S3 (`infra/bootstrap/backend.tf` exists)
- [ ] Budget and security alert emails confirmed (the *Confirm subscription* links were clicked)
- [ ] GitHub repo variables set: `AWS_REGION`, `AWS_PLAN_ROLE_ARN`, `AWS_DEPLOY_ROLE_ARN`, `TF_STATE_BUCKET`
- [ ] GitHub environments `staging` and `production` exist, limited to `main`; `production` has you as required reviewer

⏸

## Phase 2: Move DNS from Wix to Route 53 (website and email unchanged)

Runbook steps 1–5. Allow about 1 hour, then up to 48 hours for the change to spread.

**Prepare**
- [ ] Wix → Domains → Manage DNS Records: every row compared with the [record table](dns-migration.md#whats-in-the-zone)
- [ ] Any extra records added to `infra/modules/dns/main.tf` (or none found)
- [ ] Old nameservers written down for rollback: `ns14.wixdns.net`, `ns15.wixdns.net`

**Create the zone** (`infra/envs/shared`)
- [ ] `backend.hcl` created from the example with the state bucket name
- [ ] `terraform init -backend-config=backend.hcl`
- [ ] `terraform plan -out shared.tfplan` **only creates**, destroys nothing (about 25 resources)
- [ ] `terraform apply shared.tfplan`
- [ ] Four Route 53 nameservers copied from `terraform output name_servers`:
      `_____________` `_____________` `_____________` `_____________`

**Check before switching** (`nslookup … <route53-ns>`)
- [ ] MX → `rajdurbar-co-uk.mail.protection.outlook.com`
- [ ] TXT → one SPF record + the `NETORGFT…` record
- [ ] A → the three Wix IPs
- [ ] `www` CNAME → `cdn3.wixdns.net`
- [ ] `autodiscover` CNAME → `autodiscover.outlook.com`

⏸ (nothing has changed for anyone yet)

**Switch** (quiet time)
- [ ] GoDaddy → Nameservers → *I'll use my own* → four Route 53 nameservers saved. Date/time: ________

**Verify same day**
- [ ] `nslookup -type=NS rajdurbar.co.uk 1.1.1.1` lists `awsdns` servers
- [ ] `https://rajdurbar.co.uk` and `https://www.rajdurbar.co.uk` show the Wix site, with a padlock
- [ ] Email **to** `info@` from Gmail arrives
- [ ] Email **from** `info@` to Gmail arrives; *Show original* shows **SPF: PASS**
- [ ] Outlook on phone and desktop still syncs
- [ ] Wix dashboard still shows the site connected (if not, follow Wix's *connect via pointing* prompts)

**Verify next day**
- [ ] All of the above still OK

⏸

## Phase 3: Certificate and email authentication

Runbook steps 6–7.

- [ ] `terraform apply -var wait_for_certificate=true` in `infra/envs/shared` finishes
- [ ] ACM (us-east-1) shows the certificate **Issued** for apex, `www`, `staging`
- [ ] SES (London) → Identities → `rajdurbar.co.uk`: DKIM **Successful**
- [ ] SES custom MAIL FROM (`mail.rajdurbar.co.uk`) **Success**
- [ ] SES production access requested. Date: ________
- [ ] SES production access **approved**. Date: ________
- [ ] Microsoft Defender → DKIM: the two CNAME values copied into `m365_dkim_cnames`, then applied
- [ ] M365 DKIM **enabled** in Defender; an email to Gmail shows **DKIM: PASS**
- [ ] DMARC reports arriving at `info@` (zip attachments)
- [ ] After 2–4 clean weeks: `dmarc_policy = "quarantine"` applied. Date: ________

⏸

## Phase 4: Domain registration GoDaddy → Route 53 Domains

Runbook step 10. Start a few days after phase 2. Not within 30 days of the renewal date.

- [ ] GoDaddy renewal date noted: ________ (OK to transfer now? Y/N)
- [ ] GoDaddy auto-renew **off**
- [ ] Registrant contact details correct at GoDaddy
- [ ] Route 53 → Registered domains → **Transfer in** started (keep current nameservers; privacy on; auto-renew on)
- [ ] IPS tag changed at GoDaddy to the tag AWS specifies
- [ ] AWS confirmation emails approved
- [ ] Transfer complete: domain listed in Route 53 → Registered domains. Date: ________
- [ ] Nameservers still the Route 53 ones; site and email still OK
- [ ] Domain removed from GoDaddy

⏸

## Phase 5: Microsoft 365 away from GoDaddy (Exchange Online Plan 1, direct)

Runbook step 11. Allow 1 quiet hour. Can be done before or after phase 4.

- [ ] Mailbox exported to `.pst` and stored safely
- [ ] Global Admin access to admin.microsoft.com obtained
- [ ] New admin on `@NETORGFT17301331.onmicrosoft.com` created, Global Administrator, MFA on
- [ ] GoDaddy federation removed from `rajdurbar.co.uk` (Microsoft's federated → managed guide)
- [ ] New password set for `info@`; it signs in at outlook.office.com
- [ ] **Exchange Online (Plan 1)** bought directly from Microsoft, 1 licence. Cost: £____/month
- [ ] Licence **assigned to `info@`**, *before* the next step
- [ ] GoDaddy removed under Settings → Partner relationships
- [ ] GoDaddy Microsoft 365 subscription **cancelled**
- [ ] Email to and from Gmail works; Outlook on the phone signs in again
- [ ] Cleanup: Skype/Teams and device-management records and `include:secureserver.net` removed from DNS module; applied; email still OK
- [ ] GoDaddy account closed (nothing left in it)

⏸

## Phase 6: Build the application

Order follows [HLD §7](hld.md#7-build-order). One PR per item.

**Infrastructure**
- [ ] `modules/api`: ECS Express Mode service, ALB, task role (IAM DB auth, SES send), log group, origin-verify secret
- [ ] `modules/web` wired to the API (`api_origin_domain`, `origin_verify_secret`)
- [ ] CloudWatch alarms: API 5xx, DB CPU/storage, emailed to you

**Website (`web/`, Astro + React)**
- [ ] Project set up; fonts and styles from `docs/design/`
- [ ] Home (with offers panel)
- [ ] Menu (loads from `/api/public/menu`, with static fallback)
- [ ] Book a table (1-hour notice, 30-min slots, 1–8 guests, 9+ call, email required)
- [ ] Our story
- [ ] Find us (address, hours, last orders 30 min, parking, train, step-free and accessible toilet)
- [ ] Private dining and catering: "Call us" with click-to-call
- [ ] Privacy notice (12-month retention, erasure requests to `info@`)
- [ ] 404 page
- [ ] Staff sign-in, bookings (list, add, edit, confirm, decline, cancel, no-show, "large table" tag for 7–8)
- [ ] Staff content admin: menu, prices, hours, offers
- [ ] Accessibility check (WCAG 2.2 AA) and Lighthouse mobile ≥ 90

**API (`api/`, Spring Boot 3, Java 21)**
- [ ] Project set up, Flyway, `app_user` / `migrator` roles, IAM DB auth via the AWS JDBC wrapper
- [ ] Public endpoints: menu, hours, offers, `POST /api/bookings` with every validation rule
- [ ] Rate limiting + honeypot; `X-Origin-Verify` check
- [ ] Staff auth: shared password (Argon2), lockout, secure session cookie, 12-hour idle timeout
- [ ] Staff endpoints: bookings and content admin
- [ ] SES emails: received / confirmed / declined / changed
- [ ] Daily GDPR job: anonymise bookings older than 12 months; tested; logs a count
- [ ] Staff "delete guest details" action
- [ ] No guest data in logs (checked)

**CI/CD (GitHub Actions)**
- [ ] `ci.yml`: build and test web + api, `terraform plan` on pull requests
- [ ] `deploy.yml`: merge → staging (terraform, image to ECR, ECS deploy, S3 sync, invalidate, smoke test)
- [ ] Production job behind the `production` environment approval, deploying the same image SHA

⏸

## Phase 7: Staging

- [ ] `infra/envs/staging` applied (the database starts costing from here)
- [ ] `terraform apply -var use_custom_domain=true`, and `https://staging.rajdurbar.co.uk` loads
- [ ] End-to-end test: book a table → "received" email → staff confirm → "confirmed" email
- [ ] Decline, edit and cancel flows tested
- [ ] Booking rules tested: under 1 hour refused, outside hours refused, 9+ guests refused
- [ ] Staff content edit shows on the public site without a redeploy
- [ ] GDPR job tested against old test bookings
- [ ] DB admin access via Session Manager port-forward tested ([HLD §3.3](hld.md#33-how-people-connect-admin-and-debugging))
- [ ] Staging scaled down when not in use (ECS to 0, RDS stopped)

⏸

## Phase 8: Production

- [ ] `infra/envs/production` created (deletion protection on) and applied via approval
- [ ] Production deployed through the pipeline (approved in GitHub)
- [ ] Production CloudFront distribution has the `rajdurbar.co.uk` and `www` aliases
- [ ] Real menu, prices, hours and offers entered by staff
- [ ] Shared staff password set and given to staff; tablet signed in
- [ ] Test booking on production, then deleted

⏸

## Phase 9: Website cutover from Wix → AWS

Runbook step 9. Quiet time.

- [ ] `website = { mode = "cloudfront", cloudfront_domain_name = "<prod>.cloudfront.net" }` in `infra/envs/shared`, applied. Date/time: ________
- [ ] `https://rajdurbar.co.uk` shows the new site, with a padlock; `www` redirects
- [ ] Email to and from `info@` still OK
- [ ] Real booking made from a phone works end to end
- [ ] Rollback understood: set `mode = "wix"` and apply
- [ ] Wix kept for 2 weeks. Cancel-after date: ________
- [ ] Anything worth keeping exported from Wix (likely nothing)
- [ ] **Wix cancelled**
- [ ] CAA record added (`0 issue "amazon.com"`), applied

## Phase 10: After launch

- [ ] Budget alerts reviewed after the first full month. Actual cost: $____
- [ ] Staging off when not in use
- [ ] Review quote added to home page
- [ ] Bus routes added to Find us
- [ ] v2 backlog prioritised ([requirements §6](requirements.md#6-later-versions-v2))

---

## Progress log

One line per session: date, what got done, anything to pick up next time.

| Date | Done | Next / blockers |
|---|---|---|
| 14 Nov 2026 | Requirements, HLD, DNS Terraform, runbook, checklist | Review PR #3, then Phase 1 checks and Phase 2 |
| | | |
