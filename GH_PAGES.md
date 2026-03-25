# GitHub Pages Deployment

This repository is configured to automatically deploy the built frontend to GitHub Pages.

## Setup Instructions

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository: `https://github.com/jseguillon/vibes5`
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: `main` (or `develop`)
   - Folder: `/ (root)`

### 2. Configure Custom Domain (Optional)

If you want to use a custom domain:
1. Add a CNAME file to the root of your repository
2. Configure DNS records at your domain provider

## Deployment Workflow

The workflow `deploy-gh-pages.yml` will:

1. **Build**: Run `npm run build` to create the production build
2. **Deploy**: Upload to GitHub Pages automatically

### Manual Trigger

You can manually trigger the deployment:
1. Go to **Actions** → **Deploy to GitHub Pages**
2. Click **Run workflow**
3. Select branch and click **Run workflow**

## Access Your Game

After deployment, your game will be available at:
```
https://jseguillon.github.io/vibes5/
```

## Workflow Triggers

- **Automatic**: On push to `main` or `develop` branches
- **Manual**: Via workflow dispatch (Actions tab)

## Notes

- The build artifact is uploaded as GitHub Pages content
- GitHub Pages serves static files from the `/dist` folder
- No server-side code is needed (pure static HTML/JS/CSS)
