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
  region = "eu-west-2"
  name   = "rajdurbar-staging"
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
