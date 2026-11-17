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
    key          = "envs/staging/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = local.region

  default_tags {
    tags = {
      Project     = "raj-durbar"
      Environment = "staging"
      ManagedBy   = "terraform"
    }
  }
}

locals {
  region   = "eu-west-2"
  name     = "rajdurbar-staging"
  domain   = "rajdurbar.co.uk"
  hostname = "staging.${local.domain}"

  # Serve staging at staging.rajdurbar.co.uk. Needs envs/shared applied, the
  # GoDaddy nameservers moved to Route 53, and the certificate ISSUED
  # (runbook step 8). Kept in the file, not passed with -var, so later applies
  # don't undo it.
  use_custom_domain = false
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_route53_zone" "main" {
  count = local.use_custom_domain ? 1 : 0
  name  = local.domain
}

data "aws_acm_certificate" "site" {
  count       = local.use_custom_domain ? 1 : 0
  provider    = aws.us_east_1
  domain      = local.domain
  statuses    = ["ISSUED"]
  most_recent = true
}

module "network" {
  source     = "../../modules/network"
  name       = local.name
  region     = local.region
  cidr_block = "10.20.0.0/16"
}

module "database" {
  source              = "../../modules/database"
  name                = local.name
  subnet_ids          = module.network.private_subnet_ids
  security_group_id   = module.network.db_security_group_id
  deletion_protection = false # staging can be rebuilt; production sets true
}

module "ecr" {
  source = "../../modules/ecr"
  name   = "${local.name}-api"
}

module "web" {
  source = "../../modules/web"
  name   = local.name
  # api_origin_domain and origin_verify_secret are wired in once the API module
  # (ECS Express Mode) is added alongside the backend code.

  aliases             = local.use_custom_domain ? [local.hostname] : []
  acm_certificate_arn = local.use_custom_domain ? data.aws_acm_certificate.site[0].arn : ""
}

resource "aws_route53_record" "staging" {
  for_each = local.use_custom_domain ? toset(["A", "AAAA"]) : toset([])

  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = local.hostname
  type    = each.value

  alias {
    name                   = module.web.distribution_domain_name
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront's fixed hosted zone ID
    evaluate_target_health = false
  }
}

output "site_url" {
  value = module.web.site_url
}

output "site_bucket" {
  value = module.web.site_bucket
}

output "cloudfront_distribution_id" {
  value = module.web.distribution_id
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}

output "db_endpoint" {
  value = module.database.endpoint
}

output "db_master_secret_arn" {
  value = module.database.master_secret_arn
}
