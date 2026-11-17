output "site_bucket" {
  value = aws_s3_bucket.site.id
}

output "distribution_id" {
  value = aws_cloudfront_distribution.this.id
}

output "distribution_domain_name" {
  description = "Target for Route 53 alias records."
  value       = aws_cloudfront_distribution.this.domain_name
}

output "distribution_hosted_zone_id" {
  description = "Hosted zone ID for Route 53 alias records pointing at the distribution."
  value       = aws_cloudfront_distribution.this.hosted_zone_id
}

output "site_url" {
  description = "Free CloudFront address for testing."
  value       = "https://${aws_cloudfront_distribution.this.domain_name}"
}
