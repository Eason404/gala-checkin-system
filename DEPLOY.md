# Firebase CI/CD Setup 🚀

Automated deployment is configured via GitHub Actions. Here's how it works and how to set it up.

## Setup: GitHub Secret

1. Generate a Firebase CI token:
   ```bash
   firebase login:ci
   ```
2. Add the token to GitHub:
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions**.
   - Click **New repository secret**.
   - **Name**: `FIREBASE_TOKEN`
   - **Value**: Paste the token.

## Deployment Workflow

| Trigger | Action |
| :--- | :--- |
| Push to `main` | Automatic deploy to production (live site) |
| Pull Request | Preview URL generated for testing |
| Manual | Run `npm run build && firebase deploy` locally |

> **Note:** The `ci-cd-test` branch is used for testing CI/CD changes before merging to `main`.
