# 🔍 TruthLens

**AI answers you can actually trust — or at least understand when not to.**

TruthLens is an AI hallucination detection tool with a stunning modern UI that automatically verifies AI-generated answers against recent web sources and highlights potentially hallucinated, outdated, or unsupported claims.

![TruthLens Demo](https://img.shields.io/badge/Status-Live-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![Python](https://img.shields.io/badge/Python-3.8+-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black)

---

## ✨ Features

### 🎨 Modern UI
- **Glassmorphic design** with animated gradients
- **Smooth animations** powered by Framer Motion
- **Fully responsive** and mobile-friendly
- **Interactive components** with real-time feedback

### 🔍 Smart Verification
- **Claim-by-claim analysis** of AI responses
- **Web source verification** using real-time search
- **Confidence scoring** (0-100%)
- **Status categorization**: Verified, Uncertain, Outdated, Unsupported, Contradicted

### 🚀 Modern Tech Stack
- **Backend**: FastAPI (Python) - Fast, async REST API
- **Frontend**: Next.js 15 + React + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **LLM**: Perplexity, OpenAI, or Grok
- **Search**: DuckDuckGo or SerpAPI

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
pip install -r requirements-api.txt

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file:

```env
LLM_PROVIDER=perplexity
PERPLEXITY_API_KEY=your_key_here
SEARCH_PROVIDER=duckduckgo
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Launch

**Option A - Automatic (Recommended):**
```bash
python start.py
```

**Option B - Manual:**
```bash
# Terminal 1 - Backend
uvicorn api:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Access

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎯 How It Works

```
User Question
    ↓
LLM Generation → AI Answer
    ↓
Web Search → Recent Sources
    ↓
Verification → Claim Analysis
    ↓
UI Display → Confidence Score + Breakdown
```

### Confidence Scoring

Starting at 100%, we subtract:
- **-5** for each uncertain claim
- **-15** for each outdated claim
- **-20** for each unsupported claim
- **-30** for each contradicted claim

---

## 📊 Architecture

```
┌─────────────────┐
│   Next.js UI    │  ← http://localhost:3000
│   (Frontend)    │     Modern React interface
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│   FastAPI       │  ← http://localhost:8000
│   (Backend)     │     Python verification logic
└─────────────────┘
         │
         ├─→ LLM (Perplexity/OpenAI/Grok)
         └─→ Search (DuckDuckGo/SerpAPI)
```

---

## 🎨 UI Components

### Hallucination Meter
Large, animated confidence score with color-coded risk levels:
- 🟢 **Green** (80-100%): High confidence
- 🟡 **Yellow** (50-79%): Medium confidence
- 🔴 **Red** (0-49%): Low confidence

### Claim Cards
Interactive cards showing:
- ✅ Verified claims (green)
- ⚠️ Uncertain claims (yellow)
- 🕐 Outdated information (orange)
- ❓ Unsupported claims (purple)
- ❌ Contradicted claims (red)

### Source Panel
Clickable source cards with:
- Title and snippet
- Direct links to sources
- Numbered references

---

## 🔌 API Endpoints

### `POST /api/verify`
Generate and verify an AI answer

```json
{
  "question": "What are the best AI frameworks in 2025?"
}
```

### `POST /api/verify-existing`
Verify an existing answer

```json
{
  "question": "...",
  "answer": "..."
}
```

### `GET /health`
Check API health and configuration

### `GET /api/config`
Get current LLM and search configuration

**Interactive Docs**: http://localhost:8000/docs

---

## 🎯 Example Use Cases

### Tech Research
"What are the latest trends in AI development?"
- Verify current frameworks and tools
- Flag outdated information
- Show recent sources

### Current Events
"What happened at the latest tech conference?"
- Verify event details
- Check dates and facts
- Link to news sources

### Comparisons
"Compare React vs Vue performance in 2025"
- Verify benchmark claims
- Flag speculative statements
- Show supporting evidence

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend | FastAPI | REST API |
| Frontend | Next.js 15 | React UI |
| Styling | Tailwind CSS | Design system |
| Animations | Framer Motion | Smooth transitions |
| Icons | Lucide React | Beautiful icons |
| LLM | Perplexity/OpenAI/Grok | Answer generation |
| Search | DuckDuckGo/SerpAPI | Web verification |
| Types | TypeScript | Type safety |

---

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Adjust Animations
Modify Framer Motion props in components:
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
```

### Update Gradients
Change in `frontend/app/page.tsx`:
```tsx
className="bg-gradient-to-br from-blue-900 to-purple-900"
```

---

## 🚢 Deployment

### Backend (Railway/Render/Fly.io)
```bash
pip install -r requirements-api.txt
uvicorn api:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel - Recommended)
1. Connect GitHub repo
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically

---

## 📚 Documentation

- **`SETUP_GUIDE.md`** - Detailed installation guide
- **`MIGRATION_SUMMARY.md`** - Architecture overview
- **`QUICK_START.txt`** - Essential commands
- **`ENV_TEMPLATE.txt`** - Environment configuration

---

## ⚠️ Limitations

### Not a Truth Machine
- Estimates confidence, doesn't guarantee truth
- Depends on available web sources
- Recent events may have limited coverage

### Source Quality
- Web search results vary in quality
- Not all claims can be verified online
- Sources may be contradictory

### LLM Limitations
- Verifier LLM can make mistakes
- JSON parsing may occasionally fail
- Context length limits detailed analysis

**Goal**: Help users make informed decisions through transparency

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Add more LLM providers (Anthropic, etc.)
- [ ] Implement caching (Redis)
- [ ] Add user authentication
- [ ] Export results (PDF/JSON)
- [ ] Multi-language support
- [ ] Browser extension
- [ ] Mobile app

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

Built with:
- FastAPI for modern Python APIs
- Next.js for amazing React DX
- Tailwind CSS for rapid styling
- Framer Motion for beautiful animations
- OpenAI/Perplexity for LLM capabilities
- DuckDuckGo for free web search

---

## 📧 Contact

For questions, feedback, or collaboration:
- **Project**: TruthLens
- **Purpose**: Making AI hallucinations visible
- **Status**: Production-ready MVP

---

## 🎉 Why TruthLens?

In an age of AI-generated content, **transparency is trust**.

TruthLens doesn't claim to eliminate hallucinations—it makes them **visible, understandable, and actionable** through a beautiful, modern interface.

Because sometimes, knowing what you *don't* know is just as important as knowing what you do.

---

**Built with ❤️ for the AI community**

*"Trust, but verify" — now with a stunning UI.*
