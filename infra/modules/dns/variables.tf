variable "domain" {
  description = "Apex domain, e.g. rajdurbar.co.uk."
  type        = string
}

variable "ttl" {
  description = "Default TTL (seconds) for copied records. Matches the old Wix zone."
  type        = number
  default     = 3600
}

variable "website" {
  description = <<-EOT
    Where rajdurbar.co.uk and www point.
    - mode = "wix": keep serving the current Wix site (before cutover).
    - mode = "cloudfront": alias apex + www to the production CloudFront distribution.
  EOT
  type = object({
    mode                   = string
    cloudfront_domain_name = optional(string, "")
  })
  default = { mode = "wix" }

  validation {
    condition     = contains(["wix", "cloudfront"], var.website.mode)
    error_message = "website.mode must be \"wix\" or \"cloudfront\"."
  }

  validation {
    condition     = var.website.mode != "cloudfront" || var.website.cloudfront_domain_name != ""
    error_message = "Set website.cloudfront_domain_name when website.mode is \"cloudfront\"."
  }
}

variable "wix_apex_ips" {
  description = "Wix A records for the apex, copied from the live zone on 14 Nov 2026."
  type        = list(string)
  default     = ["185.230.63.107", "185.230.63.171", "185.230.63.186"]
}

variable "wix_www_target" {
  description = "Wix CNAME target for www, copied from the live zone on 14 Nov 2026."
  type        = string
  default     = "cdn3.wixdns.net"
}

variable "m365_dkim_cnames" {
  description = <<-EOT
    Microsoft 365 DKIM CNAME targets for selector1 and selector2. They are
    tenant-specific: copy them from Microsoft Defender portal > Email &
    collaboration > Policies > Email authentication settings > DKIM.
    Leave empty until then (DKIM is not enabled today, so nothing breaks).
  EOT
  type = object({
    selector1 = string
    selector2 = string
  })
  default = null
}

variable "dmarc_policy" {
  description = "DMARC policy. Start with none (monitor), move to quarantine once reports look clean."
  type        = string
  default     = "none"

  validation {
    condition     = contains(["none", "quarantine", "reject"], var.dmarc_policy)
    error_message = "dmarc_policy must be none, quarantine or reject."
  }
}

variable "dmarc_report_email" {
  description = "Where DMARC aggregate reports are sent."
  type        = string
}

variable "certificate_subdomains" {
  description = "Extra names on the CloudFront certificate besides the apex."
  type        = list(string)
  default     = ["www", "staging"]
}

variable "ses_mail_from_subdomain" {
  description = "Custom MAIL FROM subdomain for SES, so SPF aligns for DMARC."
  type        = string
  default     = "mail"
}

variable "wait_for_certificate" {
  description = <<-EOT
    Wait for ACM to issue the certificate. Only works once the GoDaddy
    nameservers point at this zone; keep false for the first apply.
  EOT
  type        = bool
  default     = false
}
