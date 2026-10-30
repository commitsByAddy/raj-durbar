# ---------------------------------------------------------------------------
# GitHub Actions -> AWS with short-lived OIDC tokens. No AWS keys in GitHub.
#
#   * plan role   : read-only, usable from pull requests (agents' PRs included)
#   * deploy role : can change infrastructure, but ONLY from the GitHub
#                   "staging" or "production" environments. Production is
#                   gated by required reviewers configured in GitHub.
#
# Any IAM role the deploy role creates (e.g. the ECS task role) must sit under
# the /rajdurbar/ path AND carry the workload permissions boundary, so a
# compromised pipeline cannot mint itself an admin role.
# ---------------------------------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

locals {
  role_path      = "/${var.project}/"
  boundary_name  = "${var.project}-workload-boundary"
  boundary_arn   = "arn:${data.aws_partition.current.partition}:iam::${local.account_id}:policy${local.role_path}${local.boundary_name}"
  workload_roles = "arn:${data.aws_partition.current.partition}:iam::${local.account_id}:role${local.role_path}*"
  repo           = "repo:${var.github_repository}"
  gha_role_arns = [
    "arn:${data.aws_partition.current.partition}:iam::${local.account_id}:role/github/*",
  ]

  # Audit trail must never be stopped, narrowed or removed.
  cloudtrail_tamper_actions = [
    "cloudtrail:StopLogging",
    "cloudtrail:DeleteTrail",
    "cloudtrail:UpdateTrail",
    "cloudtrail:PutEventSelectors",
    "cloudtrail:PutInsightSelectors",
    "cloudtrail:RemoveTags",
    "cloudtrail:DeleteEventDataStore",
  ]

  # Guardrail buckets (state + audit logs) must keep their settings.
  bucket_tamper_actions = [
    "s3:DeleteBucket",
    "s3:PutBucketPolicy",
    "s3:DeleteBucketPolicy",
    "s3:PutBucketVersioning",
    "s3:PutLifecycleConfiguration",
    "s3:PutBucketOwnershipControls",
    "s3:PutBucketAcl",
    "s3:PutBucketPublicAccessBlock",
    "s3:PutEncryptionConfiguration",
  ]

  # Every IAM write except passing roles and creating service-linked roles.
  iam_write_actions = [
    "iam:Add*",
    "iam:Attach*",
    "iam:Change*",
    "iam:CreateAccessKey",
    "iam:CreateAccountAlias",
    "iam:CreateGroup",
    "iam:CreateInstanceProfile",
    "iam:CreateLoginProfile",
    "iam:CreateOpenIDConnectProvider",
    "iam:CreatePolicy",
    "iam:CreatePolicyVersion",
    "iam:CreateRole",
    "iam:CreateSAMLProvider",
    "iam:CreateServiceSpecificCredential",
    "iam:CreateUser",
    "iam:CreateVirtualMFADevice",
    "iam:Deactivate*",
    "iam:Delete*",
    "iam:Detach*",
    "iam:Enable*",
    "iam:Put*",
    "iam:Remove*",
    "iam:Reset*",
    "iam:Resync*",
    "iam:Set*",
    "iam:Tag*",
    "iam:Untag*",
    "iam:Update*",
    "iam:Upload*",
  ]
}

# --- Trust policies --------------------------------------------------------

data "aws_iam_policy_document" "trust_plan" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "${local.repo}:pull_request",
        "${local.repo}:ref:refs/heads/main",
      ]
    }
  }
}

data "aws_iam_policy_document" "trust_deploy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "${local.repo}:environment:staging",
        "${local.repo}:environment:production",
      ]
    }
  }
}

# --- Plan role (read-only) -------------------------------------------------

resource "aws_iam_role" "plan" {
  name                 = "${var.project}-gha-plan"
  path                 = "/github/"
  assume_role_policy   = data.aws_iam_policy_document.trust_plan.json
  max_session_duration = 3600
}

resource "aws_iam_role_policy_attachment" "plan_readonly" {
  role       = aws_iam_role.plan.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/ReadOnlyAccess"
}

data "aws_iam_policy_document" "plan_state" {
  statement {
    sid       = "StateRead"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.state.arn]
  }
  statement {
    sid       = "StateObjectsRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.state.arn}/*"]
  }
  statement {
    sid       = "StateLockOnly"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.state.arn}/*.tflock"]
  }
}

resource "aws_iam_role_policy" "plan_state" {
  name   = "terraform-state-read-and-lock"
  role   = aws_iam_role.plan.id
  policy = data.aws_iam_policy_document.plan_state.json
}

# --- Workload permissions boundary -----------------------------------------
# Applied to every role the pipeline creates. Allows normal app permissions,
# blocks anything that could escalate or tamper with security controls.

data "aws_iam_policy_document" "boundary" {
  statement {
    sid       = "AllowWorkloadActions"
    actions   = ["*"]
    resources = ["*"]
  }

  statement {
    sid       = "DenyIamWrites"
    effect    = "Deny"
    actions   = local.iam_write_actions
    resources = ["*"]
  }

  statement {
    sid           = "PassOnlyWorkloadRoles"
    effect        = "Deny"
    actions       = ["iam:PassRole"]
    not_resources = [local.workload_roles]
  }

  statement {
    sid    = "DenyAccountAndRoleHopping"
    effect = "Deny"
    actions = [
      "organizations:*",
      "account:*",
      "sts:AssumeRole",
      "s3:PutAccountPublicAccessBlock",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "DenyAuditTampering"
    effect    = "Deny"
    actions   = local.cloudtrail_tamper_actions
    resources = ["*"]
  }

  statement {
    sid       = "DenyGuardrailBucketChanges"
    effect    = "Deny"
    actions   = local.bucket_tamper_actions
    resources = [aws_s3_bucket.state.arn, aws_s3_bucket.trail.arn]
  }

  statement {
    sid       = "DenyAuditLogAndStateHistoryDeletion"
    effect    = "Deny"
    actions   = ["s3:DeleteObject", "s3:DeleteObjectVersion", "s3:PutObject"]
    resources = ["${aws_s3_bucket.trail.arn}/*"]
  }

  statement {
    sid       = "DenyStateAccess"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = ["${aws_s3_bucket.state.arn}/*"]
  }
}

resource "aws_iam_policy" "boundary" {
  name   = local.boundary_name
  path   = local.role_path
  policy = data.aws_iam_policy_document.boundary.json
}

# --- Deploy role -----------------------------------------------------------

resource "aws_iam_role" "deploy" {
  name                 = "${var.project}-gha-deploy"
  path                 = "/github/"
  assume_role_policy   = data.aws_iam_policy_document.trust_deploy.json
  max_session_duration = 3600
}

# Everything except IAM, Organizations and account management.
resource "aws_iam_role_policy_attachment" "deploy_poweruser" {
  role       = aws_iam_role.deploy.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/PowerUserAccess"
}

data "aws_iam_policy_document" "deploy_iam" {
  statement {
    sid = "ReadIam"
    actions = [
      "iam:Get*",
      "iam:List*",
    ]
    resources = ["*"]
  }

  # Create/update workload roles only under /rajdurbar/ and only with the boundary.
  statement {
    sid = "ManageWorkloadRolesWithBoundary"
    actions = [
      "iam:CreateRole",
      "iam:PutRolePolicy",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:PutRolePermissionsBoundary",
    ]
    resources = [local.workload_roles]
    condition {
      test     = "StringEquals"
      variable = "iam:PermissionsBoundary"
      values   = [local.boundary_arn]
    }
  }

  statement {
    sid = "MaintainWorkloadRoles"
    actions = [
      "iam:DeleteRole",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:UpdateRole",
      "iam:UpdateRoleDescription",
      "iam:UpdateAssumeRolePolicy",
    ]
    resources = [local.workload_roles]
  }

  statement {
    sid = "ManageWorkloadPolicies"
    actions = [
      "iam:CreatePolicy",
      "iam:CreatePolicyVersion",
      "iam:DeletePolicy",
      "iam:DeletePolicyVersion",
      "iam:TagPolicy",
      "iam:UntagPolicy",
    ]
    resources = ["arn:${data.aws_partition.current.partition}:iam::${local.account_id}:policy${local.role_path}app-*"]
  }

  statement {
    sid       = "PassWorkloadRolesToAwsServices"
    actions   = ["iam:PassRole"]
    resources = [local.workload_roles]
    condition {
      test     = "StringLike"
      variable = "iam:PassedToService"
      values = [
        "ecs-tasks.amazonaws.com",
        "ecs.amazonaws.com",
        "rds.amazonaws.com",
        "monitoring.rds.amazonaws.com",
      ]
    }
  }

  statement {
    sid       = "ServiceLinkedRoles"
    actions   = ["iam:CreateServiceLinkedRole"]
    resources = ["arn:${data.aws_partition.current.partition}:iam::${local.account_id}:role/aws-service-role/*"]
  }

  # Hard stops, regardless of anything granted above.
  statement {
    sid    = "ProtectPipelineAndBoundary"
    effect = "Deny"
    actions = [
      "iam:CreatePolicyVersion",
      "iam:DeletePolicy",
      "iam:DeletePolicyVersion",
      "iam:SetDefaultPolicyVersion",
    ]
    resources = [local.boundary_arn]
  }

  statement {
    sid       = "ProtectPipelineRoles"
    effect    = "Deny"
    actions   = ["iam:*"]
    resources = local.gha_role_arns
  }

  statement {
    sid       = "NoAssumingWorkloadRoles"
    effect    = "Deny"
    actions   = ["sts:AssumeRole", "sts:TagSession"]
    resources = [local.workload_roles]
  }

  statement {
    sid       = "ProtectAuditTrail"
    effect    = "Deny"
    actions   = local.cloudtrail_tamper_actions
    resources = ["*"]
  }

  statement {
    sid       = "ProtectGuardrailBuckets"
    effect    = "Deny"
    actions   = local.bucket_tamper_actions
    resources = [aws_s3_bucket.state.arn, aws_s3_bucket.trail.arn]
  }

  statement {
    sid       = "ProtectAccountPublicAccessBlock"
    effect    = "Deny"
    actions   = ["s3:PutAccountPublicAccessBlock"]
    resources = ["*"]
  }

  statement {
    sid       = "ProtectAuditLogObjects"
    effect    = "Deny"
    actions   = ["s3:DeleteObject", "s3:DeleteObjectVersion", "s3:PutObject"]
    resources = ["${aws_s3_bucket.trail.arn}/*"]
  }

  statement {
    sid       = "KeepStateHistory"
    effect    = "Deny"
    actions   = ["s3:DeleteObjectVersion"]
    resources = ["${aws_s3_bucket.state.arn}/*"]
  }
}

resource "aws_iam_role_policy" "deploy_iam" {
  name   = "scoped-iam-and-guardrails"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy_iam.json
}
