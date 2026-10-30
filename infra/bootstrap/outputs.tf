output "state_bucket" {
  description = "Put this in infra/envs/*/backend.hcl."
  value       = aws_s3_bucket.state.id
}

output "plan_role_arn" {
  description = "GitHub repo variable AWS_PLAN_ROLE_ARN."
  value       = aws_iam_role.plan.arn
}

output "deploy_role_arn" {
  description = "GitHub repo variable AWS_DEPLOY_ROLE_ARN."
  value       = aws_iam_role.deploy.arn
}

output "workload_boundary_arn" {
  description = "Permissions boundary every app role must use."
  value       = aws_iam_policy.boundary.arn
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
