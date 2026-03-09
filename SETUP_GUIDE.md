# 🚀 StudyTrack Setup & Deployment Guide

This workspace is powered by **Google Gemini AI**. If you see "Demonstration Mode" or mock responses, follow these steps to enable full capabilities.

## 🔑 Environment Variables
You must set the following keys in your environment (local `.env` or Render/Vercel Dashboard):

| Variable            | Purpose                                  | Where to get it? |
|---------------------|------------------------------------------|-------------------|
| `GEMINI_API_KEY`     | Powers AI insights & task breakdowns     | [Google AI Studio](https://aistudio.google.com/) |
| `BREVO_API_KEY`      | Sends "Forgot Password" reset emails     | [Brevo dashboard](https://brevo.com/) |
| `MONGODB_URI`        | Your database connection string          | [MongoDB Atlas](https://mongodb.com/atlas) |
| `JWT_SECRET`         | Secures user authentication tokens       | Any long random string |

## 🛠️ Deployment Solve (Render)

If your **Render** build shows `injecting env (0) from .env`, it means Render is ignoring your variables because they aren't set in the dashboard.

1.  Go to your **Render Dashboard** → Select your Service.
2.  Click **Environment** in the left sidebar.
3.  Click **Add Environment Variable**.
4.  Add `GEMINI_API_KEY` with your key: `AIzaSyDYQAIB-Zc8sOT7D2bwWV3-lUgHy1OCYC4`.
5.  Click **Save Changes**. 
6.  The server will automatically restart and the AI will be live!

---

## 📅 Habit Builder: Full Month Tracking
The Habit Builder has been updated to show a **dynamic monthly calendar** (30/31 days) instead of a simple 7-day view. 
- **Auto-Month Detection:** The tracker automatically detects the current month and its start day.
- **Streak Tracking:** Keep your streak alive to see the 🔥 "Flame" icon!

---

💡 **Project Structure:**
- `/frontend`: Vite + React + Tailwind + Lucide Icons
- `/routes/ai.js`: Central AI controller with Gemini integration.
