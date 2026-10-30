# AWS setup (one time, on Windows)

Takes about an hour. Steps 1–3 are in the browser, 4–7 in **PowerShell**.
Nothing here costs money except the CloudTrail log storage (pennies).

---

## 1. Create the AWS account

1. Go to <https://aws.amazon.com> → **Create an AWS account**.
2. Use an email address just for this account (e.g. a restaurant mailbox you control).
   This becomes the **root** login.
3. Choose the **Paid plan** when asked. You still get the sign-up credits, and the
   account is never auto-closed when credits run out.
4. Add a payment card and complete phone verification.

## 2. Lock down root

1. Sign in as root → account name (top right) → **Security credentials**.
2. **Multi-factor authentication (MFA)** → **Assign MFA device** → *Authenticator app*
   → scan the QR code → enter two codes in a row → **Add MFA**.
3. Optional but recommended: add a second MFA device (backup phone).
4. Check **Access keys** is empty. Never create root access keys.

From now on root is only for billing emergencies.

## 3. Create your everyday admin login (IAM Identity Center)

1. Top-right region selector → **Europe (London) eu-west-2**.
2. Search **IAM Identity Center** → **Enable** (accept "enable with AWS Organizations";
   this account becomes the management account, which is fine).
3. **Users → Add user**: your name and email → create. Check your inbox, accept the
   invite, set a password and **register MFA** when prompted.
4. **Permission sets → Create permission set → Predefined → AdministratorAccess**,
   session duration 4 hours.
5. **AWS accounts** → tick the account → **Assign users or groups** → your user →
   the AdministratorAccess permission set → **Submit**.
6. On the Identity Center **Dashboard**, copy the **AWS access portal URL**
   (looks like `https://d-xxxxxxxxxx.awsapps.com/start`).

Sign out of root and use the portal from now on.

## 4. Install the tools

```powershell
winget install Amazon.AWSCLI
winget install Hashicorp.Terraform
winget install Git.Git
```

Close and reopen PowerShell, then check:

```powershell
aws --version
terraform -version   # needs 1.11 or newer
```

## 5. Connect the AWS CLI with short-lived credentials

```powershell
aws configure sso
```

Answer the prompts:

| Prompt | Answer |
|---|---|
| SSO session name | `rajdurbar` |
| SSO start URL | the access portal URL from step 3.6 |
| SSO region | `eu-west-2` |
| SSO registration scopes | press Enter |
| (browser opens, approve) | |
| Account / role | your account, `AdministratorAccess` |
| Default client Region | `eu-west-2` |
| Default output format | `json` |
| Profile name | `rajdurbar` |

Then:

```powershell
$env:AWS_PROFILE = "rajdurbar"
aws sts get-caller-identity
```

You should see your account ID. Next time, just run `aws sso login --profile rajdurbar`.

## 6. Run the bootstrap

From the repo folder:

```powershell
cd infra\bootstrap
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars        # put in your email and the owner's email, save
terraform init
terraform plan -out bootstrap.tfplan
```

Read the plan. It should **only create** things (roughly 30 resources), destroy nothing:

- Terraform state bucket, versioned and encrypted
- CloudTrail audit log and its bucket
- account-wide "no public S3 buckets" block and default disk encryption
- the monthly budget with alerts at $20, $40 and a forecast warning
- IAM Access Analyzer, which emails you if anything becomes reachable from outside the account
- the GitHub connection plus two roles: `rajdurbar-gha-plan` (read-only, for pull
  requests) and `rajdurbar-gha-deploy` (only from the GitHub `staging` / `production`
  environments), and the permissions boundary that limits any role the pipeline creates

If it looks right:

```powershell
terraform apply bootstrap.tfplan
terraform output
```

Both of you will get an email from **AWS Notifications** asking to confirm a
subscription. Click **Confirm subscription** — that's how security alerts reach you.

Copy the outputs somewhere safe (they are not secret, just IDs).

### Move the bootstrap's own state into S3

The bootstrap starts with its state file on your laptop. Move it to the bucket it
just created so it can't be lost:

1. Create `infra\bootstrap\backend.tf` containing (use your `state_bucket` output):

   ```hcl
   terraform {
     backend "s3" {
       bucket       = "rajdurbar-tfstate-YOUR_ACCOUNT_ID"
       key          = "bootstrap/terraform.tfstate"
       region       = "eu-west-2"
       encrypt      = true
       use_lockfile = true
     }
   }
   ```

2. `terraform init -migrate-state` → answer `yes`.
3. Delete the local `terraform.tfstate` and `terraform.tfstate.backup` files.

## 7. Tell GitHub about AWS

In GitHub → `commitsByAddy/raj-durbar` → **Settings**:

1. **Secrets and variables → Actions → Variables** → add:
   - `AWS_REGION` = `eu-west-2`
   - `AWS_PLAN_ROLE_ARN` = `plan_role_arn` output
   - `AWS_DEPLOY_ROLE_ARN` = `deploy_role_arn` output
   - `TF_STATE_BUCKET` = `state_bucket` output

   These are **variables**, not secrets — they're only identifiers.
2. **Environments** → create `staging`, then `production`. For **both**:
   - **Deployment branches and tags** → *Selected branches and tags* → add `main` only.
     Without this, a pull request could claim the environment and get the deploy role.
   - On `production` also tick **Required reviewers** and add yourself. That's what stops
     anything, including an agent, deploying to production without your approval.

## 8. Staging (when the code is ready)

The staging Terraform (`infra/envs/staging`) creates the network, the database, the
container registry and the CloudFront site. The database starts charging as soon as it
exists, so we only apply it when the backend code is ready to deploy. To preview it
without creating anything:

```powershell
cd infra\envs\staging
Copy-Item backend.hcl.example backend.hcl   # put in your state bucket name
terraform init -backend-config=backend.hcl
terraform plan
```

---

### What's protected, and why

| Control | Stops |
|---|---|
| Root MFA, no root keys, Identity Center logins | stolen passwords / leaked long-lived keys |
| GitHub OIDC roles, no stored AWS keys | keys leaking from GitHub or a laptop |
| Deploy role usable only from GitHub environments; production needs your approval | unreviewed changes reaching production |
| Permissions boundary on pipeline-created roles | a compromised pipeline creating an admin role |
| Deploy role cannot touch CloudTrail, state bucket policy, or its own roles | covering tracks / disabling guardrails |
| Account-wide S3 public access block | accidentally public buckets |
| CloudTrail with log file validation | no record of who changed what |
| Budget alerts to two people | surprise bills |
| Environments locked to `main` | a pull request borrowing the deploy role |
| IAM Access Analyzer + email alert | a role or bucket quietly opened to an outside account |

**Known limit:** the deploy role can create app roles whose trust policy it writes.
The permissions boundary caps what those roles can do, and every change under `infra/`
is in the "always needs your approval" tier, so a human reviews any trust policy before
it is applied, and Access Analyzer emails you if one ever trusts an outside account.
