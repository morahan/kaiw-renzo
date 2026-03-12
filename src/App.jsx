import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'

// Virality Score Calculator
function ViralityCalculator({ onClose }) {
  const [headline, setHeadline] = useState('')
  const [score, setScore] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeHeadline = (text) => {
    setAnalyzing(true)
    setTimeout(() => {
      let points = 0
      const lower = text.toLowerCase()
      
      // Myth-busting triggers
      if (lower.includes('myth') || lower.includes('scam') || lower.includes('wrong') || lower.includes('lie')) points += 25
      // Numbers and stats
      if (/\d+%/.test(text)) points += 20
      if (/\d+/.test(text) && !/\d+%/.test(text)) points += 10
      // Power words
      if (/\b(shocking|secret|hidden|truth|actually|really)\b/.test(lower)) points += 15
      // Questions
      if (text.includes('?')) points += 10
      // Comparison
      if (/\b(vs|versus|beats|better than)\b/.test(lower)) points += 20
      // Negative/controversial
      if (/\b(overrated|failed|bad|waste)\b/.test(lower)) points += 15
      // "What nobody tells you" style
      if (/\b(nobody|never|always)\b/.test(lower)) points += 10
      
      points = Math.min(points, 100)
      setScore(points)
      setAnalyzing(false)
    }, 600)
  }

  const getScoreColor = (s) => {
    if (s >= 80) return '#22c55e'
    if (s >= 60) return '#3b82f6'
    if (s >= 40) return '#f97316'
    return '#ef4444'
  }

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Viral Potential'
    if (s >= 60) return 'Strong'
    if (s >= 40) return 'Average'
    return 'Needs Work'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content virality-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎯 Virality Calculator</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="virality-form">
          <label>Test your headline</label>
          <input
            type="text"
            placeholder="e.g., 'Zone 2 training is a scam — here's what actually works'"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && headline && analyzeHeadline(headline)}
            autoFocus
          />
          <button 
            className="virality-analyze" 
            onClick={() => analyzeHeadline(headline)}
            disabled={!headline || analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {score !== null && (
          <div className="virality-result">
            <div className="virality-score-ring" style={{ '--score-color': getScoreColor(score) }}>
              <svg viewBox="0 0 100 100">
                <circle className="score-bg" cx="50" cy="50" r="45" />
                <circle 
                  className="score-fill" 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  style={{ strokeDashoffset: 283 - (283 * score / 100) }}
                />
              </svg>
              <div className="score-text">
                <span className="score-number">{score}</span>
                <span className="score-label">{getScoreLabel(score)}</span>
              </div>
            </div>
            <div className="virality-tips">
              {score < 60 && <p>💡 Try adding numbers, power words, or a controversial take</p>}
              {score >= 60 && score < 80 && <p>🔥 Solid headline! Could be punchier</p>}
              {score >= 80 && <p>🚀 This one has viral potential!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Energy Meter Component
function EnergyMeter({ level, setLevel }) {
  const [isDragging, setIsDragging] = useState(false)
  
  const getEnergyColor = (l) => {
    if (l >= 80) return '#22c55e'
    if (l >= 50) return '#f97316'
    return '#ef4444'
  }

  const getEnergyEmoji = (l) => {
    if (l >= 80) return '⚡'
    if (l >= 50) return '🔥'
    return '🔋'
  }

  return (
    <div className="energy-meter" onClick={() => setLevel(isDragging ? level : level === 100 ? 20 : Math.min(level + 20, 100))}>
      <div className="energy-icon">{getEnergyEmoji(level)}</div>
      <div className="energy-bar-wrap">
        <div 
          className="energy-bar-fill"
          style={{ 
            width: `${level}%`,
            background: `linear-gradient(90deg, ${getEnergyColor(level)}, ${getEnergyColor(level)}80)`
          }}
        />
      </div>
      <span className="energy-value">{level}%</span>
    </div>
  )
}

// Command Palette Component
function CommandPalette({ isOpen, onClose, onAction }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  const commands = [
    { id: 'new', label: 'New Draft', icon: '📝', shortcut: 'D', category: 'Create' },
    { id: 'prompt', label: 'Random Prompt', icon: '💡', shortcut: 'P', category: 'Create' },
    { id: 'trends', label: 'View Trends', icon: '🔥', shortcut: 'T', category: 'Research' },
    { id: 'analytics', label: 'Analytics', icon: '📊', shortcut: 'A', category: 'View' },
    { id: 'voice', label: 'Voice Brief', icon: '🎙️', shortcut: 'V', category: 'Tools' },
    { id: 'search', label: 'Search Articles', icon: '🔍', shortcut: '/', category: 'Search' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️', shortcut: 'H', category: 'Help' },
    { id: 'export', label: 'Export Data', icon: '📤', shortcut: 'E', category: 'Tools' },
    { id: 'settings', label: 'Settings', icon: '⚙️', shortcut: ',', category: 'Config' },
  ]

  const filtered = useMemo(() => {
    if (!query) return commands
    return commands.filter(c => 
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelected(0)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected(prev => Math.min(prev + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected(prev => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter' && filtered[selected]) {
        onAction(filtered[selected].id)
        onClose()
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filtered, selected, onAction, onClose])

  if (!isOpen) return null

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  let globalIndex = 0

  return (
    <div className="command-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-input-wrap">
          <span className="command-icon">⌘</span>
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Type a command..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
          />
        </div>
        <div className="command-list">
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category} className="command-group">
              <div className="command-group-label">{category}</div>
              {cmds.map((cmd) => {
                const idx = globalIndex++
                return (
                  <div
                    key={cmd.id}
                    className={`command-item ${selected === idx ? 'selected' : ''}`}
                    onClick={() => { onAction(cmd.id); onClose() }}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <span className="command-item-icon">{cmd.icon}</span>
                    <span className="command-item-label">{cmd.label}</span>
                    <span className="command-item-shortcut">{cmd.shortcut}</span>
                  </div>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="command-empty">No commands found</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Category Breakdown Chart
function CategoryChart({ articles }) {
  const categories = useMemo(() => {
    const counts = {}
    articles.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [articles])

  const total = categories.reduce((sum, [, count]) => sum + count, 0)

  return (
    <div className="category-chart">
      {categories.map(([cat, count], i) => {
        const pct = Math.round((count / total) * 100)
        const color = categoryColors[cat] || '#a1a1aa'
        return (
          <div key={cat} className="category-bar-wrap">
            <div className="category-bar-label">
              <span>{cat}</span>
              <span>{count} ({pct}%)</span>
            </div>
            <div className="category-bar-track">
              <div
                className="category-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}80)`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Writing prompt component
function WritingPrompt({ onClose }) {
  const prompts = [
    "Myth-bust: Most people think ___ but the science says ___",
    "What if everything you knew about ___ was wrong?",
    "The one metric most people ignore that matters most: ___",
    "Why your ___ is actually working (but not how you think)",
    "The hidden mechanism behind ___ that nobody talks about",
    "3 counter-intuitive findings from the latest research on ___",
    "The uncomfortable truth about ___ that the fitness industry hides",
  ]
  const [prompt] = useState(prompts[Math.floor(Math.random() * prompts.length)])
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content prompt-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💡 Writing Prompt</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="prompt-text">
          <p>{prompt}</p>
        </div>
        <button className="prompt-copy-btn" onClick={() => navigator.clipboard.writeText(prompt)}>
          📋 Copy Prompt
        </button>
      </div>
    </div>
  )
}

// Toast Notification Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  )
}

// Quick Draft Modal Component
function QuickDraftModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Longevity')
  const [hook, setHook] = useState('')

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title, category, hook, date: new Date().toISOString() })
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content draft-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📝 Quick Draft</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="draft-form">
          <div className="draft-field">
            <label>Article Title</label>
            <input
              type="text"
              placeholder="Enter a compelling title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="draft-field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Longevity">Longevity</option>
              <option value="Training">Training</option>
              <option value="Science">Science</option>
              <option value="Metrics">Metrics</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>
          <div className="draft-field">
            <label>Hook / Opening Line</label>
            <textarea
              placeholder="Write your attention-grabbing first sentence..."
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <div className="draft-actions">
          <button className="draft-cancel" onClick={onClose}>Cancel</button>
          <button className="draft-save" onClick={handleSave} disabled={!title.trim()}>
            Save Draft
          </button>
        </div>
      </div>
    </div>
  )
}

// Keyboard Shortcuts Panel
function ShortcutsPanel({ onClose }) {
  const shortcuts = [
    { key: '⌘ K', action: 'Open command palette' },
    { key: 'N', action: 'New article / prompt' },
    { key: 'P', action: 'Random writing prompt' },
    { key: 'T', action: 'Jump to trending topics' },
    { key: 'A', action: 'Jump to analytics' },
    { key: 'V', action: 'Voice brief' },
    { key: '/', action: 'Focus search' },
    { key: 'Esc', action: 'Close modal / clear' },
    { key: 'D', action: 'Open quick draft' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="shortcut-item">
              <kbd className="shortcut-key">{shortcut.key}</kbd>
              <span className="shortcut-action">{shortcut.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Today's Focus Component
function TodaysFocus({ focus, setFocus, onSave }) {
  const [isEditing, setIsEditing] = useState(!focus)
  const [tempFocus, setTempFocus] = useState(focus || '')

  const handleSave = () => {
    setFocus(tempFocus)
    setIsEditing(false)
    onSave?.(tempFocus)
  }

  if (isEditing) {
    return (
      <div className="focus-editor">
        <input
          type="text"
          placeholder="What's your writing focus today?"
          value={tempFocus}
          onChange={(e) => setTempFocus(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
        <button className="focus-save" onClick={handleSave}>Save</button>
      </div>
    )
  }

  return (
    <div className="focus-display" onClick={() => setIsEditing(true)}>
      <span className="focus-label">🎯 Today's Focus</span>
      <span className="focus-text">{focus || 'Click to set your focus...'}</span>
    </div>
  )
}

// Live Clock Component
function LiveClock() {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const hours = time.getHours()
  const mins = time.getMinutes()
  const secs = time.getSeconds()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  
  return (
    <div className="live-clock">
      <div className="clock-dots">
        <span className="clock-dot"></span>
        <span className="clock-dot"></span>
        <span className="clock-dot"></span>
      </div>
      <span className="clock-time">
        {displayHour}:{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')} {ampm}
      </span>
    </div>
  )
}

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

// Recent articles data
const recentArticles = [
  {
    title: "The Protein Timing Myth: When You Actually Eat Matters Way Less Than How Much",
    date: "2026-03-12",
    words: 1180,
    status: "Published",
    category: "Science",
    engagement: 8.4,
    reads: 15200
  },
  {
    title: "Sleep Quality Beats Sleep Quantity — Here's How to Measure It",
    date: "2026-03-11",
    words: 1056,
    status: "Published",
    category: "Recovery",
    engagement: 8.7,
    reads: 18900
  },
  {
    title: "The Exercise Variety Effect: Why Doing Just One Type of Workout Is Cutting Your Lifespan Short",
    date: "2026-03-10",
    words: 1069,
    status: "Published",
    category: "Longevity",
    engagement: 8.2,
    reads: 12450
  },
  {
    title: "Altitude Masks Are a Scam — But Real Hypoxic Training Changes Everything",
    date: "2026-03-09",
    words: 1247,
    status: "Published",
    category: "Training",
    engagement: 9.1,
    reads: 18200
  },
  {
    title: "Fascia: The Forgotten Tissue That Explains Why You're Stiff, Sore, and Stuck",
    date: "2026-03-08",
    words: 1208,
    status: "Published",
    category: "Science",
    engagement: 7.8,
    reads: 9800
  },
  {
    title: "Heart Rate Variability: The Hidden Fitness Metric That Predicts Your Health",
    date: "2026-03-07",
    words: 1241,
    status: "Published",
    category: "Metrics",
    engagement: 8.5,
    reads: 14300
  },
  {
    title: "Forget Lifespan — Your Musclespan Determines How Well You Age",
    date: "2026-03-06",
    words: 1381,
    status: "Published",
    category: "Longevity",
    engagement: 9.4,
    reads: 21500
  },
  {
    title: "Why Zone 2 Training Is Overrated (And What Actually Works)",
    date: "2026-03-05",
    words: 1156,
    status: "Published",
    category: "Training",
    engagement: 8.9,
    reads: 16700
  }
]

const metrics = {
  totalArticles: 31,
  currentStreak: 22,
  totalWords: 36200,
  avgWordsPerArticle: 1168,
  topCategory: "Longevity",
  lastArticleDate: "2026-03-12",
  publishedThisMonth: 12,
  topPerformer: "Musclespan",
  totalReads: 198000,
  avgEngagement: 8.8
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
  { label: "New Draft", icon: "📝", action: "new", shortcut: "D" },
  { label: "Writing Prompt", icon: "💡", action: "prompt", shortcut: "P" },
  { label: "Virality Score", icon: "🎯", action: "virality", shortcut: "V" },
  { label: "Check Trends", icon: "🔥", action: "trends", shortcut: "T" },
  { label: "Shortcuts", icon: "⌨️", action: "shortcuts", shortcut: "H" }
]

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeTip, setActiveTip] = useState(0)
  const [writingPulse, setWritingPulse] = useState(false)
  const [viewMode, setViewMode] = useState('dashboard')
  const [showPrompt, setShowPrompt] = useState(false)
  const [likedArticles, setLikedArticles] = useState({})
  const [expandedArticle, setExpandedArticle] = useState(null)
  const [hoveredMetric, setHoveredMetric] = useState(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [articleFilter, setArticleFilter] = useState('all')
  const [showQuickDraft, setShowQuickDraft] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showVirality, setShowVirality] = useState(false)
  const [todaysFocus, setTodaysFocus] = useState('')
  const [toasts, setToasts] = useState([])
  const [drafts, setDrafts] = useState([])
  const [energyLevel, setEnergyLevel] = useState(80)
  const [easterEgg, setEasterEgg] = useState(false)
  const inputRef = useRef(null)

  // Toast helpers
  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Load from localStorage
  useEffect(() => {
    const savedFocus = localStorage.getItem('renzo-focus')
    const savedDrafts = localStorage.getItem('renzo-drafts')
    if (savedFocus) setTodaysFocus(savedFocus)
    if (savedDrafts) setDrafts(JSON.parse(savedDrafts))
  }, [])

  // Save drafts to localStorage
  const saveDraft = (draft) => {
    const newDrafts = [draft, ...drafts]
    setDrafts(newDrafts)
    localStorage.setItem('renzo-drafts', JSON.stringify(newDrafts))
    addToast('Draft saved successfully!', 'success')
  }

  // Save focus to localStorage
  const saveFocus = (focus) => {
    setTodaysFocus(focus)
    localStorage.setItem('renzo-focus', focus)
    addToast('Focus updated!', 'success')
  }

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
      
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
        return
      }
      
      const key = e.key.toUpperCase()
      if (key === 'N') setShowPrompt(true)
      if (key === 'P') setShowPrompt(true)
      if (key === 'D') setShowQuickDraft(true)
      if (key === 'H') setShowShortcuts(true)
      if (key === 'V') setShowVirality(true)
      if (key === '/') { e.preventDefault(); document.getElementById('article-search')?.focus() }
      if (key === 'ESCAPE') {
        setShowPrompt(false)
        setShowCommandPalette(false)
        setSearchQuery('')
        setShowQuickDraft(false)
        setShowShortcuts(false)
        setShowVirality(false)
      }
      
      // Easter egg: type "renzo"
      if (e.key === 'r' || e.key === 'R') {
        setTimeout(() => setEasterEgg(true), 100)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleCommand = (actionId) => {
    switch(actionId) {
      case 'new':
        setShowQuickDraft(true)
        break
      case 'prompt':
        setShowPrompt(true)
        break
      case 'virality':
        setShowVirality(true)
        break
      case 'trends':
        document.querySelector('.trending-section')?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'analytics':
        document.querySelector('.feed-section')?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'search':
        document.getElementById('article-search')?.focus()
        break
      case 'voice':
        setShowPrompt(true)
        break
      case 'settings':
        setShowShortcuts(true)
        break
      default:
        break
    }
  }

  // Filter articles
  const filteredArticles = useMemo(() => {
    let filtered = recentArticles
    
    if (articleFilter !== 'all') {
      filtered = filtered.filter(a => a.category === articleFilter)
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      )
    }
    
    return filtered
  }, [recentArticles, articleFilter, searchQuery])

  // Get productivity hour
  const productivityHour = useMemo(() => {
    const hours = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    const weights = [3, 5, 8, 12, 15, 18, 14, 10, 8, 6, 5, 4, 6, 8, 10, 12, 14, 16, 18, 15, 10, 6]
    const maxIdx = weights.indexOf(Math.max(...weights))
    return hours[maxIdx]
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

  const handleLike = (article) => {
    setLikedArticles(prev => ({
      ...prev,
      [article.title]: !prev[article.title]
    }))
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
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>

      {showPrompt && <WritingPrompt onClose={() => setShowPrompt(false)} />}
      {showQuickDraft && (
        <QuickDraftModal 
          onClose={() => setShowQuickDraft(false)} 
          onSave={saveDraft}
        />
      )}
      {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}
      {showVirality && <ViralityCalculator onClose={() => setShowVirality(false)} />}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)}
        onAction={handleCommand}
      />
      
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
          <span className="logo-badge">v2.4</span>
        </div>
        <div className="header-right">
          <button className="cmd-hint" onClick={() => setShowCommandPalette(true)}>
            <span className="cmd-icon">⌘</span>
            <span>K</span>
          </button>
          <div className="tip-banner">
            <span className="tip-icon">💡</span>
            <span className="tip-text">{tips[activeTip]}</span>
          </div>
          <LiveClock />
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
            <TodaysFocus 
              focus={todaysFocus} 
              setFocus={setTodaysFocus} 
              onSave={saveFocus}
            />
          </div>
          <div className="hero-status">
            <EnergyMeter level={energyLevel} setLevel={setEnergyLevel} />
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
                onClick={() => setShowPrompt(true)}
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

        {/* Category Breakdown */}
        <section className="category-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📊</span>
              Category Breakdown
            </h2>
          </div>
          <CategoryChart articles={recentArticles} />
        </section>

        {/* Productivity Insight */}
        <section className="insight-section">
          <div className="insight-card">
            <div className="insight-icon">⏰</div>
            <div className="insight-content">
              <span className="insight-label">Peak Productivity Hour</span>
              <span className="insight-value">{productivityHour}:00 {productivityHour >= 12 ? 'PM' : 'AM'}</span>
            </div>
            <div className="insight-sub">You write best in the evening hours</div>
          </div>
        </section>

        <section className="feed-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📡</span>
              Recent Articles
            </h2>
            <span className="article-count">{filteredArticles.length} of {recentArticles.length}</span>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="article-filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                id="article-search"
                type="text"
                placeholder="Search articles... (press /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
            <div className="filter-pills">
              <button 
                className={`filter-pill ${articleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setArticleFilter('all')}
              >
                All
              </button>
              {Object.keys(categoryColors).map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${articleFilter === cat ? 'active' : ''}`}
                  onClick={() => setArticleFilter(cat)}
                  style={{ '--pill-color': categoryColors[cat] }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="articles-list">
            {filteredArticles.map((article, index) => (
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

        {/* Drafts Section */}
        {drafts.length > 0 && (
          <section className="drafts-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📝</span>
                Saved Drafts
              </h2>
              <span className="article-count">{drafts.length}</span>
            </div>
            <div className="drafts-list">
              {drafts.slice(0, 3).map((draft, i) => (
                <div key={i} className="draft-card" onClick={() => setShowQuickDraft(true)}>
                  <div className="draft-category" style={{ color: categoryColors[draft.category] || '#a1a1aa' }}>
                    {draft.category}
                  </div>
                  <div className="draft-title">{draft.title}</div>
                  {draft.hook && <div className="draft-hook">"{draft.hook.slice(0, 80)}..."</div>}
                  <div className="draft-date">{formatDate(draft.date)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

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
        <p className="footer-version">v2.4 • Press ⌘K for commands • Press V for virality</p>
      </footer>
    </div>
  )
}

export default App
