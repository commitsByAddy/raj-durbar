terraform {
  required_version = ">= 1.11.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # The bootstrap creates the remote state bucket, so its own state starts local.
  # After the first apply, follow README step "Move bootstrap state into S3".
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project   = "raj-durbar"
      ManagedBy = "terraform"
      Stack     = "bootstrap"
    }
  }
}
