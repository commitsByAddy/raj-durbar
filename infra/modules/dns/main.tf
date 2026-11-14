# Route 53 zone for the domain, plus everything that lives in it:
#   1. exact copies of the Microsoft 365 email records (from the live Wix zone)
#   2. the website records (Wix until cutover, then CloudFront)
#   3. email authentication: one merged SPF, DMARC, optional M365 DKIM
#   4. ACM certificate (us-east-1) for CloudFront, DNS-validated
#   5. SES domain identity with Easy DKIM and a custom MAIL FROM
#
# Records copied on 14 Nov 2026 with nslookup against the live zone
# (ns14/ns15.wixdns.net). Check the Wix DNS page for anything extra before
# switching nameservers: a public lookup can't list every record.

data "aws_region" "current" {}

resource "aws_route53_zone" "this" {
  name    = var.domain
  comment = "Managed by Terraform (infra/envs/shared)"
}

# --- 1. Microsoft 365 (copied as-is) ----------------------------------------

resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.this.zone_id
  name    = var.domain
  type    = "MX"
  ttl     = var.ttl
  records = ["10 ${replace(var.domain, ".", "-")}.mail.protection.outlook.com"]
}

# Apex TXT holds several values in ONE record set (Route 53 requirement):
#   - SPF: the old zone had TWO SPF records, which is invalid (SPF "permerror")
#     and hurts delivery. Merged into one, keeping both senders.
#   - Microsoft 365 domain verification value.
# SES does not need to be in the apex SPF: it uses the MAIL FROM subdomain.
resource "aws_route53_record" "apex_txt" {
  zone_id = aws_route53_zone.this.zone_id
  name    = var.domain
  type    = "TXT"
  ttl     = var.ttl
  records = [
    "v=spf1 include:spf.protection.outlook.com include:secureserver.net -all",
    "NETORGFT17301331.onmicrosoft.com",
  ]
}

locals {
  m365_cnames = {
    autodiscover           = "autodiscover.outlook.com"
    enterpriseregistration = "enterpriseregistration.windows.net"
    enterpriseenrollment   = "enterpriseenrollment.manage.microsoft.com"
    lyncdiscover           = "webdir.online.lync.com"
    sip                    = "sipdir.online.lync.com"
  }

  m365_srv = {
    "_sip._tls"              = "100 1 443 sipdir.online.lync.com"
    "_sipfederationtls._tcp" = "100 1 5061 sipfed.online.lync.com"
  }
}

resource "aws_route53_record" "m365_cname" {
  for_each = local.m365_cnames

  zone_id = aws_route53_zone.this.zone_id
  name    = "${each.key}.${var.domain}"
  type    = "CNAME"
  ttl     = var.ttl
  records = [each.value]
}

resource "aws_route53_record" "m365_srv" {
  for_each = local.m365_srv

  zone_id = aws_route53_zone.this.zone_id
  name    = "${each.key}.${var.domain}"
  type    = "SRV"
  ttl     = var.ttl
  records = [each.value]
}

resource "aws_route53_record" "m365_dkim" {
  for_each = var.m365_dkim_cnames == null ? {} : {
    selector1 = var.m365_dkim_cnames.selector1
    selector2 = var.m365_dkim_cnames.selector2
  }

  zone_id = aws_route53_zone.this.zone_id
  name    = "${each.key}._domainkey.${var.domain}"
  type    = "CNAME"
  ttl     = var.ttl
  records = [each.value]
}

# --- 2. Website --------------------------------------------------------------

resource "aws_route53_record" "apex_wix" {
  count = var.website.mode == "wix" ? 1 : 0

  zone_id = aws_route53_zone.this.zone_id
  name    = var.domain
  type    = "A"
  ttl     = var.ttl
  records = var.wix_apex_ips
}

resource "aws_route53_record" "www_wix" {
  count = var.website.mode == "wix" ? 1 : 0

  zone_id = aws_route53_zone.this.zone_id
  name    = "www.${var.domain}"
  type    = "CNAME"
  ttl     = var.ttl
  records = [var.wix_www_target]
}

locals {
  cloudfront_zone_id = "Z2FDTNDATAQYW2" # fixed hosted zone ID for all CloudFront distributions
  cloudfront_records = var.website.mode == "cloudfront" ? {
    "apex-a"    = { name = var.domain, type = "A" }
    "apex-aaaa" = { name = var.domain, type = "AAAA" }
    "www-a"     = { name = "www.${var.domain}", type = "A" }
    "www-aaaa"  = { name = "www.${var.domain}", type = "AAAA" }
  } : {}
}

resource "aws_route53_record" "website_cloudfront" {
  for_each = local.cloudfront_records

  zone_id = aws_route53_zone.this.zone_id
  name    = each.value.name
  type    = each.value.type

  alias {
    name                   = var.website.cloudfront_domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

# --- 3. DMARC ----------------------------------------------------------------

resource "aws_route53_record" "dmarc" {
  zone_id = aws_route53_zone.this.zone_id
  name    = "_dmarc.${var.domain}"
  type    = "TXT"
  ttl     = var.ttl
  records = ["v=DMARC1; p=${var.dmarc_policy}; rua=mailto:${var.dmarc_report_email}; adkim=r; aspf=r"]
}

# No CAA record yet: Wix must keep renewing its own certificate until cutover.
# After Wix is cancelled, add CAA "0 issue \"amazon.com\"" so only ACM can issue.

# --- 4. ACM certificate for CloudFront (us-east-1) ---------------------------

resource "aws_acm_certificate" "site" {
  provider = aws.us_east_1

  domain_name               = var.domain
  subject_alternative_names = [for s in var.certificate_subdomains : "${s}.${var.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for o in aws_acm_certificate.site.domain_validation_options : o.domain_name => {
      name   = o.resource_record_name
      type   = o.resource_record_type
      record = o.resource_record_value
    }
  }

  zone_id         = aws_route53_zone.this.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 300
  records         = [each.value.record]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  count    = var.wait_for_certificate ? 1 : 0
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# --- 5. SES sending identity -------------------------------------------------

resource "aws_sesv2_email_identity" "domain" {
  email_identity = var.domain

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }
}

resource "aws_route53_record" "ses_dkim" {
  count = 3

  zone_id = aws_route53_zone.this.zone_id
  name    = "${aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.domain}"
  type    = "CNAME"
  ttl     = var.ttl
  records = ["${aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

locals {
  mail_from_domain = "${var.ses_mail_from_subdomain}.${var.domain}"
}

resource "aws_sesv2_email_identity_mail_from_attributes" "domain" {
  email_identity         = aws_sesv2_email_identity.domain.email_identity
  mail_from_domain       = local.mail_from_domain
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}

resource "aws_route53_record" "ses_mail_from_mx" {
  zone_id = aws_route53_zone.this.zone_id
  name    = local.mail_from_domain
  type    = "MX"
  ttl     = var.ttl
  records = ["10 feedback-smtp.${data.aws_region.current.region}.amazonses.com"]
}

resource "aws_route53_record" "ses_mail_from_spf" {
  zone_id = aws_route53_zone.this.zone_id
  name    = local.mail_from_domain
  type    = "TXT"
  ttl     = var.ttl
  records = ["v=spf1 include:amazonses.com -all"]
}
