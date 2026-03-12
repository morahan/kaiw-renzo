import { useState, useEffect, useRef } from 'react'
import './App.css'

// Recent articles data
const recentArticles = [
  {
    title: "The Exercise Variety Effect: Why Doing Just One Type of Workout Is Cutting Your Lifespan Short",
    date: "2026-02-19",
    words: 1069,
    status: "Published",
    category: "Longevity",
    engagement: 8.2,
    reads: 12450
  },
  {
    title: "Altitude Masks Are a Scam — But Real Hypoxic Training Changes Everything",
    date: "2026-02-18",
    words: 1247,
    status: "Published",
    category: "Training",
    engagement: 9.1,
    reads: 18200
  },
  {
    title: "Fascia: The Forgotten Tissue That Explains Why You're Stiff, Sore, and Stuck",
    date: "2026-02-18",
    words: 1208,
    status: "Published",
    category: "Science",
    engagement: 7.8,
    reads: 9800
  },
  {
    title: "Heart Rate Variability: The Hidden Fitness Metric That Predicts Your Health",
    date: "2026-02-17",
    words: 1241,
    status: "Published",
    category: "Metrics",
    engagement: 8.5,
    reads: 14300
  },
  {
    title: "Forget Lifespan — Your Musclespan Determines How Well You Age",
    date: "2026-02-17",
    words: 1381,
    status: "Published",
    category: "Longevity",
    engagement: 9.4,
    reads: 21500
  },
  {
    title: "Why Zone 2 Training Is Overrated (And What Actually Works)",
    date: "2026-02-16",
    words: 1156,
    status: "Published",
    category: "Training",
    engagement: 8.9,
    reads: 16700
  }
]

const metrics = {
  totalArticles: 24,
  currentStreak: 18,
  totalWords: 28450,
  avgWordsPerArticle: 1185,
  topCategory: "Longevity",
  lastArticleDate: "2026-02-19",
  publishedThisMonth: 8,
  topPerformer: "Musclespan",
  totalReads: 142000,
  avgEngagement: 8.6
}

const trendingTopics = [
  { topic: "Muscle protein synthesis", momentum: 94, status: "hot" },
  { topic: "Chronobiology & training", momentum: 87, status: "rising" },
  { topic: "Metabolic flexibility", momentum: 82, status: "rising" },
  { topic: "Sarcopenia prevention", momentum: 76, status: "steady" },
  { topic: "Mitochondrial biogenesis", momentum: 71, status: "steady" }
]

const categoryColors = {
  "Longevity": "#a855f7",
  "Training": "#3b82f6",
  "Science": "#22c55e",
  "Metrics": "#f97316",
  "Recovery": "#ec4899"
}

const tips = [
  "Paradox Open hooks convert 3x better than questions",
  "Myth-busting articles hit 10/10 virality",
  "First sentence must work as a standalone tweet",
  "Specific mechanisms beat generic advice",
  "Lead with the controversial take, then back it up"
]

const quickActions = [
  { label: "New Article", icon: "✍️", action: "new", shortcut: "N" },
  { label: "Check Trends", icon: "🔥", action: "trends", shortcut: "T" },
  { label: "View Analytics", icon: "📊", action: "analytics", shortcut: "A" },
  { label: "Voice Brief", icon: "🎙️", action: "voice", shortcut: "V" }
]

// Animated Counter Component
function AnimatedCounter({ end, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, isVisible])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeTip, setActiveTip] = useState(0)
  const [writingPulse, setWritingPulse] = useState(false)
  const [expandedArticle, setExpandedArticle] = useState(null)
  const [showActions, setShowActions] = useState(false)
  const [hoveredMetric, setHoveredMetric] = useState(null)

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

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tips.length)
    }, 5000)
    return () => clearInterval(tipTimer)
  }, [])

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setWritingPulse(prev => !prev)
    }, 1500)
    return () => clearInterval(pulseTimer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const key = e.key.toUpperCase()
      if (key === 'N') setShowActions(true)
      if (key === 'ESCAPE') setShowActions(false)
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const hour = currentTime.getHours()
  const getGreeting = () => {
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getEngagementColor = (engagement) => {
    if (engagement >= 9) return '#22c55e'
    if (engagement >= 8) return '#3b82f6'
    if (engagement >= 7) return '#f97316'
    return '#a1a1aa'
  }

  const getMomentumColor = (momentum) => {
    if (momentum >= 90) return '#ef4444'
    if (momentum >= 80) return '#f97316'
    if (momentum >= 70) return '#22c55e'
    return '#a1a1aa'
  }

  const toggleArticle = (index) => {
    setExpandedArticle(expandedArticle === index ? null : index)
  }

  return (
    <div className="app">
      <div 
        className="gradient-orb"
        style={{
          left: mousePos.x * 0.015,
          top: mousePos.y * 0.015
        }}
      />
      <div className="gradient-orb secondary"
        style={{
          right: mousePos.x * 0.01,
          bottom: mousePos.y * 0.01
        }}
      />
      
      <header className="header">
        <div className="logo">
          <span className="logo-icon">✍️</span>
          <span className="logo-text">RENZO</span>
          <span className="logo-badge">v2.1</span>
        </div>
        <div className="header-right">
          <div className="tip-banner">
            <span className="tip-icon">💡</span>
            <span className="tip-text">{tips[activeTip]}</span>
          </div>
          <div className="timestamp">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              {getGreeting()}, Michael.
            </h1>
            <p className="hero-subtitle">
              Content engine firing. Science-backed. Never boring. 
              <span className="accent"> Ship or shut up.</span>
            </p>
          </div>
          <div className="hero-status">
            <div className={`writing-indicator ${writingPulse ? 'active' : ''}`}>
              <span className="writing-dot"></span>
              <span className="writing-text">Ready to create</span>
            </div>
          </div>
        </section>

        {/* Quick Actions Panel */}
        <section className="quick-actions">
          <div className="actions-header">
            <span className="actions-title">Quick Actions</span>
            <span className="actions-hint">Press N</span>
          </div>
          <div className="actions-grid">
            {quickActions.map((action, i) => (
              <button 
                key={i} 
                className="action-btn"
                onClick={() => setShowActions(!showActions)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
                <span className="action-shortcut">{action.shortcut}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="metrics-grid">
          <div 
            className="metric-card primary"
            onMouseEnter={() => setHoveredMetric('articles')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <div className="metric-icon">📄</div>
            <div className="metric-value">
              <AnimatedCounter end={metrics.totalArticles} />
            </div>
            <div className="metric-label">Articles Shipped</div>
            <div className="metric-trend positive">
              ↑ {metrics.publishedThisMonth} this month
            </div>
            {hoveredMetric === 'articles' && (
              <div className="metric-tooltip">+3 from last month</div>
            )}
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔥</div>
            <div className="metric-value">
              <AnimatedCounter end={metrics.currentStreak} />
            </div>
            <div className="metric-label">Day Streak</div>
            <div className="metric-trend">Never missed a day</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-value">
              <AnimatedCounter end={Math.round(metrics.totalWords / 1000)} suffix="k" />
            </div>
            <div className="metric-label">Words Written</div>
            <div className="metric-trend">🎯 {metrics.avgWordsPerArticle} avg</div>
          </div>
          <div className="metric-card accent-card">
            <div className="metric-icon">👁️</div>
            <div className="metric-value">
              <AnimatedCounter end={Math.round(metrics.totalReads / 1000)} suffix="k" />
            </div>
            <div className="metric-label">Total Reads</div>
            <div className="metric-trend">📈 {metrics.avgEngagement}/10 avg</div>
          </div>
        </section>

        {/* Trending Topics */}
        <section className="trending-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🔥</span>
              Trending Topics
            </h2>
            <span className="article-count">AI-ranked</span>
          </div>
          <div className="trending-list">
            {trendingTopics.map((item, i) => (
              <div key={i} className="trending-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="trending-rank">#{i + 1}</div>
                <div className="trending-content">
                  <span className="trending-topic">{item.topic}</span>
                  <div className="trending-meta">
                    <span 
                      className="trending-status"
                      style={{ color: getMomentumColor(item.momentum) }}
                    >
                      {item.status}
                    </span>
                    <div className="momentum-bar">
                      <div 
                        className="momentum-fill"
                        style={{ 
                          width: `${item.momentum}%`,
                          background: `linear-gradient(90deg, ${getMomentumColor(item.momentum)}, transparent)`
                        }}
                      />
                    </div>
                    <span className="momentum-value">{item.momentum}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="feed-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📡</span>
              Recent Articles
            </h2>
            <span className="article-count">{recentArticles.length} published</span>
          </div>
          <div className="articles-list">
            {recentArticles.map((article, index) => (
              <div 
                key={index} 
                className={`article-card ${expandedArticle === index ? 'expanded' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => toggleArticle(index)}
              >
                <div className="article-header">
                  <div className="article-status">
                    <span className="status-dot"></span>
                    {article.status}
                  </div>
                  <div className="article-right">
                    <span 
                      className="engagement-badge"
                      style={{ 
                        background: `${getEngagementColor(article.engagement)}20`,
                        color: getEngagementColor(article.engagement)
                      }}
                    >
                      {article.engagement}/10
                    </span>
                    <span 
                      className="article-category"
                      style={{ color: categoryColors[article.category] || '#a1a1aa' }}
                    >
                      {article.category}
                    </span>
                  </div>
                </div>
                <h3 className="article-title">{article.title}</h3>
                <div className="article-meta">
                  <span className="article-date">{formatDate(article.date)}</span>
                  <span className="article-divider">•</span>
                  <span className="article-words">{article.words.toLocaleString()} words</span>
                  <span className="article-divider">•</span>
                  <span className="article-read-time">{Math.ceil(article.words / 200)} min</span>
                  <span className="article-divider">•</span>
                  <span className="article-reads">{article.reads.toLocaleString()} reads</span>
                </div>
                
                {/* Expanded Content */}
                {expandedArticle === index && (
                  <div className="article-expanded">
                    <div className="expanded-stats">
                      <div className="expanded-stat">
                        <span className="expanded-label">Engagement</span>
                        <span className="expanded-value" style={{ color: getEngagementColor(article.engagement) }}>
                          {article.engagement}/10
                        </span>
                      </div>
                      <div className="expanded-stat">
                        <span className="expanded-label">Total Reads</span>
                        <span className="expanded-value">{article.reads.toLocaleString()}</span>
                      </div>
                      <div className="expanded-stat">
                        <span className="expanded-label">Est. Shares</span>
                        <span className="expanded-value">{Math.round(article.reads * 0.12).toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="view-btn">View Full Analytics →</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="quick-stats">
          <div className="stat-pill">
            <span className="stat-label">Model</span>
            <span className="stat-value">MiniMax M2.5</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Voice</span>
            <span className="stat-value">Ryan (1.0x)</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Last Write</span>
            <span className="stat-value">{formatDate(metrics.lastArticleDate)}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Pipeline</span>
            <span className="stat-value status-online">Active</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Top Category</span>
            <span className="stat-value" style={{ color: categoryColors[metrics.topCategory] }}>
              {metrics.topCategory}
            </span>
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
            <span>Last activity: {formatDate(metrics.lastArticleDate)}</span>
          </div>
          <div className="status-item">
            <span className="status-indicator streak"></span>
            <span>🔥 {metrics.currentStreak} day streak</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built by Renzo • Workout Flow Content Engine</p>
        <p className="footer-version">v2.1 • Press N for quick actions</p>
      </footer>
    </div>
  )
}

export default App
