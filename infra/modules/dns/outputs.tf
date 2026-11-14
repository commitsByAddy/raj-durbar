output "zone_id" {
  value = aws_route53_zone.this.zone_id
}

output "name_servers" {
  description = "Put these four in GoDaddy > Domain > Nameservers > \"I'll use my own nameservers\"."
  value       = aws_route53_zone.this.name_servers
}

output "certificate_arn" {
  description = "ACM certificate (us-east-1) for CloudFront. Usable once its status is ISSUED."
  value       = aws_acm_certificate.site.arn
}

output "ses_identity_arn" {
  value = aws_sesv2_email_identity.domain.arn
}
