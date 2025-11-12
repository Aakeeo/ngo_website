# Deploying RWT Website to Render

## Quick Deploy (Recommended Method)

### Step 1: Push to GitHub

```bash
cd /mnt/c/Users/Jasir/downloads/socialsocietywebsite

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - RWT website"

# Add your GitHub repository (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/rwt-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com
2. Sign up or log in
3. Click **"New +"** → **"Static Site"**
4. Connect your GitHub account
5. Select your repository
6. Configure:
   - **Name:** rwt-website
   - **Branch:** main
   - **Build Command:** (leave empty)
   - **Publish Directory:** `.`
7. Click **"Create Static Site"**

**Done!** Your site will be live at: `https://rwt-website.onrender.com`

---

## Alternative: Manual Deploy

If you prefer not to use GitHub:

1. Create a ZIP file of your project
2. Use Render's manual upload feature
3. Or use their CLI tool

---

## Custom Domain (Optional)

To use your own domain (e.g., www.rwt.org):

1. In Render dashboard, go to your site settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update your domain's DNS records with the provided values
5. Wait for DNS propagation (can take up to 48 hours)

---

## Files Created for Deployment

- `package.json` - Project metadata
- `render.yaml` - Render configuration
- `.gitignore` - Files to exclude from Git

---

## Post-Deployment

After deployment:
- Test all links and navigation
- Verify mobile responsiveness
- Check image loading
- Test contact forms/WhatsApp links
- Share the URL!

---

## Troubleshooting

**Issue:** Site not loading
- Check publish directory is set to `.` (root)
- Ensure index.html is in the root directory

**Issue:** Images not showing
- Verify image paths are relative (e.g., `assets/gallery/image1.jpeg`)
- Check image files are committed to Git

**Issue:** Slow loading
- Render's free tier may have slower initial load
- Consider upgrading to paid tier for better performance

---

## Support

For Render support: https://render.com/docs
For website issues: Check the README.md file
