# ?? Quick Start - Automated Deployment

## Setup in 5 Minutes

### 1?? Prerequisites
- ? GitHub account
- ? Render.com account (free tier)
- ? Repository forked/cloned

### 2?? Run Setup Script
```bash
chmod +x scripts/setup-deployment.sh
./scripts/setup-deployment.sh
```

The script will guide you through:
- Creating Render account
- Getting API credentials
- Setting up GitHub secrets
- Testing deployment

### 3?? Deploy
```bash
git add .
git commit -m "Deploy to production"
git push origin master
```

**That's it!** GitHub Actions will automatically deploy your application.

---

## ?? Monitor Deployment

### GitHub Actions
```
https://github.com/alexp404/Scottish-Inn/actions
```

### Render Dashboard
```
https://dashboard.render.com
```

---

## ?? Live URLs

After deployment completes (5-10 minutes):

- **Frontend**: https://scottish-inn-frontend.onrender.com
- **Backend**: https://scottish-inn-backend.onrender.com
- **Health Check**: https://scottish-inn-backend.onrender.com/api/health

---

## ?? Manual Deployment

If you need to deploy manually:

```bash
# Set up environment
source .env.deployment

# Run deployment script
./scripts/deploy.sh
```

---

## ?? Full Documentation

For detailed deployment instructions, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [render.yaml](./render.yaml) - Render configuration
- [.github/workflows/ci.yml](./.github/workflows/ci.yml) - CI/CD pipeline

---

## ?? Troubleshooting

### Build fails?
```bash
# Test locally first
cd backend && npm run build
cd frontend && npm run build
```

### Deployment not triggered?
- Check GitHub Actions tab
- Verify secrets are set correctly
- Ensure you pushed to `master` branch

### Service not responding?
- Check Render dashboard logs
- Verify environment variables
- Check health endpoint

---

## ?? What Gets Deployed

```
GitHub Repository (master branch)
    ?
GitHub Actions
    ??? Build Backend
    ??? Test Backend
    ??? Build Frontend
    ??? Test Frontend
    ?
Render (via API)
    ??? Backend Service (Node.js)
    ??? Frontend Service (Static)
    ??? Database (PostgreSQL)
    ?
Live Application ??
```

---

## ?? Tips

- **First deployment**: Takes 5-10 minutes
- **Subsequent deploys**: 2-3 minutes
- **Free tier**: Services sleep after 15 min inactivity
- **Wakeup time**: ~30 seconds

---

## ?? Contact

Need help?
- **Issues**: https://github.com/alexp404/Scottish-Inn/issues
- **Email**: support@scottishinn1960.com
- **Phone**: (281) 821-9900
