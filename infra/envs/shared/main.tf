# Account-wide resources shared by staging and production: the Route 53 zone
# for rajdurbar.co.uk, the CloudFront certificate and the SES identity.
# Apply this BEFORE envs/staging. See docs/dns-migration.md for the runbook.

terraform {
  required_version = ">= 1.11.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Values for bucket come from backend.hcl (terraform init -backend-config=backend.hcl).
  backend "s3" {
    key          = "envs/shared/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
  }
}

locals {
  region = "eu-west-2"
  domain = "rajdurbar.co.uk"
  tags = {
    Project     = "raj-durbar"
    Environment = "shared"
    ManagedBy   = "terraform"
  }
}

provider "aws" {
  region = local.region
  default_tags { tags = local.tags }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags { tags = local.tags }
}

variable "wait_for_certificate" {
  description = "Set true after the GoDaddy nameservers point at Route 53 (runbook step 4)."
  type        = bool
  default     = false
}

module "dns" {
  source = "../../modules/dns"
  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  domain             = local.domain
  dmarc_report_email = "info@${local.domain}"

  # Keep serving Wix until production is live and tested; then switch to
  # { mode = "cloudfront", cloudfront_domain_name = "<prod distribution>.cloudfront.net" }.
  website = { mode = "wix" }

  # Fill in from the Microsoft Defender portal to turn on M365 DKIM (runbook step 6).
  m365_dkim_cnames = null

  wait_for_certificate = var.wait_for_certificate
}

output "name_servers" {
  value = module.dns.name_servers
}

output "zone_id" {
  value = module.dns.zone_id
}

output "certificate_arn" {
  value = module.dns.certificate_arn
}
