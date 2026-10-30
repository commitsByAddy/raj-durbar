variable "name" {
  description = "Prefix for resource names, e.g. rajdurbar-staging."
  type        = string
}

variable "region" {
  type = string
}

variable "cidr_block" {
  type    = string
  default = "10.20.0.0/16"
}
