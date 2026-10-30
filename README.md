# Raj Durbar website

Indian & Nepalese restaurant website with online table booking.

| Part | Tech | Folder |
|---|---|---|
| Website | Astro + React | `web/` (coming next) |
| Booking API | Spring Boot 3, Java 21, Postgres | `api/` (coming next) |
| Infrastructure | Terraform on AWS, London (eu-west-2) | `infra/` |
| Docs | Setup guides and decisions | `docs/` |

## Infrastructure layout

```
infra/
  bootstrap/        one-time account setup: state bucket, CloudTrail, budgets,
                    GitHub OIDC roles + permissions boundary (run from a laptop)
  modules/
    network/        VPC, public subnets (app), private subnets (database), no NAT
    database/       RDS Postgres, private, encrypted, TLS-only, managed password
    ecr/            container registry, immutable tags, scan on push
    web/            private S3 + CloudFront, security headers, /api routing
  envs/
    staging/        wires the modules together for staging
```

Start with **[docs/aws-setup.md](docs/aws-setup.md)**.

## Ground rules

- No AWS access keys anywhere. People use IAM Identity Center; GitHub uses OIDC.
- Everything under `infra/` needs a human review before it is applied.
- Production deploys need approval in the GitHub `production` environment.
