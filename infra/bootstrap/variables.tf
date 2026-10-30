variable "region" {
  description = "Home region for everything (London)."
  type        = string
  default     = "eu-west-2"
}

variable "project" {
  description = "Short name used in resource names."
  type        = string
  default     = "rajdurbar"
}

variable "github_repository" {
  description = "GitHub repo allowed to deploy, as owner/name."
  type        = string
  default     = "commitsByAddy/raj-durbar"
}

variable "alert_emails" {
  description = "Who receives budget alerts."
  type        = list(string)

  validation {
    condition     = length(var.alert_emails) > 0 && alltrue([for e in var.alert_emails : can(regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", e))])
    error_message = "Provide at least one valid email address."
  }
}

variable "budget_thresholds_usd" {
  description = "Monthly spend (USD) at which to email."
  type        = list(number)
  default     = [20, 40]
}
