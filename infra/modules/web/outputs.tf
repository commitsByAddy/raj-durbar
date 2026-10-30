output "site_bucket" {
  value = aws_s3_bucket.site.id
}

output "distribution_id" {
  value = aws_cloudfront_distribution.this.id
}

output "site_url" {
  description = "Free CloudFront address for testing."
  value       = "https://${aws_cloudfront_distribution.this.domain_name}"
}
