# DailyCalorieAITracker

Voice-powered calorie tracker. Record meals by speaking → Whisper transcribes → Claude estimates calories → daily graph.

## Stack
- **Frontend**: React + Vite → Vercel
- **Backend**: Node.js + Express → Railway (Docker)
- **Database**: PostgreSQL (Railway add-on)
- **AI**: OpenAI Whisper (voice → text) + Claude Sonnet (text → calories)

---

## Local Development

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- OpenAI API key
- Anthropic API key

### 1. Clone and set up env vars

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in OPENAI_API_KEY and ANTHROPIC_API_KEY
```

### 2. Start backend + database

```bash
docker compose up --build
```

Backend runs on `http://localhost:3001`. DB runs on `localhost:5432`.

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. Vite proxies `/api` → backend automatically.

### 4. Open the app

Go to `http://localhost:5173`, create a profile, and start recording meals.

---

## API Reference

```
GET  /health
POST /api/v1/users
GET  /api/v1/users
GET  /api/v1/users/:id
PUT  /api/v1/users/:id

POST /api/v1/meals/record        multipart: { audio, userId, mealType, date? }
GET  /api/v1/meals               ?userId=&date=
GET  /api/v1/meals/summary       ?userId=&days=7
PUT  /api/v1/meals/:id
DELETE /api/v1/meals/:id
```

---

## Deployment

### Backend → Railway

1. Push code to GitHub
2. Create new project on [railway.app](https://railway.app)
3. **Add service** → "Deploy from GitHub repo" → select `backend/` folder
4. **Add plugin** → PostgreSQL (Railway sets `DATABASE_URL` automatically)
5. Set environment variables:
   ```
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
6. Railway auto-deploys on every push to main

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Set environment variable:
   ```
   VITE_API_URL=https://your-railway-backend.railway.app
   ```
4. Deploy — Vercel auto-deploys on push to main

---

## Project Structure

```
DailyCalorieAITracker/
├── frontend/                    React + Vite
│   ├── src/
│   │   ├── api/client.js        API calls (axios)
│   │   ├── components/
│   │   │   ├── VoiceRecorder.jsx
│   │   │   ├── MealCard.jsx
│   │   │   ├── CalorieChart.jsx
│   │   │   └── DailySummary.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx
│   │   └── App.jsx
│   ├── Dockerfile
│   └── vercel.json
│
├── backend/                     Node.js + Express
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── meals.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   ├── whisper.js
│   │   │   ├── claude.js
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── logger.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.js
│   │   └── db/schema.sql
│   ├── Dockerfile
│   └── railway.toml
│
└── docker-compose.yml
```

---

## Scale Path

| Stage | Infrastructure |
|---|---|
| MVP (now) | Vercel + Railway free tier |
| Growing | Render + Railway Pro or single EC2 |
| Scale | ECS Fargate + RDS |
| Large | EKS + RDS Multi-AZ + CloudFront |
