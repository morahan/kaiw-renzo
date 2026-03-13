import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './App.css'

// ========== NEW FEATURES v3.0 ==========

// Research Queue - topics waiting to be written
function ResearchQueue({ isOpen, onClose, onSelect }) {
  const [queue, setQueue] = useState(() => {
    const saved = localStorage.getItem('renzo-research-queue')
    return saved ? JSON.parse(saved) : [
      { id: 1, topic: "Photobiomodulation therapy", priority: "high", notes: "Red light therapy research", date: "2026-03-10" },
      { id: 2, topic: "Epigenetic age reversal protocols", priority: "medium", notes: "Look into TruAge data", date: "2026-03-08" },
      { id: 3, topic: "Myostatin inhibition research", priority: "low", notes: "Future of muscle growth", date: "2026-03-05" },
    ]
  })
  const [newTopic, setNewTopic] = useState({ topic: '', priority: 'medium', notes: '' })
  
  const addToQueue = () => {
    if (newTopic.topic) {
      const updated = [{ ...newTopic, id: Date.now(), date: new Date().toISOString() }, ...queue]
      setQueue(updated)
      localStorage.setItem('renzo-research-queue', JSON.stringify(updated))
      setNewTopic({ topic: '', priority: 'medium', notes: '' })
    }
  }
  
  const removeFromQueue = (id) => {
    const updated = queue.filter(q => q.id !== id)
    setQueue(updated)
    localStorage.setItem('renzo-research-queue', JSON.stringify(updated))
  }
  
  const getPriorityColor = (p) => {
    if (p === 'high') return '#ef4444'
    if (p === 'medium') return '#f97316'
    return '#22c55e'
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content research-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔬 Research Queue</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="research-add">
          <input
            type="text"
            placeholder="Topic to research..."
            value={newTopic.topic}
            onChange={(e) => setNewTopic({...newTopic, topic: e.target.value})}
          />
          <select 
            value={newTopic.priority}
            onChange={(e) => setNewTopic({...newTopic, priority: e.target.value})}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={addToQueue}>Add</button>
        </div>
        
        <div className="research-list">
          {queue.length === 0 ? (
            <div className="research-empty">Queue is empty! Add topics to research.</div>
          ) : (
            queue.map(item => (
              <div key={item.id} className="research-item">
                <div className="research-priority" style={{ background: getPriorityColor(item.priority) }}>
                  {item.priority.charAt(0).toUpperCase()}
                </div>
                <div className="research-content" onClick={() => { onSelect?.(item); onClose(); }}>
                  <div className="research-topic">{item.topic}</div>
                  {item.notes && <div className="research-notes">{item.notes}</div>}
                </div>
                <button className="research-remove" onClick={() => removeFromQueue(item.id)}>×</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Saved Hooks Collection
function SavedHooks({ isOpen, onClose }) {
  const [hooks, setHooks] = useState(() => {
    const saved = localStorage.getItem('renzo-saved-hooks')
    return saved ? JSON.parse(saved) : []
  })
  const [newHook, setNewHook] = useState('')
  
  const addHook = () => {
    if (newHook.trim()) {
      const updated = [{ text: newHook.trim(), date: new Date().toISOString(), used: false }, ...hooks]
      setHooks(updated)
      localStorage.setItem('renzo-saved-hooks', JSON.stringify(updated))
      setNewHook('')
    }
  }
  
  const markAsUsed = (index) => {
    const updated = [...hooks]
    updated[index].used = !updated[index].used
    setHooks(updated)
    localStorage.setItem('renzo-saved-hooks', JSON.stringify(updated))
  }
  
  const deleteHook = (index) => {
    const updated = hooks.filter((_, i) => i !== index)
    setHooks(updated)
    localStorage.setItem('renzo-saved-hooks', JSON.stringify(updated))
  }
  
  const copyHook = (text) => {
    navigator.clipboard.writeText(text)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hooks-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚡ Saved Hooks</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="hooks-add">
          <input
            type="text"
            placeholder="Write a killer hook..."
            value={newHook}
            onChange={(e) => setNewHook(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHook()}
          />
          <button onClick={addHook} disabled={!newHook.trim()}>Save</button>
        </div>
        
        <div className="hooks-list">
          {hooks.length === 0 ? (
            <div className="hooks-empty">
              <span>⚡</span>
              <p>No saved hooks yet. Start collecting your best opening lines!</p>
            </div>
          ) : (
            hooks.map((hook, i) => (
              <div key={i} className={`hook-item ${hook.used ? 'used' : ''}`}>
                <p className="hook-text" onClick={() => copyHook(hook.text)}>"{hook.text}"</p>
                <div className="hook-actions">
                  <button 
                    className={`hook-use-btn ${hook.used ? 'active' : ''}`}
                    onClick={() => markAsUsed(i)}
                  >
                    {hook.used ? '✓ Used' : 'Mark Used'}
                  </button>
                  <button className="hook-copy" onClick={() => copyHook(hook.text)}>📋</button>
                  <button className="hook-delete" onClick={() => deleteHook(i)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Word Sprint - Quick 15-min timed writing
function WordSprint({ isOpen, onClose, onSave }) {
  const [content, setContent] = useState('')
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes
  const [isRunning, setIsRunning] = useState(false)
  const [sprintWords, setSprintWords] = useState(0)
  
  useEffect(() => {
    let interval
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])
  
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w).length
    setSprintWords(words)
  }, [content])
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  
  const handleSave = () => {
    if (content.trim()) {
      onSave?.({ title: `Sprint - ${new Date().toLocaleTimeString()}`, content, words: sprintWords, date: new Date().toISOString() })
      setContent('')
      setTimeLeft(15 * 60)
      onClose()
    }
  }
  
  const resetSprint = () => {
    setIsRunning(false)
    setTimeLeft(15 * 60)
    setContent('')
  }
  
  if (!isOpen) return null
  
  const progress = ((15 * 60) - timeLeft) / (15 * 60) * 100
  
  return (
    <div className="sprint-overlay">
      <div className="sprint-container">
        <div className="sprint-header">
          <div className="sprint-timer">
            <span className={`sprint-time ${timeLeft < 60 ? 'warning' : ''}`}>{formatTime(timeLeft)}</span>
            <div className="sprint-progress-bar">
              <div className="sprint-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="sprint-controls">
            <button className="sprint-btn primary" onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? 'Pause' : timeLeft === 15 * 60 ? 'Start Sprint' : 'Resume'}
            </button>
            <button className="sprint-btn" onClick={resetSprint}>Reset</button>
            <button className="sprint-btn" onClick={onClose}>Exit</button>
          </div>
        </div>
        
        <div className="sprint-stats">
          <div className="sprint-stat">
            <span className="sprint-stat-value">{sprintWords}</span>
            <span className="sprint-stat-label">words</span>
          </div>
          <div className="sprint-stat">
            <span className="sprint-stat-value">{Math.max(0, Math.round((sprintWords / ((15 * 60 - timeLeft) || 1)) * 60))}</span>
            <span className="sprint-stat-label">WPM</span>
          </div>
          <div className="sprint-stat">
            <span className="sprint-stat-value">{timeLeft < 60 ? '🔴' : timeLeft < 180 ? '🟡' : '🟢'}</span>
            <span className="sprint-stat-label">energy</span>
          </div>
        </div>
        
        <textarea
          className="sprint-textarea"
          placeholder="Go! Write your heart out..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isRunning && timeLeft === 15 * 60}
        />
        
        <div className="sprint-footer">
          <button className="sprint-save" onClick={handleSave} disabled={!content.trim()}>
            Save Sprint ({sprintWords} words)
          </button>
        </div>
      </div>
    </div>
  )
}

// Article Series Tracker
function ArticleSeriesTracker({ isOpen, onClose }) {
  const [series, setSeries] = useState(() => {
    const saved = localStorage.getItem('renzo-article-series')
    return saved ? JSON.parse(saved) : []
  })
  const [newSeries, setNewSeries] = useState({ title: '', articles: [], expanded: false })
  
  const addSeries = () => {
    if (newSeries.title) {
      const updated = [...series, { ...newSeries, id: Date.now(), created: new Date().toISOString() }]
      setSeries(updated)
      localStorage.setItem('renzo-article-series', JSON.stringify(updated))
      setNewSeries({ title: '', articles: [], expanded: false })
    }
  }
  
  const deleteSeries = (id) => {
    const updated = series.filter(s => s.id !== id)
    setSeries(updated)
    localStorage.setItem('renzo-article-series', JSON.stringify(updated))
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content series-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📚 Article Series</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="series-add">
          <input
            type="text"
            placeholder="New series title..."
            value={newSeries.title}
            onChange={(e) => setNewSeries({...newSeries, title: e.target.value})}
          />
          <button onClick={addSeries}>Create Series</button>
        </div>
        
        <div className="series-list">
          {series.length === 0 ? (
            <div className="series-empty">
              <span>📚</span>
              <p>No article series yet. Group related articles together!</p>
            </div>
          ) : (
            series.map(s => (
              <div key={s.id} className="series-item">
                <div className="series-header">
                  <span className="series-title">{s.title}</span>
                  <span className="series-count">{s.articles.length} articles</span>
                  <button className="series-delete" onClick={() => deleteSeries(s.id)}>×</button>
                </div>
                <div className="series-progress">
                  <div 
                    className="series-progress-fill"
                    style={{ width: `${(s.articles.filter(a => a.status === 'published').length / Math.max(s.articles.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Extended tips for v3.0
const tips = [
  "Paradox Open hooks convert 3x better than questions",
  "Myth-busting articles hit 10/10 virality",
  "First sentence must work as a standalone tweet",
  "Specific mechanisms beat generic advice",
  "Lead with the controversial take, then back it up",
  "The Stats Punch formula: Lead with the number",
  "Expansion Bridge: add detail after impact",
  "Cut adjectives. Cut adverbs. Cut weak words.",
  "Your CTA should tie directly back to your hook",
  "If bores you, it bores them. Cut it.",
  "The best headlines answer a question the reader didn't know they had",
  "Always challenge assumptions — that's where the clicks live",
  "Use Staccato Punch: short sentences hit harder",
  "The Brake: slow down for emphasis, speed up for energy",
  "Pivot Sentence: acknowledge counterpoint before crushing it",
  "Callback Echo: tie your ending back to your opening",
  "Accelerator: build momentum with parallel structure",
  "Every paragraph needs ONE job. If it does two, split it.",
  "Credibility comes from specifics, not superlatives",
  "Don't say 'research shows' — name the study",
  "Vary sentence length. 1-sentence paragraphs = punch. 3-line paragraphs = nuance.",
  "Your reader's time is more valuable than your prose",
  "If you can cut it and still make the point — cut it",
]

// Changelog Modal - Version history
function ChangelogModal({ isOpen, onClose }) {
  const changelog = [
    { version: '3.1', date: '2026-03-13', changes: [
      'Added Citation Manager (I) - Store and organize sources',
      'Added 10 new writing tips',
      'Updated README with documentation',
      'Improved keyboard shortcut hints'
    ]},
    { version: '3.0', date: '2026-03-12', changes: [
      'Added Word Sprint - Quick 15-min timed writing sessions',
      'Added Research Queue - Track topics needing research',
      'Added Saved Hooks - Collect your best opening lines',
      'Added Article Series Tracker - Group related articles',
      'Added 7 new writing tips',
      'Performance improvements and bug fixes'
    ]},
    { version: '2.9', date: '2026-03-12', changes: [
      'Added Focus Mode (M) - Full-screen distraction-free writing',
      'Added Writing Streak Calendar - Visual 28-day activity tracker',
      'Added Quick Reference Panel (R) - Store citations & sources',
      'Added Focus & Refs buttons to toolbar',
      'Updated keyboard shortcuts'
    ]},
    { version: '2.8', date: '2026-03-12', changes: [
      'Added Export Drafts feature (Markdown/JSON)',
      'Added Reading Time Estimator',
      'Added Word Count Goal Widget',
      'Updated keyboard shortcuts',
      'Improved performance'
    ]},
    { version: '2.7', date: '2026-03-07', changes: [
      'Added Brainstorm Mode',
      'Added Topic Generator',
      'Added Clipboard History',
      'Added Writing Timer (Pomodoro)',
      'Added Daily Quote rotation'
    ]},
    { version: '2.6', date: '2026-03-05', changes: [
      'Added Command Palette',
      'Added Hot Take Generator',
      'Added Virality Calculator',
      'Added Quick Write Mode'
    ]},
    { version: '2.5', date: '2026-02-28', changes: [
      'Initial release',
      'Article dashboard',
      'Metrics tracking',
      'Notion sync'
    ]}
  ]
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content changelog-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📜 Changelog</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="changelog-list">
          {changelog.map((entry, i) => (
            <div key={i} className="changelog-entry">
              <div className="changelog-header">
                <span className="changelog-version">v{entry.version}</span>
                <span className="changelog-date">{entry.date}</span>
              </div>
              <ul className="changelog-changes">
                {entry.changes.map((change, j) => (
                  <li key={j}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== FOCUS MODE ==========
function FocusMode({ isOpen, onClose, onSave }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const textareaRef = useRef(null)
  
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])
  
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length
    setWordCount(words)
  }, [content])
  
  const handleSave = () => {
    if (title && content) {
      onSave?.({ title, content, words: wordCount, date: new Date().toISOString() })
      setContent('')
      setTitle('')
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="focus-mode-overlay">
      <div className="focus-mode-container">
        <div className="focus-mode-header">
          <input
            type="text"
            className="focus-title-input"
            placeholder="Article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="focus-mode-controls">
            <span className="focus-word-count">{wordCount} words</span>
            <span className="focus-time">{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
            <button className="focus-save-btn" onClick={handleSave} disabled={!title || !content}>
              Save Draft
            </button>
            <button className="focus-close-btn" onClick={onClose}>Exit</button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="focus-textarea"
          placeholder="Start writing... (Shift+Enter for line break)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="focus-mode-footer">
          <span className="focus-hint">Press Esc to exit • Auto-saves to localStorage</span>
        </div>
      </div>
    </div>
  )
}

// ========== WRITING STREAK CALENDAR ==========
function WritingStreakCalendar({ streak, articles }) {
  const [days, setDays] = useState([])
  
  useEffect(() => {
    // Generate last 28 days
    const today = new Date()
    const writingDays = articles.map(a => new Date(a.date).toDateString())
    const newDays = []
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const hasWritten = writingDays.includes(dateStr)
      newDays.push({
        date: date,
        day: date.getDate(),
        hasWritten,
        isToday: i === 0
      })
    }
    setDays(newDays)
  }, [articles])
  
  return (
    <div className="streak-calendar">
      <div className="streak-calendar-header">
        <span className="streak-icon">🔥</span>
        <span className="streak-count">{streak} day streak</span>
      </div>
      <div className="streak-grid">
        {days.map((day, i) => (
          <div 
            key={i} 
            className={`streak-day ${day.hasWritten ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
            title={`${day.date.toLocaleDateString()}${day.hasWritten ? ' - Wrote!' : ''}`}
          >
            {day.day}
          </div>
        ))}
      </div>
      <div className="streak-legend">
        <span className="legend-item"><span className="legend-dot active"></span> Wrote</span>
        <span className="legend-item"><span className="legend-dot"></span> No activity</span>
      </div>
    </div>
  )
}

// ========== QUICK REFERENCE PANEL ==========
function QuickReferencePanel({ isOpen, onClose }) {
  const [references, setReferences] = useState(() => {
    const saved = localStorage.getItem('renzo-references')
    return saved ? JSON.parse(saved) : []
  })
  const [newRef, setNewRef] = useState({ title: '', url: '', note: '' })
  const [filter, setFilter] = useState('all')
  
  const categories = ['all', 'studies', 'tools', 'inspiration', 'citations']
  
  const addReference = () => {
    if (newRef.title) {
      const updated = [...references, { ...newRef, id: Date.now(), category: filter === 'all' ? 'studies' : filter, date: new Date().toISOString() }]
      setReferences(updated)
      localStorage.setItem('renzo-references', JSON.stringify(updated))
      setNewRef({ title: '', url: '', note: '' })
    }
  }
  
  const deleteReference = (id) => {
    const updated = references.filter(r => r.id !== id)
    setReferences(updated)
    localStorage.setItem('renzo-references', JSON.stringify(updated))
  }
  
  const filteredRefs = filter === 'all' ? references : references.filter(r => r.category === filter)
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reference-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📚 Quick Reference</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="reference-filters">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="reference-add">
          <input
            type="text"
            placeholder="Title..."
            value={newRef.title}
            onChange={(e) => setNewRef({...newRef, title: e.target.value})}
          />
          <input
            type="text"
            placeholder="URL (optional)..."
            value={newRef.url}
            onChange={(e) => setNewRef({...newRef, url: e.target.value})}
          />
          <button onClick={addReference}>Add</button>
        </div>
        
        <div className="reference-list">
          {filteredRefs.length === 0 ? (
            <div className="reference-empty">No references yet. Add some!</div>
          ) : (
            filteredRefs.map(ref => (
              <div key={ref.id} className="reference-item">
                <div className="reference-title">{ref.title}</div>
                {ref.url && <a href={ref.url} target="_blank" rel="noopener noreferrer" className="reference-url">🔗</a>}
                {ref.note && <div className="reference-note">{ref.note}</div>}
                <div className="reference-meta">
                  <span className="reference-category">{ref.category}</span>
                  <button className="reference-delete" onClick={() => deleteReference(ref.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Article Templates Library
function ArticleTemplates({ isOpen, onClose, onSelect }) {
  const templates = [
    { 
      id: 'myth-bust', 
      name: 'Myth Buster', 
      emoji: '🚫',
      desc: 'Debunk common fitness misconceptions',
      structure: ['Hook (contrarian claim)', 'The myth', 'The science', 'The truth', 'Actionable CTA']
    },
    { 
      id: 'vs-compare', 
      name: 'Vs. Comparison', 
      emoji: '⚔️',
      desc: 'Compare two approaches side by side',
      structure: ['Hook (tension)', 'Option A analysis', 'Option B analysis', 'Winner (with data)', 'Recommendation']
    },
    { 
      id: 'deep-dive', 
      name: 'Deep Dive', 
      emoji: '🔬',
      desc: 'ComprehensiveExploration of a topic',
      structure: ['Hook (intrigue)', 'Problem statement', 'Mechanism (science)', 'Applications', 'Summary + CTA']
    },
    { 
      id: 'how-to', 
      name: 'How-To Guide', 
      emoji: '🛠️',
      desc: 'Actionable step-by-step content',
      structure: ['Hook (pain point)', 'Why it matters', 'Step 1', 'Step 2', 'Step 3', 'Common mistakes', 'CTA']
    },
    { 
      id: 'hot-take', 
      name: 'Hot Take', 
      emoji: '🔥',
      desc: 'Controversial opinion with backing',
      structure: ['Bold claim', 'Evidence 1', 'Evidence 2', 'Counter-arguments', 'Final stance']
    },
    { 
      id: 'listicle', 
      name: 'Listicle', 
      emoji: '📋',
      desc: 'Numbered list of insights',
      structure: ['Hook (numbered promise)', 'Item 1 (hook)', 'Item 2', 'Item 3', 'Summary', 'CTA']
    }
  ]
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content templates-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📝 Article Templates</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="templates-grid">
          {templates.map((t) => (
            <div 
              key={t.id} 
              className="template-card"
              onClick={() => { onSelect?.(t); onClose(); }}
            >
              <span className="template-emoji">{t.emoji}</span>
              <div className="template-name">{t.name}</div>
              <div className="template-desc">{t.desc}</div>
              <div className="template-structure">
                {t.structure.slice(0, 3).map((s, i) => (
                  <span key={i} className="structure-tag">{s}</span>
                ))}
                {t.structure.length > 3 && <span className="structure-more">+{t.structure.length - 3}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== CITATION MANAGER ==========
function CitationManager({ isOpen, onClose, onInsert }) {
  const [citations, setCitations] = useState(() => {
    const saved = localStorage.getItem('renzo-citations')
    return saved ? JSON.parse(saved) : []
  })
  const [newCitation, setNewCitation] = useState({ 
    author: '', 
    title: '', 
    year: '', 
    journal: '', 
    url: '',
    keyPoint: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  
  const types = ['all', 'study', 'review', 'meta-analysis', 'book', 'other']
  
  const addCitation = () => {
    if (newCitation.title && newCitation.author) {
      const updated = [...citations, { 
        ...newCitation, 
        id: Date.now(), 
        type: selectedType === 'all' ? 'study' : selectedType,
        date: new Date().toISOString() 
      }]
      setCitations(updated)
      localStorage.setItem('renzo-citations', JSON.stringify(updated))
      setNewCitation({ author: '', title: '', year: '', journal: '', url: '', keyPoint: '' })
    }
  }
  
  const deleteCitation = (id) => {
    const updated = citations.filter(c => c.id !== id)
    setCitations(updated)
    localStorage.setItem('renzo-citations', JSON.stringify(updated))
  }
  
  const copyAPA = (c) => {
    const apa = `${c.author} (${c.year}). ${c.title}. ${c.journal}.`
    navigator.clipboard.writeText(apa)
  }
  
  const copyMarkdown = (c) => {
    const md = `[${c.title}](${c.url}) - ${c.author} (${c.year})`
    navigator.clipboard.writeText(md)
  }
  
  const filteredCitations = citations.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || c.type === selectedType
    return matchesSearch && matchesType
  })
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content citation-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📚 Citation Manager</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="citation-search-bar">
          <input
            type="text"
            placeholder="Search citations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {types.map(t => (
              <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div className="citation-add-form">
          <div className="citation-form-row">
            <input
              type="text"
              placeholder="Author(s)"
              value={newCitation.author}
              onChange={(e) => setNewCitation({...newCitation, author: e.target.value})}
            />
            <input
              type="text"
              placeholder="Year"
              value={newCitation.year}
              onChange={(e) => setNewCitation({...newCitation, year: e.target.value})}
              style={{ maxWidth: '80px' }}
            />
          </div>
          <input
            type="text"
            placeholder="Title"
            value={newCitation.title}
            onChange={(e) => setNewCitation({...newCitation, title: e.target.value})}
          />
          <input
            type="text"
            placeholder="Journal / Source"
            value={newCitation.journal}
            onChange={(e) => setNewCitation({...newCitation, journal: e.target.value})}
          />
          <input
            type="url"
            placeholder="URL (optional)"
            value={newCitation.url}
            onChange={(e) => setNewCitation({...newCitation, url: e.target.value})}
          />
          <input
            type="text"
            placeholder="Key finding / takeaway"
            value={newCitation.keyPoint}
            onChange={(e) => setNewCitation({...newCitation, keyPoint: e.target.value})}
          />
          <button className="citation-add-btn" onClick={addCitation}>Add Citation</button>
        </div>
        
        <div className="citation-list">
          {filteredCitations.length === 0 ? (
            <div className="citation-empty">
              <span>📚</span>
              <p>No citations yet. Add studies, articles, and sources to build your library.</p>
            </div>
          ) : (
            filteredCitations.map(c => (
              <div key={c.id} className="citation-item">
                <div className="citation-type">{c.type}</div>
                <div className="citation-content">
                  <div className="citation-title">{c.title}</div>
                  <div className="citation-meta">
                    {c.author} ({c.year}) • {c.journal}
                  </div>
                  {c.keyPoint && <div className="citation-keypoint">💡 {c.keyPoint}</div>}
                </div>
                <div className="citation-actions">
                  <button onClick={() => copyAPA(c)} title="Copy APA">APA</button>
                  <button onClick={() => copyMarkdown(c)} title="Copy Markdown">MD</button>
                  <button className="citation-delete" onClick={() => deleteCitation(c.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="citation-stats">
          <span>{citations.length} citation{citations.length !== 1 ? 's' : ''} in library</span>
        </div>
      </div>
    </div>
  )
}

// Productivity Score Component
function ProductivityScore({ articles, words, streak }) {
  const [score, setScore] = useState(0)
  const [breakdown, setBreakdown] = useState({ consistency: 0, output: 0, quality: 0 })
  
  useEffect(() => {
    // Calculate productivity score
    const consistencyScore = Math.min((streak / 30) * 100, 100) // 30-day streak = max
    const outputScore = Math.min((words / 10000) * 100, 100) // 10k words = max
    const qualityScore = articles.length > 0 
      ? articles.reduce((sum, a) => sum + (a.engagement || 0), 0) / articles.length * 10 
      : 0
    
    const totalScore = Math.round((consistencyScore * 0.3 + outputScore * 0.35 + qualityScore * 0.35))
    
    setBreakdown({ consistency: consistencyScore, output: outputScore, quality: qualityScore })
    
    // Animate score
    let current = 0
    const timer = setInterval(() => {
      current += 2
      if (current >= totalScore) {
        setScore(totalScore)
        clearInterval(timer)
      } else {
        setScore(current)
      }
    }, 20)
    
    return () => clearInterval(timer)
  }, [articles, words, streak])
  
  const getScoreColor = (s) => {
    if (s >= 80) return '#22c55e'
    if (s >= 60) return '#3b82f6'
    if (s >= 40) return '#f97316'
    return '#ef4444'
  }
  
  const getScoreLabel = (s) => {
    if (s >= 80) return 'Elite'
    if (s >= 60) return 'Strong'
    if (s >= 40) return 'Average'
    return 'Building'
  }
  
  return (
    <div className="productivity-score">
      <div className="score-header">
        <span className="score-icon">📈</span>
        <span className="score-label">Productivity Score</span>
      </div>
      <div className="score-main">
        <div className="score-circle" style={{ '--score-color': getScoreColor(score) }}>
          <svg viewBox="0 0 100 100">
            <circle className="score-bg-circle" cx="50" cy="50" r="45" />
            <circle 
              className="score-fill-circle" 
              cx="50" 
              cy="50" 
              r="45" 
              style={{ strokeDashoffset: 283 - (283 * score / 100) }}
            />
          </svg>
          <div className="score-value">
            <span className="score-number">{score}</span>
            <span className="score-level">{getScoreLabel(score)}</span>
          </div>
        </div>
      </div>
      <div className="score-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label">Consistency</span>
          <div className="breakdown-bar">
            <div className="breakdown-fill" style={{ width: `${breakdown.consistency}%`, background: '#a855f7' }} />
          </div>
          <span className="breakdown-value">{Math.round(breakdown.consistency)}%</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Output</span>
          <div className="breakdown-bar">
            <div className="breakdown-fill" style={{ width: `${breakdown.output}%`, background: '#3b82f6' }} />
          </div>
          <span className="breakdown-value">{Math.round(breakdown.output)}%</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Quality</span>
          <div className="breakdown-bar">
            <div className="breakdown-fill" style={{ width: `${breakdown.quality}%`, background: '#22c55e' }} />
          </div>
          <span className="breakdown-value">{Math.round(breakdown.quality)}%</span>
        </div>
      </div>
    </div>
  )
}

// Daily Quote Component
function DailyQuote() {
  const quotes = [
    { text: "Write drunk, edit sober.", author: "Hemingway" },
    { text: "The first draft is just you telling yourself the story.", author: "Terry Pratchett" },
    { text: "You can always edit a bad page. You can't edit a blank page.", author: "Jodi Picoult" },
    { text: "Start writing, no matter what. The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
    { text: "The scariest moment is always just before you start.", author: "Stephen King" },
    { text: "Writing is thinking. To write well is to think clearly.", author: "David McCullough" },
    { text: "Don't tell me the moon is shining; show me the glint of light on broken glass.", author: "Anton Chekhov" },
    { text: "Cut the deadwood. Kill your darlings.", author: "Stephen King" },
  ]
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)])
  
  return (
    <div className="daily-quote">
      <span className="quote-icon">"</span>
      <p className="quote-text">{quote.text}</p>
      <span className="quote-author">— {quote.author}</span>
    </div>
  )
}

// Study Spotlight Component
function StudySpotlight() {
  const studies = [
    { title: "Muscle Protein Synthesis", finding: "Leucine threshold of ~2.5g triggers maximum MPS", source: "JISSN 2013" },
    { title: "Sleep & Recovery", finding: "8+ hours sleep doubles testosterone recovery", source: "Sleep 2011" },
    { title: "HIIT vs Steady State", finding: "HIIT burns 25% more fat in half the time", source: "JAP 2009" },
    { title: "Protein Pacing", finding: "4 meals/day optimizes muscle protein synthesis", source: "AJCN 2009" },
    { title: "Strength Training & Bone", finding: "Resistance training increases bone density 1-3%", source: "Osteoporosis Int 2007" },
    { title: "Creatine & Brain", finding: "Creatine improves cognitive performance under stress", source: "Nutritional Neuroscience 2020" },
    { title: "Sarcopenia Prevention", finding: "Adults lose 3-8% muscle mass per decade after 30", source: "JAMA 2004" },
    { title: "Cortisol & Training", finding: "Morning cortisol peaks can impair evening workouts", source: "Endocrine 2015" },
  ]
  const [study, setStudy] = useState(() => studies[Math.floor(Math.random() * studies.length)])
  const [expanded, setExpanded] = useState(false)
  
  const refreshStudy = () => {
    const newStudy = studies[Math.floor(Math.random() * studies.length)]
    setStudy(newStudy)
    setExpanded(false)
  }
  
  return (
    <div className="study-spotlight" onClick={() => setExpanded(!expanded)}>
      <div className="study-header">
        <span className="study-icon">🔬</span>
        <span className="study-label">Study Spotlight</span>
        <button className="study-refresh" onClick={(e) => { e.stopPropagation(); refreshStudy() }}>↻</button>
      </div>
      <div className="study-title">{study.title}</div>
      {expanded && (
        <div className="study-expanded">
          <p className="study-finding">{study.finding}</p>
          <span className="study-source">{study.source}</span>
        </div>
      )}
    </div>
  )
}

// Quick Stat Generator
function QuickStatGenerator() {
  const stats = [
    "73% of people quit their fitness routine within 6 months",
    "Muscle remains metabolically active for 72 hours post-workout",
    "The average person walks 3,000-4,000 steps per day",
    "Sleep deprivation can reduce testosterone by 15% in one week",
    "Creatine monohydrate is the most researched supplement in history",
    "Fast-twitch fibers fatigue 10x faster than slow-twitch",
    "Your gut microbiome produces 10% of your daily energy",
    "Resistance training maintains bone density better than cardio",
    "Protein thermic effect is 20-30% vs 5-10% for carbs/fat",
    "HRV is a stronger predictor of overtraining than resting HR",
  ]
  const [stat, setStat] = useState(stats[Math.floor(Math.random() * stats.length)])
  const [animating, setAnimating] = useState(false)
  
  const generateStat = () => {
    setAnimating(true)
    setTimeout(() => {
      setStat(stats[Math.floor(Math.random() * stats.length)])
      setAnimating(false)
    }, 200)
  }
  
  return (
    <div className="quick-stat">
      <div className="quick-stat-header">
        <span className="stat-icon">📊</span>
        <span className="stat-label">Quick Stat</span>
      </div>
      <p className={`quick-stat-text ${animating ? 'animating' : ''}`}>{stat}</p>
      <button className="stat-generate-btn" onClick={generateStat}>Generate New</button>
    </div>
  )
}

// Content Calendar - Upcoming deadlines
function ContentCalendar() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('renzo-content-calendar')
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Weekly article', date: '2026-03-14', type: 'deadline', color: '#ef4444' },
      { id: 2, title: 'X thread', date: '2026-03-15', type: 'schedule', color: '#3b82f6' },
      { id: 3, title: 'Newsletter', date: '2026-03-18', type: 'deadline', color: '#ef4444' },
    ]
  })
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'deadline' })
  
  const getDaysUntil = (dateStr) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(dateStr)
    eventDate.setHours(0, 0, 0, 0)
    const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff < 0) return 'Overdue'
    return `${diff}d`
  }
  
  const getEventColor = (type) => {
    if (type === 'deadline') return '#ef4444'
    if (type === 'schedule') return '#3b82f6'
    return '#22c55e'
  }
  
  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      const updated = [...events, { ...newEvent, id: Date.now(), color: getEventColor(newEvent.type) }]
      setEvents(updated)
      localStorage.setItem('renzo-content-calendar', JSON.stringify(updated))
      setNewEvent({ title: '', date: '', type: 'deadline' })
      setShowAddEvent(false)
    }
  }
  
  const removeEvent = (id) => {
    const updated = events.filter(e => e.id !== id)
    setEvents(updated)
    localStorage.setItem('renzo-content-calendar', JSON.stringify(updated))
  }
  
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
  const upcomingEvents = sortedEvents.slice(0, 3)
  
  return (
    <div className="content-calendar">
      <div className="calendar-header">
        <span className="calendar-icon">📅</span>
        <span className="calendar-label">Content Calendar</span>
        <button className="calendar-add-btn" onClick={() => setShowAddEvent(!showAddEvent)}>+</button>
      </div>
      
      {showAddEvent && (
        <div className="calendar-add-form">
          <input
            type="text"
            placeholder="Event title..."
            value={newEvent.title}
            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
          />
          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
          >
            <option value="deadline">Deadline</option>
            <option value="schedule">Schedule</option>
            <option value="milestone">Milestone</option>
          </select>
          <button onClick={addEvent}>Add</button>
        </div>
      )}
      
      <div className="calendar-events">
        {upcomingEvents.length === 0 ? (
          <p className="calendar-empty">No upcoming events</p>
        ) : (
          upcomingEvents.map(event => (
            <div key={event.id} className="calendar-event">
              <div className="event-indicator" style={{ background: event.color }} />
              <div className="event-content">
                <span className="event-title">{event.title}</span>
                <span className="event-days">{getDaysUntil(event.date)}</span>
              </div>
              <button className="event-remove" onClick={() => removeEvent(event.id)}>×</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Content Formula Reference
function ContentFormulaRef({ isOpen, onClose }) {
  const formula = [
    { step: 1, name: "Hook", desc: "Grab attention in first 7 words", example: "Nobody talks about ___ but it's killing your gains" },
    { step: 2, name: "Problem", desc: "Define the pain point clearly", example: "You're training hard but seeing nothing" },
    { step: 3, name: "Science", desc: "Cite research, explain mechanism", example: "Study shows 2.5g leucine triggers max MPS" },
    { step: 4, name: "Solution", desc: "Actionable, specific advice", example: "Eat 30g protein per meal, 4x daily" },
    { step: 5, name: "CTA", desc: "One clear action, tie back to hook", example: "Start tonight. Your muscles will thank you." },
  ]
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content formula-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📝 Content Formula</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="formula-grid">
          {formula.map(f => (
            <div key={f.step} className="formula-step">
              <div className="step-number">{f.step}</div>
              <div className="step-name">{f.name}</div>
              <div className="step-desc">{f.desc}</div>
              <div className="step-example">{f.example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Keyboard Shortcuts Reference
function KeyboardShortcuts({ isOpen, onClose }) {
  const shortcuts = [
    { key: 'F', action: 'Open Content Formula' },
    { key: 'G', action: 'Generate Topic' },
    { key: 'C', action: 'Open Clipboard History' },
    { key: 'K', action: 'Open Command Palette' },
    { key: 'Q', action: 'Quick Write Mode' },
    { key: 'S', action: 'Save Draft' },
    { key: 'N', action: 'New Article' },
    { key: 'Esc', action: 'Close Modal' },
    { key: '⏱️', action: 'Start/Stop Timer (in modal)' },
  ]
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⌨️ Keyboard Shortcuts</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="shortcuts-grid">
          {shortcuts.map((s, i) => (
            <div key={i} className="shortcut-item">
              <kbd className="shortcut-key">{s.key}</kbd>
              <span className="shortcut-action">{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Brainstorm Mode - Quick idea generation
function BrainstormMode({ isOpen, onClose, onSelect }) {
  const [ideas, setIdeas] = useState([])
  const [generating, setGenerating] = useState(false)
  
  const brainstormTopics = [
    "The real reason you're not gaining muscle (it's not what you think)",
    "What happens to your body after 30 days of cold exposure",
    "The supplement that actually works: science vs. marketing",
    "Why your sleep tracking is lying to you",
    "The workout split that most people get wrong",
    "How to know if you're overtraining (before injury)",
    "The truth about protein timing",
    "What VO2 max really means for your health",
    "Morning vs. evening workouts: what the research says",
    "The metabolic winter myth",
  ]
  
  const generateIdeas = () => {
    setGenerating(true)
    setTimeout(() => {
      const shuffled = [...brainstormTopics].sort(() => 0.5 - Math.random()).slice(0, 5)
      setIdeas(shuffled)
      setGenerating(false)
    }, 500)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content brainstorm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🧠 Brainstorm Mode</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="brainstorm-content">
          {ideas.length === 0 ? (
            <div className="brainstorm-empty">
              <span>🧠</span>
              <p>Need article ideas? Generate some now.</p>
            </div>
          ) : (
            <div className="brainstorm-list">
              {ideas.map((idea, i) => (
                <div 
                  key={i} 
                  className="brainstorm-item"
                  onClick={() => { onSelect?.(idea); onClose(); }}
                >
                  <span className="brainstorm-number">{i + 1}</span>
                  <span className="brainstorm-text">{idea}</span>
                </div>
              ))}
            </div>
          )}
          <button 
            className={`generate-btn ${generating ? 'loading' : ''}`}
            onClick={generateIdeas}
            disabled={generating}
          >
            {generating ? 'Brainstorming...' : '🧠 Generate Ideas'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Writing Session Timer (Pomodoro-style)
function WritingTimer({ onComplete, onSave }) {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('renzo-timer-sessions')
    return saved ? JSON.parse(saved) : 0
  })
  const [wordsInSession, setWordsInSession] = useState(0)
  
  useEffect(() => {
    let interval
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete
            if (!isBreak) {
              setSessions(s => {
                const newS = s + 1
                localStorage.setItem('renzo-timer-sessions', JSON.stringify(newS))
                return newS
              })
              onComplete?.()
              new Audio('/ beep.mp3').play().catch(() => {})
            }
            setIsBreak(!isBreak)
            setMinutes(isBreak ? 25 : 5)
            setSeconds(0)
            setIsRunning(false)
          } else {
            setMinutes(m => m - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(s => s - 1)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, minutes, seconds, isBreak, onComplete])
  
  const toggleTimer = () => setIsRunning(!isRunning)
  const resetTimer = () => {
    setIsRunning(false)
    setMinutes(isBreak ? 25 : 25)
    setSeconds(0)
  }
  
  const progress = ((25 * 60) - (minutes * 60 + seconds)) / (25 * 60) * 100
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  
  return (
    <div className="writing-timer">
      <div className="timer-header">
        <span className="timer-icon">⏱️</span>
        <span className="timer-label">{isBreak ? 'Break Time' : 'Writing Session'}</span>
        <span className="timer-sessions">🍅 {sessions} sessions</span>
      </div>
      <div className="timer-display">
        <svg className="timer-ring" viewBox="0 0 100 100">
          <circle className="timer-bg" cx="50" cy="50" r="45" />
          <circle 
            className="timer-fill" 
            cx="50" 
            cy="50" 
            r="45" 
            style={{ 
              strokeDashoffset: 283 - (283 * progress / 100),
              stroke: isBreak ? '#22c55e' : '#ef4444'
            }}
          />
        </svg>
        <span className="timer-time">{displayTime}</span>
      </div>
      <div className="timer-controls">
        <button className="timer-btn primary" onClick={toggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="timer-btn" onClick={resetTimer}>Reset</button>
      </div>
    </div>
  )
}

// Topic Generator - generates random article topics
function TopicGenerator({ onClose }) {
  const topics = [
    { category: "Longevity", topic: "Why your biological age might be older than you think", hook: "You're not as young as you feel — and science proves it" },
    { category: "Training", topic: "The optimal workout frequency no one talks about", hook: "More isn't better. Here's the magic number." },
    { category: "Science", topic: "Mitochondrial dysfunction: the root cause of aging", hook: "Your cells are slowly suffocating — and you don't even know it" },
    { category: "Recovery", topic: "Sleep hacking: advanced recovery techniques", hook: "Eight hours is for amateurs. Here's what actually works." },
    { category: "Metrics", topic: "Why HRV is the most underrated fitness metric", hook: "Your heart rate variability is telling you something. Are you listening?" },
    { category: "Training", topic: "The myth of progressive overload", hook: "Add weight. Add reps. Add sets. Wrong." },
    { category: "Longevity", topic: "Epigenetic clocks: measuring true biological age", hook: "Your DNA is older than your birth certificate suggests" },
    { category: "Science", topic: "The gut-muscle axis: why your microbiome matters", hook: "You have more bacteria in your gut than cells in your body — and they're controlling your gains" },
    { category: "Recovery", topic: "Cold exposure: beyond the ice bath hype", hook: "Wim Hof is onto something. But not for the reasons you think." },
    { category: "Training", topic: "Time under tension vs. mechanical tension", hook: "Slow reps aren't always better. Here's the research." },
    { category: "Metrics", topic: "The VO2 max revolution", hook: "It's the best predictor of longevity. Here's how to improve yours." },
    { category: "Longevity", topic: "Senolytics: killing zombie cells", hook: "Your body is full of dead cells that are slowly killing you" },
  ]
  
  const [generated, setGenerated] = useState(null)
  const [generating, setGenerating] = useState(false)
  
  const generateTopic = () => {
    setGenerating(true)
    setTimeout(() => {
      const random = topics[Math.floor(Math.random() * topics.length)]
      setGenerated(random)
      setGenerating(false)
    }, 600)
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content topic-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💡 Topic Generator</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="topic-content">
          {generated ? (
            <div className="generated-topic">
              <span className="topic-category" style={{ color: categoryColors[generated.category] }}>
                {generated.category}
              </span>
              <h4 className="topic-title">{generated.topic}</h4>
              <div className="topic-hook">
                <span className="hook-label">Hook:</span>
                <p>{generated.hook}</p>
              </div>
              <div className="topic-actions">
                <button className="topic-copy-btn" onClick={() => navigator.clipboard.writeText(generated.topic)}>
                  📋 Copy Topic
                </button>
                <button className="topic-copy-hook" onClick={() => navigator.clipboard.writeText(generated.hook)}>
                  📋 Copy Hook
                </button>
              </div>
            </div>
          ) : (
            <div className="topic-placeholder">
              <span>💡</span>
              <p>Need a new article idea?</p>
            </div>
          )}
          <button 
            className={`generate-btn ${generating ? 'loading' : ''}`}
            onClick={generateTopic}
            disabled={generating}
          >
            {generating ? 'Generating...' : '💡 Generate Topic'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Clipboard History - saves copied headlines/hooks
function ClipboardHistory({ isOpen, onClose }) {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('renzo-clipboard-history')
    return saved ? JSON.parse(saved) : []
  })
  
  const addToHistory = (text) => {
    const newHistory = [{ text, time: new Date().toISOString() }, ...history].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem('renzo-clipboard-history', JSON.stringify(newHistory))
  }
  
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('renzo-clipboard-history')
  }
  
  const copyItem = (text) => {
    navigator.clipboard.writeText(text)
  }
  
  const formatTime = (iso) => {
    const mins = Math.floor((new Date() - new Date(iso)) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content clipboard-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📋 Clipboard History</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="clipboard-list">
          {history.length === 0 ? (
            <div className="clipboard-empty">
              <p>No saved clips yet.</p>
              <span>Copy headlines or hooks to save them here.</span>
            </div>
          ) : (
            history.map((item, i) => (
              <div key={i} className="clipboard-item" onClick={() => copyItem(item.text)}>
                <p className="clipboard-text">{item.text}</p>
                <span className="clipboard-time">{formatTime(item.time)}</span>
              </div>
            ))
          )}
        </div>
        {history.length > 0 && (
          <button className="clipboard-clear" onClick={clearHistory}>
            Clear History
          </button>
        )}
      </div>
    </div>
  )
}

// ========== EXISTING COMPONENTS ==========

// Activity Timeline Component
function ActivityTimeline({ activities }) {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'draft': return '📝'
      case 'article': return '📄'
      case 'sync': return '🔄'
      case 'prompt': return '💡'
      case 'hottake': return '🔥'
      case 'focus': return '🎯'
      default: return '•'
    }
  }
  
  return (
    <div className="activity-timeline">
      {activities.map((activity, i) => (
        <div key={i} className="activity-item" style={{ animationDelay: `${i * 0.05}s` }}>
          <span className="activity-icon">{getActivityIcon(activity.type)}</span>
          <span className="activity-text">{activity.text}</span>
          <span className="activity-time">{activity.time}</span>
        </div>
      ))}
    </div>
  )
}

// Today's Word Count Tracker
function WordCountTracker({ onUpdate }) {
  const [words, setWords] = useState(() => {
    const saved = localStorage.getItem('renzo-today-words')
    const savedDate = localStorage.getItem('renzo-today-date')
    const today = new Date().toDateString()
    if (saved && savedDate === today) return parseInt(saved) || 0
    return 0
  })
  const [goal] = useState(2000)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  
  useEffect(() => {
    localStorage.setItem('renzo-today-words', words)
    localStorage.setItem('renzo-today-date', new Date().toDateString())
    onUpdate?.(words)
  }, [words, onUpdate])
  
  const progress = Math.min((words / goal) * 100, 100)
  
  const handleAdd = (amount) => {
    setWords(prev => prev + amount)
  }
  
  const handleManualAdd = () => {
    const num = parseInt(inputValue)
    if (num > 0) {
      setWords(prev => prev + num)
      setInputValue('')
      setIsEditing(false)
    }
  }
  
  return (
    <div className="word-tracker">
      <div className="word-tracker-header">
        <span className="word-tracker-label">Today's Words</span>
        <span className="word-tracker-goal">Goal: {goal.toLocaleString()}</span>
      </div>
      <div className="word-tracker-progress">
        <div className="word-tracker-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="word-tracker-numbers">
        <span className="word-tracker-current">{words.toLocaleString()}</span>
        <span className="word-tracker-sep">/</span>
        <span className="word-tracker-target">{goal.toLocaleString()}</span>
        <span className="word-tracker-pct">{Math.round(progress)}%</span>
      </div>
      <div className="word-tracker-actions">
        <button onClick={() => handleAdd(100)}>+100</button>
        <button onClick={() => handleAdd(250)}>+250</button>
        <button onClick={() => handleAdd(500)}>+500</button>
        {isEditing ? (
          <div className="word-tracker-input-wrap">
            <input 
              type="number" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add words..."
              autoFocus
            />
            <button onClick={handleManualAdd} className="add-btn">Add</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="custom-btn">Custom</button>
        )}
      </div>
    </div>
  )
}

// Quick Write Mode - Distraction-free writing
function QuickWriteMode({ onClose, onSave }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const textareaRef = useRef(null)
  
  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(w => w).length
  }, [content])
  
  const handleSave = () => {
    if (content.trim()) {
      onSave({ title: title || 'Untitled', content, words: wordCount, date: new Date().toISOString() })
      onClose()
    }
  }
  
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])
  
  return (
    <div className="quick-write-overlay">
      <div className="quick-write-container">
        <div className="quick-write-header">
          <input
            type="text"
            className="quick-write-title"
            placeholder="Article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="quick-write-meta">
            <span className="quick-write-count">{wordCount} words</span>
            <button className="quick-write-close" onClick={onClose}>×</button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="quick-write-content"
          placeholder="Start writing... (Hook → Problem → Science → Solution → CTA)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="quick-write-footer">
          <button className="quick-write-cancel" onClick={onClose}>Cancel</button>
          <button className="quick-write-save" onClick={handleSave} disabled={!content.trim()}>
            Save Draft ({wordCount} words)
          </button>
        </div>
      </div>
    </div>
  )
}

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
      
      if (lower.includes('myth') || lower.includes('scam') || lower.includes('wrong') || lower.includes('lie')) points += 25
      if (/\d+%/.test(text)) points += 20
      if (/\d+/.test(text) && !/\d+%/.test(text)) points += 10
      if (/\b(shocking|secret|hidden|truth|actually|really)\b/.test(lower)) points += 15
      if (text.includes('?')) points += 10
      if (/\b(vs|versus|beats|better than)\b/.test(lower)) points += 20
      if (/\b(overrated|failed|bad|waste)\b/.test(lower)) points += 15
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
    <div className="energy-meter" onClick={() => setLevel(level === 100 ? 20 : Math.min(level + 20, 100))}>
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

// Notion Sync Status Component
function NotionSyncStatus({ onSync }) {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(() => {
    const saved = localStorage.getItem('renzo-last-sync')
    return saved ? new Date(saved) : null
  })

  const handleSync = async () => {
    setSyncing(true)
    // Simulate sync
    await new Promise(r => setTimeout(r, 1500))
    setLastSync(new Date())
    localStorage.setItem('renzo-last-sync', new Date().toISOString())
    setSyncing(false)
    onSync?.()
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    const mins = Math.floor((new Date() - date) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <button className="sync-btn" onClick={handleSync} disabled={syncing}>
      <span className={`sync-icon ${syncing ? 'spinning' : ''}`}>🔄</span>
      <span className="sync-text">
        {syncing ? 'Syncing...' : lastSync ? `Synced ${formatTime(lastSync)}` : 'Sync Now'}
      </span>
    </button>
  )
}

// Weekly Goals Component
function WeeklyGoals() {
  const goals = [
    { target: 5, current: 3, label: 'Articles', icon: '📄' },
    { target: 6000, current: 4200, label: 'Words', icon: '📝', isWords: true },
    { target: 4, current: 2, label: 'Published', icon: '🚀' },
  ]

  return (
    <div className="goals-grid">
      {goals.map((goal, i) => {
        const pct = Math.min((goal.current / goal.target) * 100, 100)
        const isWords = goal.isWords
        return (
          <div key={i} className="goal-card">
            <div className="goal-header">
              <span className="goal-icon">{goal.icon}</span>
              <span className="goal-label">{goal.label}</span>
            </div>
            <div className="goal-numbers">
              <span className="goal-current">
                {isWords ? (goal.current / 1000).toFixed(1) + 'k' : goal.current}
              </span>
              <span className="goal-separator">/</span>
              <span className="goal-target">
                {isWords ? (goal.target / 1000) + 'k' : goal.target}
              </span>
            </div>
            <div className="goal-progress">
              <div 
                className="goal-bar" 
                style={{ 
                  width: `${pct}%`,
                  background: pct >= 100 ? 'var(--accent-green)' : 'linear-gradient(90deg, var(--accent), var(--accent-purple))'
                }} 
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Hot Take Generator
function HotTakeGenerator({ onClose }) {
  const [take, setTake] = useState('')
  const [generating, setGenerating] = useState(false)

  const hotTakes = [
    "Zone 2 training is overrated — polarized training beats it for most people",
    "You don't need 10,000 steps. You need 3 hard sessions and 7k steps.",
    "Creatine is the most underutilized supplement in fitness",
    "Sleep is the best PED. Everything else is marginal",
    "The fitness industry lies about what sustainable progress looks like",
    "Strength training beats cardio for fat loss — fight me",
    "Most people train too much, not too little",
    "The 'best' workout is the one you'll actually do — butcience says..."
  ]

  const generateTake = () => {
    setGenerating(true)
    setTimeout(() => {
      const randomTake = hotTakes[Math.floor(Math.random() * hotTakes.length)]
      setTake(randomTake)
      setGenerating(false)
    }, 800)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hot-take-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔥 Hot Take Generator</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="hot-take-content">
          {take ? (
            <div className="hot-take-text">
              <p>{take}</p>
            </div>
          ) : (
            <div className="hot-take-placeholder">
              <span>🔥</span>
              <p>Ready to spark some controversy?</p>
            </div>
          )}
          <button 
            className={`generate-btn ${generating ? 'loading' : ''}`}
            onClick={generateTake}
            disabled={generating}
          >
            {generating ? 'Generating...' : '🔥 Generate Take'}
          </button>
          {take && (
            <button className="copy-take-btn" onClick={() => {
              navigator.clipboard.writeText(take)
              onClose()
            }}>
              📋 Copy to Clipboard
            </button>
          )}
        </div>
      </div>
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
    { id: 'hottake', label: 'Hot Take Generator', icon: '🔥', shortcut: 'H', category: 'Create' },
    { id: 'trends', label: 'View Trends', icon: '🔥', shortcut: 'T', category: 'Research' },
    { id: 'analytics', label: 'Analytics', icon: '📊', shortcut: 'A', category: 'View' },
    { id: 'voice', label: 'Voice Brief', icon: '🎙️', shortcut: 'V', category: 'Tools' },
    { id: 'search', label: 'Search Articles', icon: '🔍', shortcut: '/', category: 'Search' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️', shortcut: '?', category: 'Help' },
    { id: 'sync', label: 'Sync with Notion', icon: '🔄', shortcut: 'S', category: 'Tools' },
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
    { key: '⌘ K + type', action: 'Search commands' },
    { key: 'N', action: 'Random writing prompt' },
    { key: 'P', action: 'Random writing prompt' },
    { key: 'H', action: 'Generate hot take' },
    { key: 'D', action: 'Open quick draft' },
    { key: 'T', action: 'Jump to trending topics' },
    { key: 'A', action: 'Jump to analytics' },
    { key: 'S', action: 'Sync with Notion' },
    { key: '/', action: 'Focus search' },
    { key: '?', action: 'Show shortcuts' },
    { key: 'Esc', action: 'Close modal / clear' },
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

const quickActions = [
  { label: "New Draft", icon: "📝", action: "new", shortcut: "D" },
  { label: "Templates", icon: "📋", action: "templates", shortcut: "T" },
  { label: "Hot Take", icon: "🔥", action: "hottake", shortcut: "Y" },
  { label: "Writing Prompt", icon: "💡", action: "prompt", shortcut: "P" },
  { label: "Virality Score", icon: "🎯", action: "virality", shortcut: "V" },
  { label: "Check Trends", icon: "📈", action: "trends", shortcut: "R" },
  { label: "Shortcuts", icon: "⌨️", action: "shortcuts", shortcut: "H" },
  { label: "Changelog", icon: "📜", action: "changelog", shortcut: "L" },
  { label: "Export Drafts", icon: "📦", action: "exportDrafts", shortcut: "E" }
]

// Reading Time Estimator Component
function ReadingTimeEstimator({ wordCount }) {
  const minutes = Math.ceil(wordCount / 200) // Average reading speed
  
  const getColor = () => {
    if (minutes <= 3) return 'short'
    if (minutes <= 7) return 'medium'
    return 'long'
  }
  
  return (
    <div className={`reading-time ${getColor()}`}>
      <span className="reading-icon">⏱️</span>
      <span className="reading-minutes">{minutes} min read</span>
    </div>
  )
}

// Word Count Goal Progress
function WordCountGoal({ current, goal }) {
  const percentage = Math.min((current / goal) * 100, 100)
  
  return (
    <div className="word-goal-widget">
      <div className="word-goal-header">
        <span className="word-goal-icon">📝</span>
        <span className="word-goal-title">Daily Goal</span>
        <span className="word-goal-pct">{Math.round(percentage)}%</span>
      </div>
      <div className="word-goal-bar">
        <div 
          className="word-goal-fill" 
          style={{ 
            width: `${percentage}%`,
            background: percentage >= 100 ? 'var(--accent-green)' : 'var(--accent)'
          }} 
        />
      </div>
      <div className="word-goal-counts">
        <span>{current.toLocaleString()}</span>
        <span>/ {goal.toLocaleString()} words</span>
      </div>
    </div>
  )
}

// Export Drafts Modal
function ExportDraftsModal({ drafts, onClose }) {
  const [exportFormat, setExportFormat] = useState('markdown')
  
  const exportContent = () => {
    let content = ''
    
    if (exportFormat === 'markdown') {
      drafts.forEach((draft, i) => {
        content += `# ${draft.title || `Draft ${i + 1}`}\n\n`
        content += `**Category:** ${draft.category || 'Uncategorized'}\n`
        content += `**Date:** ${new Date(draft.date).toLocaleDateString()}\n\n`
        content += `---\n\n`
        content += `${draft.hook || ''}\n\n`
        content += `---\n\n`
      })
    } else if (exportFormat === 'json') {
      content = JSON.stringify(drafts, null, 2)
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `renzo-drafts-${new Date().toISOString().split('T')[0]}.${exportFormat === 'markdown' ? 'md' : 'json'}`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const copyAllToClipboard = async () => {
    let text = ''
    drafts.forEach((draft, i) => {
      text += `${draft.title || `Draft ${i + 1}`}\n`
      text += `Category: ${draft.category || 'Uncategorized'}\n`
      text += `Date: ${new Date(draft.date).toLocaleDateString()}\n`
      if (draft.hook) text += `Hook: ${draft.hook}\n`
      text += '\n---\n\n'
    })
    
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 Export Drafts</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="export-info">
          <p>Export <strong>{drafts.length}</strong> drafts</p>
        </div>
        <div className="export-format">
          <label>Format:</label>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
            <option value="markdown">Markdown (.md)</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div className="export-actions">
          <button className="export-btn" onClick={exportContent}>
            📥 Download
          </button>
          <button className="export-btn copy" onClick={async () => {
            const success = await copyAllToClipboard()
            if (success) {
              alert('All drafts copied to clipboard!')
            }
          }}>
            📋 Copy All
          </button>
        </div>
      </div>
    </div>
  )
}

// Theme Toggle Component
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button 
      className="theme-toggle" 
      onClick={onToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

// Enhanced Animated Counter with direction
function AnimatedCounterWithDirection({ end, duration = 1500, suffix = '', showDirection = false }) {
  const [count, setCount] = useState(0)
  const [prevCount, setPrevCount] = useState(end)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setPrevCount(0)
        }
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

  const direction = count > prevCount ? 'up' : count < prevCount ? 'down' : 'neutral'

  return (
    <span ref={ref} className={`counter-${direction}`}>
      {count.toLocaleString()}{suffix}
      {showDirection && direction !== 'neutral' && (
        <span className={`counter-arrow ${direction}`}>{direction === 'up' ? '↑' : '↓'}</span>
      )}
    </span>
  )
}

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('renzo-theme')
    return saved ? saved === 'dark' : true
  })
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
  const [showHotTake, setShowHotTake] = useState(false)
  const [energyLevel, setEnergyLevel] = useState(80)
  const [wordsWritten, setWordsWritten] = useState(0)
  const [showQuickWrite, setShowQuickWrite] = useState(false)
  const [todayWordCount, setTodayWordCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('renzo-sound') !== 'false'
  })
  const [showFormula, setShowFormula] = useState(false)
  const [showTopicGenerator, setShowTopicGenerator] = useState(false)
  const [showClipboard, setShowClipboard] = useState(false)
  const [showBrainstorm, setShowBrainstorm] = useState(false)
  const [showExportDrafts, setShowExportDrafts] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [showReferencePanel, setShowReferencePanel] = useState(false)
  const [showResearchQueue, setShowResearchQueue] = useState(false)
  const [showSavedHooks, setShowSavedHooks] = useState(false)
  const [showWordSprint, setShowWordSprint] = useState(false)
  const [showArticleSeries, setShowArticleSeries] = useState(false)
  const [showCitationManager, setShowCitationManager] = useState(false)
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('renzo-activities')
    if (saved) {
      try { return JSON.parse(saved) } catch { return [] }
    }
    return [
      { type: 'sync', text: 'Notion sync completed', time: '2h ago' },
      { type: 'article', text: 'Published "Musclespan" article', time: '3h ago' },
      { type: 'prompt', text: 'Used writing prompt', time: '5h ago' },
    ]
  })
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
    addActivity('draft', `Created draft: "${draft.title.slice(0, 30)}..."`)
    addToast('Draft saved successfully!', 'success')
  }
  
  // Quick write save
  const saveQuickWrite = (data) => {
    const newDrafts = [{ ...data, category: 'Quick Write' }, ...drafts]
    setDrafts(newDrafts)
    localStorage.setItem('renzo-drafts', JSON.stringify(newDrafts))
    setWords(prev => prev + data.words)
    addActivity('draft', `Wrote ${data.words} words: "${data.title.slice(0, 30)}..."`)
    addToast(`Saved ${data.words} words!`, 'success')
  }
  
  // Add activity to timeline
  const addActivity = useCallback((type, text) => {
    const newActivity = { type, text, time: 'Just now' }
    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, 10)
      localStorage.setItem('renzo-activities', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Save focus to localStorage
  const saveFocus = (focus) => {
    setTodaysFocus(focus)
    localStorage.setItem('renzo-focus', focus)
    addToast('Focus updated!', 'success')
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('renzo-theme', newTheme ? 'dark' : 'light')
    document.body.classList.toggle('light-mode', !newTheme)
    addToast(newTheme ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info')
  }

  // Apply theme on mount
  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDarkMode)
  }, [])

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
      if (key === 'T') setShowTemplates(true)
      if (key === 'Y') setShowHotTake(true)
      if (key === 'D') setShowQuickDraft(true)
      if (key === 'H') setShowShortcuts(true)
      if (key === 'V') setShowVirality(true)
      if (key === 'W') setShowQuickWrite(true)
      if (key === 'F') setShowFormula(true)
      if (key === 'G') setShowTopicGenerator(true)
      if (key === 'C' && !e.metaKey && !e.ctrlKey) setShowClipboard(true)
      if (key === 'B') setShowBrainstorm(true)
      if (key === 'E') setShowExportDrafts(true)
      if (key === 'L') setShowChangelog(true)
      if (key === 'M') setShowFocusMode(true)
      if (key === 'R') setShowReferencePanel(true)
      if (key === 'O') setShowResearchQueue(true)
      if (key === 'U') setShowSavedHooks(true)
      if (key === 'S' && !e.metaKey && !e.ctrlKey) setShowWordSprint(true)
      if (key === 'Z') setShowArticleSeries(true)
      if (key === 'I') setShowCitationManager(true)
      if (key === '/') { e.preventDefault(); document.getElementById('article-search')?.focus() }
      if (key === 'ESCAPE') {
        setShowPrompt(false)
        setShowCommandPalette(false)
        setSearchQuery('')
        setShowQuickDraft(false)
        setShowShortcuts(false)
        setShowVirality(false)
        setShowQuickWrite(false)
        setShowFormula(false)
        setShowTopicGenerator(false)
        setShowClipboard(false)
        setShowBrainstorm(false)
        setShowChangelog(false)
        setShowTemplates(false)
        setShowFocusMode(false)
        setShowReferencePanel(false)
        setShowResearchQueue(false)
        setShowSavedHooks(false)
        setShowWordSprint(false)
        setShowArticleSeries(false)
        setShowCitationManager(false)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleCommand = (actionId) => {
    switch(actionId) {
      case 'new':
        setShowQuickWrite(true)
        break
      case 'prompt':
        setShowPrompt(true)
        addActivity('prompt', 'Opened writing prompt generator')
        break
      case 'virality':
        setShowVirality(true)
        break
      case 'hottake':
        setShowHotTake(true)
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
      case 'exportDrafts':
        setShowExportDrafts(true)
        break
      case 'templates':
        setShowTemplates(true)
        addActivity('prompt', 'Opened article templates')
        break
      case 'changelog':
        setShowChangelog(true)
        break
      case 'sync':
        addToast('Syncing with Notion...', 'info')
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
      {showHotTake && <HotTakeGenerator onClose={() => setShowHotTake(false)} />}
      {showFormula && <ContentFormulaRef isOpen={showFormula} onClose={() => setShowFormula(false)} />}
      {showQuickDraft && (
        <QuickDraftModal 
          onClose={() => setShowQuickDraft(false)} 
          onSave={saveDraft}
        />
      )}
      {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}
      {showVirality && <ViralityCalculator onClose={() => setShowVirality(false)} />}
      {showQuickWrite && (
        <QuickWriteMode 
          onClose={() => setShowQuickWrite(false)} 
          onSave={saveQuickWrite}
        />
      )}
      {showExportDrafts && (
        <ExportDraftsModal 
          drafts={drafts} 
          onClose={() => setShowExportDrafts(false)} 
        />
      )}
      {showChangelog && (
        <ChangelogModal 
          isOpen={showChangelog} 
          onClose={() => setShowChangelog(false)} 
        />
      )}
      {showTemplates && (
        <ArticleTemplates 
          isOpen={showTemplates} 
          onClose={() => setShowTemplates(false)}
          onSelect={(template) => {
            addToast(`Selected template: ${template.name}`, 'success')
          }}
        />
      )}
      {showFocusMode && (
        <FocusMode 
          isOpen={showFocusMode} 
          onClose={() => setShowFocusMode(false)}
          onSave={saveQuickWrite}
        />
      )}
      {showReferencePanel && (
        <QuickReferencePanel 
          isOpen={showReferencePanel} 
          onClose={() => setShowReferencePanel(false)}
        />
      )}
      {showResearchQueue && (
        <ResearchQueue 
          isOpen={showResearchQueue} 
          onClose={() => setShowResearchQueue(false)}
          onSelect={(item) => addToast(`Selected: ${item.topic}`, 'info')}
        />
      )}
      <SavedHooks 
        isOpen={showSavedHooks} 
        onClose={() => setShowSavedHooks(false)}
      />
      <WordSprint 
        isOpen={showWordSprint} 
        onClose={() => setShowWordSprint(false)}
        onSave={saveQuickWrite}
      />
      <ArticleSeriesTracker 
        isOpen={showArticleSeries} 
        onClose={() => setShowArticleSeries(false)}
      />
      <CitationManager
        isOpen={showCitationManager}
        onClose={() => setShowCitationManager(false)}
      />
      {showTopicGenerator && <TopicGenerator onClose={() => setShowTopicGenerator(false)} />}
      <ClipboardHistory isOpen={showClipboard} onClose={() => setShowClipboard(false)} />
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <BrainstormMode isOpen={showBrainstorm} onClose={() => setShowBrainstorm(false)} />
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
          <span className="logo-badge">v3.0</span>
        </div>
        <div className="header-right">
          <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
          <NotionSyncStatus onSync={() => addToast('Notion sync complete!', 'success')} />
          <button 
            className="sound-toggle" 
            onClick={() => { 
              const newVal = !soundEnabled
              setSoundEnabled(newVal)
              localStorage.setItem('renzo-sound', newVal)
              addToast(newVal ? 'Sound enabled' : 'Sound muted', 'info')
            }}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
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
              onSave={(f) => { saveFocus(f); addActivity('focus', `Set focus: ${f.slice(0, 30)}`) }}
            />
            <WordCountTracker onUpdate={setWordsWritten} />
          </div>
          <div className="hero-status">
            <EnergyMeter level={energyLevel} setLevel={setEnergyLevel} />
            <div className={`writing-indicator ${writingPulse ? 'active' : ''}`}>
              <span className="writing-dot"></span>
              <span className="writing-text">Ready to create</span>
            </div>
          </div>
        </section>

        {/* New Feature Cards Row */}
        <section className="new-features-row">
          <DailyQuote />
          <StudySpotlight />
          <QuickStatGenerator />
          <ContentCalendar />
          <WritingTimer onComplete={() => addToast('Session complete! Take a break ☕', 'success')} />
          <WritingStreakCalendar streak={metrics.currentStreak} articles={recentArticles} />
        </section>
        
        <section className="feature-buttons-row">
          <button className="feature-btn" onClick={() => setShowFormula(true)}>
            <span>📝</span>
            <span>Formula</span>
            <span className="feature-hint">F</span>
          </button>
          <button className="feature-btn" onClick={() => setShowTemplates(true)}>
            <span>📋</span>
            <span>Templates</span>
            <span className="feature-hint">T</span>
          </button>
          <button className="feature-btn" onClick={() => setShowTopicGenerator(true)}>
            <span>💡</span>
            <span>Topic</span>
            <span className="feature-hint">G</span>
          </button>
          <button className="feature-btn" onClick={() => setShowBrainstorm(true)}>
            <span>🧠</span>
            <span>Brainstorm</span>
            <span className="feature-hint">B</span>
          </button>
          <button className="feature-btn" onClick={() => setShowFocusMode(true)}>
            <span>🎯</span>
            <span>Focus</span>
            <span className="feature-hint">M</span>
          </button>
          <button className="feature-btn" onClick={() => setShowReferencePanel(true)}>
            <span>📚</span>
            <span>Refs</span>
            <span className="feature-hint">R</span>
          </button>
          <button className="feature-btn" onClick={() => setShowChangelog(true)}>
            <span>📜</span>
            <span>Changelog</span>
            <span className="feature-hint">L</span>
          </button>
          <button className="feature-btn" onClick={() => setShowWordSprint(true)}>
            <span>⚡</span>
            <span>Sprint</span>
            <span className="feature-hint">S</span>
          </button>
          <button className="feature-btn" onClick={() => setShowResearchQueue(true)}>
            <span>🔬</span>
            <span>Research</span>
            <span className="feature-hint">O</span>
          </button>
          <button className="feature-btn" onClick={() => setShowSavedHooks(true)}>
            <span>⚡</span>
            <span>Hooks</span>
            <span className="feature-hint">U</span>
          </button>
          <button className="feature-btn" onClick={() => setShowArticleSeries(true)}>
            <span>📚</span>
            <span>Series</span>
            <span className="feature-hint">Z</span>
          </button>
          <button className="feature-btn" onClick={() => setShowCitationManager(true)}>
            <span>📖</span>
            <span>Citations</span>
            <span className="feature-hint">I</span>
          </button>
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
                onClick={() => {
                  if (action.action === 'new') setShowQuickDraft(true)
                  else if (action.action === 'templates') setShowTemplates(true)
                  else if (action.action === 'prompt') setShowPrompt(true)
                  else if (action.action === 'hottake') setShowHotTake(true)
                  else if (action.action === 'trends') document.querySelector('.trending-section')?.scrollIntoView({ behavior: 'smooth' })
                  else if (action.action === 'shortcuts') setShowShortcuts(true)
                  else if (action.action === 'changelog') setShowChangelog(true)
                  else if (action.action === 'exportDrafts') setShowExportDrafts(true)
                  else if (action.action === 'sync') addToast('Syncing with Notion...', 'info')
                }}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
                <span className="action-shortcut">{action.shortcut}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Weekly Goals */}
        <section className="goals-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🎯</span>
              This Week's Goals
            </h2>
          </div>
          <WeeklyGoals />
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

        {/* Productivity Score */}
        <section className="productivity-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📈</span>
              Productivity Score
            </h2>
          </div>
          <ProductivityScore 
            articles={recentArticles} 
            words={metrics.totalWords} 
            streak={metrics.currentStreak} 
          />
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
          <div className="stat-pill">
            <span className="stat-label">Today</span>
            <span className="stat-value">{wordsWritten.toLocaleString()} words</span>
          </div>
        </section>

        {/* Activity Timeline */}
        <section className="activity-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">⚡</span>
              Activity Feed
            </h2>
          </div>
          <ActivityTimeline activities={activities} />
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
        <p className="footer-version">v2.9 • Press ⌘K for commands, H for shortcuts</p>
      </footer>
    </div>
  )
}

export default App
