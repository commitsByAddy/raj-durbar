terraform {
  backend "s3" {
    bucket       = "rajdurbar-tfstate-043312794504"
    key          = "bootstrap/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
  }
}
