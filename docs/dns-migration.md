# Moving rajdurbar.co.uk DNS to Route 53 (runbook)

**Goal:** move the domain's DNS from **Wix** to **Route 53** *without changing anything visitors
or email see*. The Wix website and Microsoft 365 email keep working exactly as before. Once DNS is
in Route 53, we can issue the HTTPS certificate, verify SES and stand up `staging.rajdurbar.co.uk`.
Moving the website itself from Wix to AWS is a separate, later step (step 9). Steps 10–11
then move the domain registration and email away from GoDaddy, so nothing is left at Wix or GoDaddy.

- **Time:** about 1 hour of work, plus up to 48 hours for the change to spread.
- **Cost:** $0.50/month for the hosted zone.
- **Who:** the project owner, who holds the GoDaddy, Wix and M365 logins.

## What's in the zone

Terraform: [`infra/modules/dns`](../infra/modules/dns), applied from
[`infra/envs/shared`](../infra/envs/shared). The records were copied from the live Wix zone on
14 Nov 2026.

| Record | Value | Note |
|---|---|---|
| `@` MX | `10 rajdurbar-co-uk.mail.protection.outlook.com` | M365 mail, unchanged |
| `@` TXT | `v=spf1 include:spf.protection.outlook.com include:secureserver.net -all` | **Fixed:** the old zone had two SPF records, which is invalid. Merged into one |
| `@` TXT | `NETORGFT17301331.onmicrosoft.com` | M365 domain verification, unchanged |
| `autodiscover` CNAME | `autodiscover.outlook.com` | Outlook setup, unchanged |
| `enterpriseregistration` / `enterpriseenrollment` CNAME | Microsoft device management | unchanged |
| `lyncdiscover`, `sip` CNAME; `_sip._tls`, `_sipfederationtls._tcp` SRV | Skype/Teams | unchanged |
| `@` A | `185.230.63.107 / .171 / .186` | Wix website, unchanged until cutover. TTL lowered to 300s (was 3600) so the cutover is quick |
| `www` CNAME | `cdn3.wixdns.net` | Wix website, unchanged until cutover. TTL 300s, as above |
| `_dmarc` TXT | `v=DMARC1; p=none; rua=mailto:info@rajdurbar.co.uk; adkim=r; aspf=r` | **New:** monitor-only |
| `xxxx._domainkey` CNAME ×3 | `…dkim.amazonses.com` | **New:** SES DKIM |
| `mail` MX + TXT | `feedback-smtp.eu-west-2.amazonses.com`, `v=spf1 include:amazonses.com -all` | **New:** SES MAIL FROM |
| `_xxxx` CNAME ×3 | ACM validation | **New:** HTTPS certificate for apex, `www`, `staging`. Added in step 6, not step 2 |

## Step 1: check Wix for records a lookup can't see

A public lookup can't list every record. In **Wix → Domains → rajdurbar.co.uk → Manage DNS Records**,
compare every row with the table above. If there's anything extra (e.g. a `google-site-verification`
TXT, or another CNAME), add it to `infra/modules/dns/main.tf` before going on.

**Write down the current nameservers:** `ns14.wixdns.net`, `ns15.wixdns.net`. These are the rollback values.

## Step 2: create the zone (nothing changes for visitors yet)

```powershell
aws sso login --profile rajdurbar
$env:AWS_PROFILE = "rajdurbar"
cd infra\envs\shared
Copy-Item backend.hcl.example backend.hcl   # put in your state bucket name
terraform init -backend-config=backend.hcl
terraform plan -out shared.tfplan
```

The plan should **only create** resources (about 20): the zone, the records above and the SES
identity. The HTTPS certificate is not requested yet. ACM gives up on validation after 72 hours,
so it waits until the nameservers point at Route 53 (step 6). If it looks right:

```powershell
terraform apply shared.tfplan
terraform output name_servers
```

Copy the four nameservers (`ns-123.awsdns-…`).

## Step 3: check Route 53 answers correctly, *before* switching

Ask one of the new nameservers directly. Replace `NS` with one from the output:

```powershell
$NS = "ns-123.awsdns-45.com"
nslookup -type=MX  rajdurbar.co.uk $NS
nslookup -type=TXT rajdurbar.co.uk $NS
nslookup -type=A   rajdurbar.co.uk $NS
nslookup -type=CNAME www.rajdurbar.co.uk $NS
nslookup -type=CNAME autodiscover.rajdurbar.co.uk $NS
```

Each answer must match the table. **Don't continue if MX or autodiscover is wrong.**

## Step 4: switch nameservers in GoDaddy (quiet time, e.g. a weekday morning)

1. GoDaddy → **My Products → rajdurbar.co.uk → DNS → Nameservers → Change nameservers**.
2. Choose **I'll use my own nameservers** and enter the four Route 53 nameservers.
3. Save. GoDaddy may warn that the domain no longer uses its DNS. That's expected.

The change spreads over minutes to 48 hours. During that time some people reach Wix DNS and some
Route 53. Both give the same answers, so nobody notices.

## Step 5: verify (same day, then again the next day)

```powershell
nslookup -type=NS rajdurbar.co.uk 1.1.1.1     # should list awsdns servers
```

- [ ] `https://rajdurbar.co.uk` and `https://www.rajdurbar.co.uk` still show the Wix site with a padlock.
- [ ] Send an email **to** `info@rajdurbar.co.uk` from a Gmail account, and it arrives.
- [ ] Reply **from** `info@` to Gmail, and it arrives. In Gmail, *Show original* says **SPF: PASS**.
- [ ] Outlook on phone and desktop still connects.
- [ ] Wix dashboard: the site is still connected. If Wix says it's "not connected", its *Connect via
      pointing* method uses exactly the A and `www` records we copied, so follow Wix's prompts. Don't
      change anything in Route 53.

## Step 6: issue the certificate

Once the NS lookup shows awsdns, change `issue_certificate = false` to `true` in
`infra/envs/shared/main.tf` and apply:

```powershell
terraform plan -out shared.tfplan    # should only create the certificate, its records and the validation wait
terraform apply shared.tfplan
```

This requests the certificate and waits until ACM marks it **ISSUED**, usually 5–30 minutes. ACM
renews it automatically after that. Commit the change so the setting stays in the file and later
applies keep the certificate.

**Later, adding a name to the certificate** (`certificate_subdomains`) replaces it. Terraform
issues the new certificate first, but can't delete the old one while CloudFront still uses it:

1. `terraform apply` in `infra/envs/shared`. It issues the new certificate, then **fails** to delete
   the old one (`ResourceInUseException`). That's expected.
2. Check `terraform output certificate_arn` in `infra/envs/shared` shows the **new** ARN.
3. `terraform apply` in `infra/envs/staging` (and production), so CloudFront moves to the new certificate.
4. `terraform apply` in `infra/envs/shared` again. It now deletes the old certificate.

## Step 7: finish email authentication

1. **SES:** in the AWS console → SES (London) → **Identities → rajdurbar.co.uk**, check that DKIM
   shows *Successful* and Custom MAIL FROM shows *Success*.
2. **SES production access:** SES → Account dashboard → **Request production access**:
   *Transactional email only: table-booking confirmations to guests who requested a booking on
   our website. Low volume (under 50/day). Bounces and complaints are handled automatically.*
   Until AWS approves it, SES can only send to verified addresses.
3. **Microsoft 365 DKIM** (recommended; not enabled today): go to Microsoft Defender portal → Email &
   collaboration → Policies & rules → Threat policies → Email authentication settings → **DKIM** →
   rajdurbar.co.uk. Copy the two CNAME values into `m365_dkim_cnames` in `infra/envs/shared/main.tf`,
   then `terraform apply`. After that, click **Enable** in Defender.
4. **DMARC:** reports arrive at `info@` as zip attachments. After 2–4 weeks with no unexpected senders,
   change `dmarc_policy` to `"quarantine"`.

## Step 8: staging address

When staging is built and the certificate is ISSUED, change `use_custom_domain = false` to `true`
in the `locals` block of `infra/envs/staging/main.tf`, commit it, and run `terraform apply` in
`infra/envs/staging`. That serves staging at `https://staging.rajdurbar.co.uk`.

## Step 9: later, the website cutover from Wix

When production is live and tested, change `website` in `infra/envs/shared/main.tf` to
`{ mode = "cloudfront", cloudfront_domain_name = "<prod>.cloudfront.net" }` and apply. Only the
website records change; email is untouched. The plan should show the apex `A` and `www` records
**updated in place** (not destroyed and recreated) and two `AAAA` records created.

To roll back the website, set `mode` back to `"wix"`, plan, and check that the plan **destroys
the two `AAAA` records** and updates apex `A` and `www` in place. If the apply stops partway with
a Route 53 "conflicting RRSet" error, run `terraform apply` again: the second run finishes the job.
Keep Wix about 2 weeks, then cancel it and add a CAA record (noted in the module).

## Step 10: transfer the domain registration from GoDaddy to Route 53

Do this after step 5 has run cleanly for a few days. It doesn't change DNS, so the site and email
keep working throughout. **Avoid the last 30 days before the domain's renewal date.**

1. **GoDaddy:** check the domain's renewal date, and turn **auto-renew off**, so GoDaddy doesn't
   charge for a renewal mid-transfer. Make sure the registrant contact details are correct. For
   `.uk`, they're the legal owner of the domain.
2. **AWS console → Route 53 → Registered domains → Transfer in →** `rajdurbar.co.uk`. Keep the
   current nameservers (the Route 53 ones from step 2). Turn on privacy protection and **auto-renew**.
3. `.uk` domains don't use an authorisation code. They move by changing the domain's **IPS tag**.
   AWS shows the tag to use in its transfer instructions for `.uk`. In GoDaddy, request an IPS tag
   change (Domain settings → Transfer → *Transfer out*, or ask GoDaddy support to change the IPS tag
   to the one AWS gives).
4. Watch for AWS emails and approve any confirmation. The transfer usually completes within a few days.
5. Check: Route 53 → Registered domains shows `rajdurbar.co.uk`, nameservers unchanged, auto-renew on.
   Then remove the domain from GoDaddy, and the GoDaddy account if nothing else is in it.

## Step 11: take Microsoft 365 over from GoDaddy (`info@` stays as it is)

GoDaddy-sold Microsoft 365 runs in a Microsoft account (tenant `NETORGFT17301331.onmicrosoft.com`)
that GoDaddy controls, with sign-in going through GoDaddy. Taking it over ("defederating") keeps the
same mailbox, emails, address and DNS records. Only the billing and admin control move to you.
**DNS records don't change.**

Plan an hour at a quiet time. `info@` may need a new password and phones may need to sign in again.

1. **Back up first:** in Outlook desktop → File → Open & Export → Export to a `.pst` file
   (the whole mailbox). Keep it somewhere safe.
2. **Get admin access to the tenant:** with GoDaddy's help if needed, sign in to
   <https://admin.microsoft.com> as a Global Admin. Create a **new admin user on the
   `@NETORGFT17301331.onmicrosoft.com` address**, which doesn't depend on GoDaddy sign-in, and
   give it Global Administrator with MFA.
3. **Remove the GoDaddy sign-in federation** from `rajdurbar.co.uk`, so the domain uses normal
   Microsoft sign-in. Follow Microsoft's current guide for converting a federated domain to managed
   (Microsoft Graph PowerShell). Then set a new password for `info@`.
4. **Buy Exchange Online (Plan 1) directly from Microsoft** in the admin centre (Billing → Purchase
   services), 1 licence, and **assign it to `info@` before removing anything else**.
5. **Remove GoDaddy's access:** admin centre → Settings → Partner relationships → remove GoDaddy.
6. **Cancel the GoDaddy Microsoft 365 subscription.** The mailbox keeps working on the new direct licence.
7. **Check:** send and receive with Gmail, Outlook on the phone signs in, and the admin centre shows
   only your Exchange Online subscription.

Optional cleanup afterwards: email-only means the Skype/Teams (`lyncdiscover`, `sip`, `_sip._tls`,
`_sipfederationtls._tcp`) and device-management (`enterpriseregistration`, `enterpriseenrollment`)
records aren't needed. Remove them from `infra/modules/dns/main.tf` once email is confirmed working.
`include:secureserver.net` can also come out of SPF once GoDaddy is gone.

## Rollback (DNS move)

GoDaddy → Nameservers → **Change** → enter `ns14.wixdns.net` and `ns15.wixdns.net`. The Wix zone
is untouched by steps 1–5, so **up to step 5** everything returns to how it was.

**After step 6** this is no longer a clean undo. The Wix zone has none of the new records, so:

- ACM can't see its validation records and stops renewing the certificate staging uses.
- SES loses its DKIM and MAIL FROM records, and the domain identity stops verifying.
- The DMARC record disappears.

Fix the problem in Route 53 instead where possible. If you really must go back, first add those
records to the Wix zone by hand (copy them from the Route 53 console).

**After step 10** (domain at Route 53 Domains), change the nameservers in Route 53 → Registered
domains, not GoDaddy.

The Route 53 zone is protected from deletion (`prevent_destroy`), so `terraform destroy` in
`infra/envs/shared` refuses to run. To really remove it, delete the `lifecycle` block on
`aws_route53_zone.this` in `infra/modules/dns/main.tf` first, and only once the nameservers no
longer point at it.
