# Firebase CI/CD Manual Setup Steps 🚀

I've created the configuration files, but there are **two final manual steps** you need to perform in the GitHub UI to enable the automated deployment.

### 1. Set up your GitHub Secret (Token Method)
This is the most reliable method and avoids complex permission errors.
1. Done! You already ran `firebase login:ci` and got the token.
2. **Add to GitHub**:
   - Go to your repository on GitHub.
   - Click **Settings** (top bar).
   - Click **Secrets and variables** (left sidebar) -> **Actions**.
   - Click **New repository secret** (the green button).
   - **Name**: `FIREBASE_TOKEN`
   - **Value**: Paste the long token you just generated.

### 2. (Optional) Service Account Method
*Ignore this unless you specifically need advanced Cloud IAM features. The token method above is enough for deployment.*

---

## How to use this from now on:
- **Automatic**: Every time you `git push` to `main`, it will deploy to the live site.
- **Preview**: Every Pull Request will automatically get a "Preview URL" so you can test changes before merging.
- **Manual**: You can still run `npm run build && firebase deploy` locally if you have the Firebase CLI installed and logged in.
