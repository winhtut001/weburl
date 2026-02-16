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

## Deploy to Railway

1. Push this project to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repository
4. Railway will auto-detect and deploy (uses Node.js + `serve`)
5. Your app will be live at a `*.railway.app` URL

No build step required — it serves the static files directly.
