# Link Organizer

A personal URL collection app with password protection. Add, edit, and organize your links (especially Google Drive links) in one place.

## Features

- Add, edit, delete links
- Organize by collections (Content, Quizzes, Lab Documents, Lab Videos, custom)
- Password protection
- Search
- Data saved in browser (localStorage)

## Local development

```bash
npm install
npm start
```

Open http://localhost:3000

## Deploy to Netlify (recommended)

1. Push to GitHub (already done)
2. Go to [netlify.com](https://netlify.com) → Sign in with GitHub
3. **Add new site** → **Import an existing project** → **GitHub**
4. Select **winhtut001/weburl**
5. Settings (Netlify auto-detects from netlify.toml):
   - Build command: `echo 'No build needed'` (or leave empty)
   - Publish directory: `.` (root)
6. Click **Deploy**
7. Your app will be live at `*.netlify.app`

## Deploy to Railway

1. Go to [railway.app](https://railway.app) → Deploy from GitHub
2. Select **winhtut001/weburl**
3. Generate a domain in Settings → Networking
