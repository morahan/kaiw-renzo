import { useState, useEffect } from 'react'
import './App.css'

// Recent articles data - in production this would come from an API
const recentArticles = [
  {
    title: "The Exercise Variety Effect: Why Doing Just One Type of Workout Is Cutting Your Lifespan Short",
    date: "2026-02-19",
    words: 1069,
    status: "Published"
  },
  {
    title: "Altitude Masks Are a Scam — But Real Hypoxic Training Changes Everything",
    date: "2026-02-18",
    words: 1247,
    status: "Published"
  },
  {
    title: "Fascia: The Forgotten Tissue That Explains Why You're Stiff, Sore, and Stuck",
    date: "2026-02-18",
    words: 1208,
    status: "Published"
  },
  {
    title: "Heart Rate Variability: The Hidden Fitness Metric That Predicts Your Health",
    date: "2026-02-17",
    words: 1241,
    status: "Published"
  },
  {
    title: "Forget Lifespan — Your Musclespan Determines How Well You Age",
    date: "2026-02-17",
    words: 1381,
    status: "Published"
  }
]

const metrics = {
  totalArticles: 24,
  currentStreak: 18,
  totalWords: 28450,
  avgWordsPerArticle: 1185,
  topCategory: "Longevity",
  lastArticleDate: "2026-02-19"
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const hour = currentTime.getHours()
  const getGreeting = () => {
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="app">
      <div 
        className="gradient-orb"
        style={{
          left: mousePos.x * 0.02,
          top: mousePos.y * 0.02
        }}
      />
      
      <header className="header">
        <div className="logo">
          <span className="logo-icon">✍️</span>
          <span className="logo-text">RENZO</span>
        </div>
        <div className="timestamp">
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <h1 className="hero-title">
            {getGreeting()}, Michael.
          </h1>
          <p className="hero-subtitle">
            Content engine firing. Science-backed. Never boring. 
            <span className="accent"> Ship or shut up.</span>
          </p>
        </section>

        <section className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-value">{metrics.totalArticles}</div>
            <div className="metric-label">Articles Shipped</div>
            <div className="metric-trend">📈 +3 this week</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.currentStreak}</div>
            <div className="metric-label">Day Streak</div>
            <div className="metric-trend">🔥 Never missed</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{(metrics.totalWords / 1000).toFixed(1)}k</div>
            <div className="metric-label">Words Written</div>
            <div className="metric-trend">🎯 {metrics.avgWordsPerArticle} avg</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{metrics.topCategory}</div>
            <div className="metric-label">Hot Topic</div>
            <div className="metric-trend">🧬 Longevity wins</div>
          </div>
        </section>

        <section className="feed-section">
          <h2 className="section-title">
            <span className="section-icon">📡</span>
            Recent Articles
          </h2>
          <div className="articles-list">
            {recentArticles.map((article, index) => (
              <div key={index} className="article-card">
                <div className="article-status">
                  <span className="status-dot"></span>
                  {article.status}
                </div>
                <h3 className="article-title">{article.title}</h3>
                <div className="article-meta">
                  <span className="article-date">{article.date}</span>
                  <span className="article-words">{article.words.toLocaleString()} words</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="status-bar">
          <div className="status-item">
            <span className="status-indicator online"></span>
            <span>Ready to write</span>
          </div>
          <div className="status-item">
            <span className="status-indicator model"></span>
            <span>Model: MiniMax M2.5</span>
          </div>
          <div className="status-item">
            <span className="status-indicator time"></span>
            <span>Last activity: {metrics.lastArticleDate}</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built by Renzo • Workout Flow Content Engine</p>
      </footer>
    </div>
  )
}

export default App
