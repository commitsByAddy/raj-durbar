variable "name" {
  type = string
}

variable "api_origin_domain" {
  description = "Backend hostname (no https://). Empty until the API is deployed."
  type        = string
  default     = ""
}

variable "origin_verify_secret" {
  description = "Header value CloudFront sends to the API; the API rejects requests without it."
  type        = string
  default     = ""
  sensitive   = true

  validation {
    condition     = var.api_origin_domain == "" || length(var.origin_verify_secret) >= 32
    error_message = "When api_origin_domain is set, origin_verify_secret must be at least 32 characters."
  }
}

variable "content_security_policy" {
  description = "Fonts are self-hosted, so no third-party font or script hosts are needed."
  type        = string
  default     = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests"
}
