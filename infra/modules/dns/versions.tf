terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
      # aws          = home region (eu-west-2): Route 53, SES
      # aws.us_east_1 = CloudFront certificates must live in us-east-1
      configuration_aliases = [aws.us_east_1]
    }
  }
}
