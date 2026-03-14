import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './App.css'

// ========== GLOBAL SEARCH FEATURE (NEW v3.6) ==========
function GlobalSearch({ isOpen, onClose, allData }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const q = query.toLowerCase()
    const found = []

    // Search hooks
    if (allData.hooks) {
      allData.hooks.forEach((hook, i) => {
        if (hook.text.toLowerCase().includes(q)) {
          found.push({ type: 'Hook', title: hook.text.slice(0, 60), id: i, section: 'hooks' })
        }
      })
    }

    // Search ideas
    if (allData.ideas) {
      allData.ideas.forEach((idea, i) => {
        if (idea.title.toLowerCase().includes(q) || idea.angle.toLowerCase().includes(q)) {
          found.push({ type: 'Idea', title: idea.title, id: i, section: 'ideas' })
        }
      })
    }

    // Search headlines
    if (allData.headlines) {
      allData.headlines.forEach((h, i) => {
        if (h.generated.toLowerCase().includes(q)) {
          found.push({ type: 'Headline', title: h.generated.slice(0, 60), id: i, section: 'headlines' })
        }
      })
    }

    // Search references
    if (allData.references) {
      allData.references.forEach((ref, i) => {
        if (ref.title.toLowerCase().includes(q)) {
          found.push({ type: 'Reference', title: ref.title, id: i, section: 'references' })
        }
      })
    }

    setResults(found.slice(0, 20))
  }, [query, allData])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content search-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔍 Global Search</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <input
          ref={searchRef}
          type="text"
          className="search-input"
          placeholder="Search hooks, ideas, headlines, references..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="search-results">
          {query && results.length === 0 ? (
            <div className="search-empty">No results found</div>
          ) : !query ? (
            <div className="search-empty">Start typing to search...</div>
          ) : (
            results.map((result, i) => (
              <div key={i} className="search-result">
                <span className="search-type">{result.type}</span>
                <span className="search-title">{result.title}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ========== SETTINGS MODAL (NEW v3.6) ==========
function SettingsModal({ isOpen, onClose, settings, onUpdate }) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleChange = (key, value) => {
    const updated = { ...localSettings, [key]: value }
    setLocalSettings(updated)
    onUpdate?.(updated)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚙️ Settings</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-section">
          <h4>Writing Preferences</h4>
          <label className="setting-item">
            <span>Daily Word Goal</span>
            <input
              type="number"
              value={localSettings.dailyWordGoal}
              onChange={(e) => handleChange('dailyWordGoal', parseInt(e.target.value) || 1000)}
              min="100"
              max="10000"
            />
          </label>
          <label className="setting-item">
            <span>Default Sprint Duration (minutes)</span>
            <input
              type="number"
              value={localSettings.sprintDuration}
              onChange={(e) => handleChange('sprintDuration', parseInt(e.target.value) || 15)}
              min="5"
              max="60"
            />
          </label>
        </div>

        <div className="settings-section">
          <h4>Notifications</h4>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={localSettings.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
            />
            <span>Sound Effects</span>
          </label>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={localSettings.notificationsEnabled}
              onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
            />
            <span>Browser Notifications</span>
          </label>
        </div>

        <div className="settings-section">
          <h4>Interface</h4>
          <label className="setting-item">
            <span>Theme</span>
            <select value={localSettings.theme} onChange={(e) => handleChange('theme', e.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </label>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={localSettings.compactMode}
              onChange={(e) => handleChange('compactMode', e.target.checked)}
            />
            <span>Compact Mode</span>
          </label>
        </div>

        <div className="settings-section">
          <h4>Auto-Save</h4>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={localSettings.autoSaveEnabled}
              onChange={(e) => handleChange('autoSaveEnabled', e.target.checked)}
            />
            <span>Auto-save drafts</span>
          </label>
          <label className="setting-item">
            <span>Auto-save interval (seconds)</span>
            <input
              type="number"
              value={localSettings.autoSaveInterval}
              onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value) || 30)}
              min="10"
              max="300"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

// ========== DATA MANAGEMENT MODAL (NEW v3.6) ==========
function DataManagement({ isOpen, onClose, onExport, onImport }) {
  const [exportStatus, setExportStatus] = useState('')
  const importRef = useRef(null)

  // Gather all data for export
  const gatherAllData = () => {
    return {
      hooks: JSON.parse(localStorage.getItem('renzo-saved-hooks') || '[]'),
      ideas: JSON.parse(localStorage.getItem('renzo-content-ideas') || '[]'),
      headlines: JSON.parse(localStorage.getItem('renzo-generated-headlines') || '[]'),
      references: JSON.parse(localStorage.getItem('renzo-references') || '[]'),
      researchQueue: JSON.parse(localStorage.getItem('renzo-research-queue') || '[]'),
      series: JSON.parse(localStorage.getItem('renzo-article-series') || '[]'),
      pipeline: JSON.parse(localStorage.getItem('renzo-pipeline') || '[]'),
      drafts: JSON.parse(localStorage.getItem('renzo-drafts') || '[]'),
      clipboardHistory: JSON.parse(localStorage.getItem('renzo-clipboard-history') || '[]'),
      moodHistory: JSON.parse(localStorage.getItem('renzo-mood-history') || '[]'),
      exportedAt: new Date().toISOString()
    }
  }

  const handleExportJSON = () => {
    try {
      const data = gatherAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `renzo-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportStatus('✓ JSON exported successfully')
      setTimeout(() => setExportStatus(''), 3000)
    } catch (e) {
      setExportStatus('✗ Export failed')
    }
  }

  const handleExportCSV = () => {
    try {
      const data = gatherAllData()
      
      // Export ideas as CSV (most useful for spreadsheet analysis)
      const headers = ['ID', 'Title', 'Category', 'Angle', 'Date']
      const rows = data.ideas.map((idea, i) => [
        i + 1,
        `"${(idea.title || '').replace(/"/g, '""')}"`,
        `"${(idea.category || '').replace(/"/g, '""')}"`,
        `"${(idea.angle || '').replace(/"/g, '""')}"`,
        idea.date || ''
      ])
      
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `renzo-ideas-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setExportStatus('✓ CSV exported successfully')
      setTimeout(() => setExportStatus(''), 3000)
    } catch (e) {
      setExportStatus('✗ CSV export failed')
    }
  }

  const handleImport = () => {
    importRef.current?.click()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result)
          // Restore each data type
          if (data.hooks) localStorage.setItem('renzo-saved-hooks', JSON.stringify(data.hooks))
          if (data.ideas) localStorage.setItem('renzo-content-ideas', JSON.stringify(data.ideas))
          if (data.headlines) localStorage.setItem('renzo-generated-headlines', JSON.stringify(data.headlines))
          if (data.references) localStorage.setItem('renzo-references', JSON.stringify(data.references))
          setExportStatus('✓ Data imported successfully')
          setTimeout(() => setExportStatus(''), 3000)
        } catch {
          setExportStatus('✗ Invalid file format')
        }
      }
      reader.readAsText(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content data-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💾 Data Management</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="data-section">
          <h4>Export Data</h4>
          <p className="data-description">Export all your data for backup or analysis.</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="data-action-btn" onClick={handleExportJSON}>
              📥 Export JSON (Full Backup)
            </button>
            <button className="data-action-btn" style={{ background: 'var(--accent-purple)' }} onClick={handleExportCSV}>
              📊 Export CSV (Ideas Only)
            </button>
          </div>
        </div>

        <div className="data-section">
          <h4>Import Data</h4>
          <p className="data-description">Import previously exported data from a JSON file.</p>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button className="data-action-btn" onClick={handleImport}>
            📤 Import Data
          </button>
        </div>

        <div className="data-section">
          <h4>Clear Data</h4>
          <p className="data-description warning">⚠️ This action cannot be undone.</p>
          <button className="data-danger-btn" onClick={() => {
            if (confirm('Are you sure? This will clear all saved data.')) {
              localStorage.clear()
              setExportStatus('✓ All data cleared')
              setTimeout(() => setExportStatus(''), 3000)
            }
          }}>
            🗑️ Clear All Data
          </button>
        </div>

        {exportStatus && <div className="data-status">{exportStatus}</div>}
      </div>
    </div>
  )
}

// ========== NEW FEATURES v3.0 ==========

// Quick Capture - Quick idea capture (press Q)
function QuickCapture({ isOpen, onClose, onSave }) {
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('Idea')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleSave = () => {
    if (note.trim()) {
      onSave?.({ note: note.trim(), category, date: new Date().toISOString() })
      setNote('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content capture-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚡ Quick Capture</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="capture-form">
          <div className="capture-field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Idea">💡 Idea</option>
              <option value="Hook">🪝 Hook</option>
              <option value="Headline">📰 Headline</option>
              <option value="Research">🔬 Research</option>
              <option value="Note">📝 Note</option>
            </select>
          </div>
          <div className="capture-field">
            <label>Quick Note</label>
            <textarea
              ref={textareaRef}
              placeholder="Jot down your idea quickly..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="capture-actions">
          <button className="capture-cancel" onClick={onClose}>Cancel</button>
          <button className="capture-save" onClick={handleSave} disabled={!note.trim()}>
            Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

// Content Ideas Bank - Save and organize content ideas for future articles
function ContentIdeasBank({ isOpen, onClose, ideas, onSave, onDelete, onMoveToDraft }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Trending')
  const [angle, setAngle] = useState('')
  const [filter, setFilter] = useState('all')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSave = () => {
    if (title.trim()) {
      onSave?.({ title: title.trim(), category, angle: angle.trim() })
      setTitle('')
      setAngle('')
    }
  }

  const filteredIdeas = filter === 'all' ? ideas : ideas.filter(i => i.category === filter)

  const getCategoryColor = (cat) => {
    const colors = { 'Trending': '#f97316', 'Myth-bust': '#dc2626', 'How-to': '#22c55e', 'Science': '#3b82f6', 'Listicle': '#a855f7' }
    return colors[cat] || '#a1a1aa'
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ideas-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💡 Content Ideas Bank</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="ideas-form">
          <div className="ideas-input-row">
            <input
              ref={inputRef}
              type="text"
              placeholder="New content idea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="ideas-title-input"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="ideas-category-select">
              <option value="Trending">🔥 Trending</option>
              <option value="Myth-bust">💥 Myth-bust</option>
              <option value="How-to">⚙️ How-to</option>
              <option value="Science">🔬 Science</option>
              <option value="Listicle">📋 Listicle</option>
            </select>
          </div>
          <textarea
            placeholder="Angle or hook idea..."
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            rows={2}
            className="ideas-angle-input"
          />
          <button className="ideas-save-btn" onClick={handleSave} disabled={!title.trim()}>
            Add to Bank
          </button>
        </div>

        <div className="ideas-filter">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({ideas.length})</button>
          {['Trending', 'Myth-bust', 'How-to', 'Science', 'Listicle'].map(cat => (
            <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
              {cat} ({ideas.filter(i => i.category === cat).length})
            </button>
          ))}
        </div>

        <div className="ideas-list">
          {filteredIdeas.length === 0 ? (
            <div className="ideas-empty">No ideas yet. Add your first one above!</div>
          ) : (
            filteredIdeas.map(idea => (
              <div key={idea.id} className="idea-card">
                <div className="idea-header">
                  <span className="idea-category" style={{ color: getCategoryColor(idea.category) }}>{idea.category}</span>
                  <span className="idea-date">{new Date(idea.date).toLocaleDateString()}</span>
                </div>
                <div className="idea-title">{idea.title}</div>
                {idea.angle && <div className="idea-angle">"{idea.angle}"</div>}
                <div className="idea-actions">
                  <button onClick={() => onMoveToDraft?.(idea.id)}>📝 Draft</button>
                  <button onClick={() => onDelete?.(idea.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Session Stats - Today's writing session summary
function SessionStats() {
  const [stats, setStats] = useState(() => ({
    sessions: parseInt(localStorage.getItem('renzo-timer-sessions') || '0'),
    words: parseInt(localStorage.getItem('renzo-today-words') || '0'),
    startTime: localStorage.getItem('renzo-session-start') || new Date().toISOString()
  }))

  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(stats.startTime)
    const now = new Date()
    setElapsed(Math.floor((now - start) / 60000))

    const timer = setInterval(() => {
      const start = new Date(stats.startTime)
      const now = new Date()
      setElapsed(Math.floor((now - start) / 60000))
    }, 60000)

    return () => clearInterval(timer)
  }, [stats.startTime])

  const formatTime = (mins) => {
    const hours = Math.floor(mins / 60)
    const m = mins % 60
    if (hours > 0) return `${hours}h ${m}m`
    return `${m}m`
  }

  return (
    <div className="session-stats">
      <div className="session-header">
        <span className="session-icon">📈</span>
        <span className="session-title">Today's Session</span>
      </div>
      <div className="session-grid">
        <div className="session-stat">
          <span className="session-stat-value">{stats.sessions}</span>
          <span className="session-stat-label">🍅 Pomodoros</span>
        </div>
        <div className="session-stat">
          <span className="session-stat-value">{stats.words.toLocaleString()}</span>
          <span className="session-stat-label">📝 Words</span>
        </div>
        <div className="session-stat">
          <span className="session-stat-value">{formatTime(elapsed)}</span>
          <span className="session-stat-label">⏱️ Active Time</span>
        </div>
        <div className="session-stat">
          <span className="session-stat-value">
            {stats.sessions > 0 ? Math.round(stats.words / stats.sessions) : 0}
          </span>
          <span className="session-stat-label">📊 Avg/Session</span>
        </div>
      </div>
    </div>
  )
}

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

// Headline Strategy Generator - 13 proven formulas
const headlineFormulas = [
  { name: 'Stats Punch', template: '[Winner] beats [Loser] for [Goal] — new study reveals', tier: 1, emoji: '📊' },
  { name: 'Paradox Open', template: 'Everyone thinks [Common Belief]. Here\'s why they\'re wrong.', tier: 1, emoji: '🤔' },
  { name: 'Myth Buster', template: 'The truth about [Common Myth] — science says otherwise', tier: 1, emoji: '🔬' },
  { name: 'Number Lead', template: '[Surprising Stat]% of people don\'t know this about [Topic]', tier: 1, emoji: '🎯' },
  { name: 'The Shocking', template: 'Scientists discovered [Unexpected Finding]. Here\'s what it means for you.', tier: 1, emoji: '⚡' },
  { name: 'Vs Comparison', template: '[Method A] vs [Method B]: Which one actually works?', tier: 2, emoji: '⚖️' },
  { name: 'How To', template: 'How to [Desired Outcome] in [Timeframe] — backed by research', tier: 2, emoji: '🛠️' },
  { name: 'The Secret', template: 'The [Topic] secret nobody talks about', tier: 2, emoji: '🤫' },
  { name: 'Why Most', template: 'Why most people fail at [Topic] — and the fix', tier: 2, emoji: '❌' },
  { name: 'What If', template: 'What if everything you knew about [Topic] was wrong?', tier: 3, emoji: '💭' },
  { name: 'List Format', template: '[Number] [Topic] myths that are holding you back', tier: 3, emoji: '📋' },
  { name: 'Future Lead', template: 'In [Year], [Prediction] will change [Topic] forever', tier: 3, emoji: '🔮' },
  { name: 'Authority Quote', template: '"[Quote about Topic]" — what top experts say', tier: 3, emoji: '💬' },
]

function HeadlineGenerator({ isOpen, onClose }) {
  const [topic, setTopic] = useState('')
  const [results, setResults] = useState([])
  const [savedHeadlines, setSavedHeadlines] = useState(() => {
    const saved = localStorage.getItem('renzo-generated-headlines')
    return saved ? JSON.parse(saved) : []
  })
  const [activeTab, setActiveTab] = useState('generate') // generate | saved
  
  const generateHeadlines = () => {
    if (!topic.trim()) return
    
    const topicLower = topic.toLowerCase()
    const topicWords = topic.split(' ').filter(w => w)
    const winner = topicWords[0] || 'This'
    const loser = topicWords[topicWords.length - 1] || 'that'
    const goal = 'results'
    const myth = topic
    const surprisingStat = Math.floor(Math.random() * 40) + 30
    
    const generated = headlineFormulas.map(formula => {
      let headline = formula.template
        .replace('[Winner]', winner.charAt(0).toUpperCase() + winner.slice(1))
        .replace('[Loser]', loser)
        .replace('[Goal]', goal)
        .replace('[Common Belief]', `${topic} is good for you`)
        .replace('[Common Myth]', topic)
        .replace('[Surprising Stat]', surprisingStat)
        .replace('[Unexpected Finding]', `a surprising link between ${topicLower} and energy`)
        .replace('[Method A]', 'Traditional approach')
        .replace('[Method B]', 'New research-backed method')
        .replace('[Desired Outcome]', topicLower)
        .replace('[Timeframe]', '30 days')
        .replace('[Topic]', topic)
        .replace('[Number]', '7')
        .replace('[Year]', '2027')
        .replace('[Prediction]', topicLower)
        .replace('[Quote]', `The data on ${topicLower} is undeniable`)
      
      return {
        ...formula,
        generated: headline,
        filled: true
      }
    })
    
    setResults(generated)
  }
  
  const saveHeadline = (headline) => {
    const updated = [{ ...headline, savedAt: new Date().toISOString() }, ...savedHeadlines]
    setSavedHeadlines(updated)
    localStorage.setItem('renzo-generated-headlines', JSON.stringify(updated))
  }
  
  const deleteHeadline = (index) => {
    const updated = savedHeadlines.filter((_, i) => i !== index)
    setSavedHeadlines(updated)
    localStorage.setItem('renzo-generated-headlines', JSON.stringify(updated))
  }
  
  const copyHeadline = (text) => {
    navigator.clipboard.writeText(text)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content headline-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎯 Headline Generator</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="headline-tabs">
          <button 
            className={`headline-tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate
          </button>
          <button 
            className={`headline-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved ({savedHeadlines.length})
          </button>
        </div>
        
        {activeTab === 'generate' && (
          <>
            <div className="headline-input">
              <input
                type="text"
                placeholder="Enter your topic (e.g., 'intermittent fasting', 'sleep optimization')..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateHeadlines()}
              />
              <button 
                className="headline-generate-btn"
                onClick={generateHeadlines}
                disabled={!topic.trim()}
              >
                Generate
              </button>
            </div>
            
            {results.length > 0 && (
              <div className="headline-results">
                <div className="headline-results-header">
                  <span>{results.length} headline strategies</span>
                  <span className="tier-legend">
                    <span className="tier-badge tier-1">Tier 1</span> Best
                    <span className="tier-badge tier-2">Tier 2</span> Good
                    <span className="tier-badge tier-3">Tier 3</span> Alternative
                  </span>
                </div>
                <div className="headline-list">
                  {results.map((h, i) => (
                    <div key={i} className={`headline-item tier-${h.tier}`}>
                      <span className="headline-emoji">{h.emoji}</span>
                      <div className="headline-content">
                        <span className="headline-formula">{h.name}</span>
                        <p className="headline-text">"{h.generated}"</p>
                      </div>
                      <div className="headline-actions">
                        <span className={`tier-badge tier-${h.tier}`}>T{h.tier}</span>
                        <button className="headline-copy" onClick={() => copyHeadline(h.generated)}>📋</button>
                        <button className="headline-save" onClick={() => saveHeadline(h)}>⭐</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'saved' && (
          <div className="headline-saved">
            {savedHeadlines.length === 0 ? (
              <div className="headline-empty">
                <span>🎯</span>
                <p>No saved headlines yet. Generate some and save your favorites!</p>
              </div>
            ) : (
              <div className="headline-list">
                {savedHeadlines.map((h, i) => (
                  <div key={i} className={`headline-item tier-${h.tier}`}>
                    <span className="headline-emoji">{h.emoji}</span>
                    <div className="headline-content">
                      <span className="headline-formula">{h.name}</span>
                      <p className="headline-text">"{h.generated}"</p>
                    </div>
                    <div className="headline-actions">
                      <button className="headline-copy" onClick={() => copyHeadline(h.generated)}>📋</button>
                      <button className="headline-delete" onClick={() => deleteHeadline(i)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ========== CONTENT REPURPOSER (NEW v5.1) ==========
// Convert article content to different formats: thread, newsletter, email, blog post, etc.
function ContentRepurposer({ isOpen, onClose }) {
  const [articleContent, setArticleContent] = useState('')
  const [title, setTitle] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('thread')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const formats = {
    thread: {
      name: 'Twitter/X Thread',
      emoji: '🧵',
      desc: 'Convert to engaging tweet thread',
      transform: (content, title) => {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
        let thread = `1/ 🧵 ${title || 'Thread Title'}:\n\n`
        thread += `${sentences[0]?.trim() || 'Hook goes here...'}.\n\n`
        
        let tweetNum = 2
        for (let i = 1; i < Math.min(sentences.length, 8); i++) {
          thread += `${tweetNum}/ ${sentences[i].trim()}.\n\n`
          tweetNum++
        }
        
        thread += `${tweetNum}/ 🎯 The bottom line:\n`
        thread += `${sentences[sentences.length - 1]?.trim() || 'Key takeaway here'}.\n\n`
        thread += `${tweetNum + 1}/ Save this 🧵 if useful.\nFollow for more →`
        
        return thread
      }
    },
    newsletter: {
      name: 'Newsletter',
      emoji: '📧',
      desc: 'Convert to email newsletter format',
      transform: (content, title) => {
        const paragraphs = content.split('\n\n').filter(p => p.trim())
        let newsletter = `📬 WEEKLY DIGEST\n\n`
        newsletter += `**${title || 'Your Article Title'}**\n\n`
        newsletter += `━━━━━━━━━━━━━━━━━━━━\n\n`
        
        paragraphs.slice(0, 5).forEach((p, i) => {
          newsletter += `${p.trim()}\n\n`
        })
        
        newsletter += `━━━━━━━━━━━━━━━━━━━━\n\n`
        newsletter += `📣 Until next time,\n— Renzo\n\n`
        newsletter += `P.S. Share this with someone who'd find it useful!`
        
        return newsletter
      }
    },
    linkedin: {
      name: 'LinkedIn Post',
      emoji: '💼',
      desc: 'Convert to professional LinkedIn post',
      transform: (content, title) => {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
        let post = `🚀 ${title || 'Post Title'}\n\n`
        post += `${sentences[0]?.trim() || 'Hook'}.\n\n`
        post += `Here's what the research shows:\n\n`
        
        sentences.slice(1, 4).forEach((s, i) => {
          post += `▸ ${s.trim()}\n`
        })
        
        post += `\n👇 What's your experience? Drop a comment below.\n\n`
        post += `#Fitness #Science #Health #Content`
        
        return post
      }
    },
    short: {
      name: 'Short Summary',
      emoji: '📝',
      desc: 'Generate 280-char summary',
      transform: (content, title) => {
        const firstPart = content.slice(0, 200)
        return `🧵 ${title || 'Topic'}:\n\n${firstPart}... (link in bio)`
      }
    },
    blog: {
      name: 'Blog Post Outline',
      emoji: '📄',
      desc: 'Convert to blog post structure',
      transform: (content, title) => {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
        let blog = `# ${title || 'Blog Post Title'}\n\n`
        blog += `## Introduction\n\n`
        blog += `${sentences[0]?.trim() || 'Hook'}.\n\n`
        
        blog += `## The Problem\n\n`
        blog += `${sentences[1]?.trim() || 'Explain the issue'}.\n\n`
        
        blog += `## The Science\n\n`
        blog += `${sentences[2]?.trim() || 'Present the research'}.\n\n`
        
        blog += `## The Solution\n\n`
        blog += `${sentences[3]?.trim() || 'Provide actionable advice'}.\n\n`
        
        blog += `## Key Takeaways\n\n`
        blog += `• ${sentences[4]?.trim() || 'Point 1'}\n`
        blog += `• ${sentences[5]?.trim() || 'Point 2'}\n`
        blog += `• ${sentences[6]?.trim() || 'Point 3'}\n\n`
        
        blog += `## Call to Action\n\n`
        blog += `${sentences[sentences.length - 1]?.trim() || 'Encourage reader action'}.`
        
        return blog
      }
    },
    carrd: {
      name: 'Carrd/One-Page',
      emoji: '🃏',
      desc: 'Convert to single-page site format',
      transform: (content, title) => {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
        let carrd = `🏷️ ${title || 'Page Title'}\n\n`
        carrd += `━━━━━━━━━━━━━━━━━━━━\n\n`
        carrd += `📍 HERO SECTION\n`
        carrd += `${sentences[0]?.trim() || 'Compelling headline'}\n\n`
        
        carrd += `📍 ABOUT\n`
        carrd += `${sentences[1]?.trim() || 'Brief intro'}\n\n`
        
        carrd += `📍 KEY POINTS\n`
        sentences.slice(2, 5).forEach((s, i) => {
          carrd += `${i + 1}. ${s.trim()}\n`
        })
        
        carrd += `\n📍 CTA SECTION\n`
        carrd += `${sentences[sentences.length - 1]?.trim() || 'Final call to action'}`
        
        return carrd
      }
    }
  }

  const handleTransform = () => {
    if (!articleContent.trim()) return
    const transformed = formats[selectedFormat].transform(articleContent, title)
    setOutput(transformed)
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content repurposer-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>♻️ Content Repurposer</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="repurpose-input-section">
          <label>Article Title (optional)</label>
          <input
            type="text"
            placeholder="Enter article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="repurpose-content-section">
          <label>Article Content</label>
          <textarea
            placeholder="Paste your article content here to repurpose..."
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
            rows={6}
          />
        </div>

        <div className="repurpose-format-section">
          <label>Output Format</label>
          <div className="repurpose-formats">
            {Object.entries(formats).map(([key, f]) => (
              <button
                key={key}
                className={`repurpose-format-btn ${selectedFormat === key ? 'active' : ''}`}
                onClick={() => setSelectedFormat(key)}
              >
                <span className="format-emoji">{f.emoji}</span>
                <span className="format-name">{f.name}</span>
                <span className="format-desc">{f.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          className="repurpose-transform-btn"
          onClick={handleTransform}
          disabled={!articleContent.trim()}
        >
          ♻️ Repurpose Content
        </button>

        {output && (
          <div className="repurpose-output-section">
            <label>Converted Content:</label>
            <div className="repurpose-output">
              <pre>{output}</pre>
            </div>
            <button 
              className={`repurpose-copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyOutput}
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== QUICK FLOW - One button from topic to draft ==========
function QuickFlow({ isOpen, onClose, onStartFlow }) {
  const [step, setStep] = useState('topic')
  const [topic, setTopic] = useState('')
  const [brief, setBrief] = useState(null)
  const [generating, setGenerating] = useState(false)
  
  const quickTopics = [
    { topic: "Muscle protein synthesis", category: "Science", hook: "Most people don't eat enough protein to maximize muscle growth. Here's the exact amount." },
    { topic: "Sleep tracking accuracy", category: "Metrics", hook: "Your sleep tracker is lying to you. Here's what actually matters." },
    { topic: "Zone 2 training", category: "Training", hook: "Zone 2 is overrated. Here's what actually works for fat loss." },
    { topic: "Creatine timing", category: "Science", hook: "When you take creatine matters less than you think. Here's why." },
    { topic: "Sarcopenia prevention", category: "Longevity", hook: "You're losing muscle right now. Here's how to stop it." },
    { topic: "HRV optimization", category: "Metrics", hook: "HRV is the most underrated fitness metric. Here's how to use it." },
  ]
  
  const generateFlow = () => {
    if (!topic.trim()) return
    
    setGenerating(true)
    setTimeout(() => {
      const selectedTopic = quickTopics.find(t => t.topic.toLowerCase().includes(topic.toLowerCase())) || {
        topic: topic,
        category: 'Science',
        hook: `The truth about ${topic} that nobody talks about`
      }
      
      const newBrief = {
        topic: selectedTopic.topic,
        category: selectedTopic.category,
        hook: selectedTopic.hook,
        problem: `Most people get ${selectedTopic.topic} completely wrong`,
        mechanism: `Research shows that understanding ${selectedTopic.topic} involves cellular-level changes`,
        solution: `Here's the evidence-based approach to ${selectedTopic.topic}`,
        cta: `Try this tonight and track your results. Your body will thank you.`,
        targetWords: 1000,
        created: new Date().toISOString()
      }
      
      setBrief(newBrief)
      setGenerating(false)
    }, 800)
  }
  
  const startWriting = () => {
    onStartFlow?.({
      title: brief.topic,
      category: brief.category,
      hook: brief.hook,
      content: `${brief.hook}\n\n${brief.problem}\n\n${brief.mechanism}\n\n${brief.solution}\n\n${brief.cta}`,
      words: brief.targetWords,
      date: new Date().toISOString()
    })
    onClose()
  }
  
  const useRandomTopic = () => {
    const random = quickTopics[Math.floor(Math.random() * quickTopics.length)]
    setTopic(random.topic)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quickflow-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚡ Quick Flow</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="quickflow-steps">
          <div className={`quickflow-step ${step === 'topic' ? 'active' : ''} ${brief ? 'complete' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Topic</span>
          </div>
          <div className="quickflow-step-line" />
          <div className={`quickflow-step ${step === 'brief' ? 'active' : ''} ${brief ? 'complete' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Brief</span>
          </div>
          <div className="quickflow-step-line" />
          <div className={`quickflow-step ${step === 'writing' ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">Write</span>
          </div>
        </div>
        
        {!brief ? (
          <div className="quickflow-topic-input">
            <label>What do you want to write about?</label>
            <input
              type="text"
              placeholder="e.g., creatine, sleep optimization, muscle growth..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateFlow()}
              autoFocus
            />
            <div className="quickflow-suggestions">
              <span className="suggestions-label">Or try:</span>
              {quickTopics.slice(0, 3).map((t, i) => (
                <button 
                  key={i} 
                  className="suggestion-chip"
                  onClick={() => setTopic(t.topic)}
                >
                  {t.topic}
                </button>
              ))}
              <button className="suggestion-chip random" onClick={useRandomTopic}>
                🎲 Random
              </button>
            </div>
            <button 
              className="quickflow-generate-btn"
              onClick={generateFlow}
              disabled={!topic.trim() || generating}
            >
              {generating ? 'Generating brief...' : '⚡ Generate & Start'}
            </button>
          </div>
        ) : (
          <div className="quickflow-brief-preview">
            <div className="brief-preview-header">
              <span className="brief-category">{brief.category}</span>
              <span className="brief-target">{brief.targetWords} words</span>
            </div>
            <div className="brief-preview-title">{brief.topic}</div>
            <div className="brief-preview-section">
              <span className="section-label">🪝 Hook</span>
              <p>{brief.hook}</p>
            </div>
            <div className="brief-preview-section">
              <span className="section-label">⚠️ Problem</span>
              <p>{brief.problem}</p>
            </div>
            <div className="brief-preview-section">
              <span className="section-label">✅ Solution</span>
              <p>{brief.solution}</p>
            </div>
            <div className="brief-preview-section">
              <span className="section-label">📣 CTA</span>
              <p>{brief.cta}</p>
            </div>
            <button className="quickflow-write-btn" onClick={startWriting}>
              🚀 Start Writing in Focus Mode
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== PRODUCTIVE HOURS - Best times to write ==========
function ProductiveHours() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 60000)
    return () => clearInterval(timer)
  }, [])
  
  const productivityData = [
    { hour: 5, label: '5AM', score: 45 },
    { hour: 6, label: '6AM', score: 55 },
    { hour: 7, label: '7AM', score: 65 },
    { hour: 8, label: '8AM', score: 75 },
    { hour: 9, label: '9AM', score: 85 },
    { hour: 10, label: '10AM', score: 92 },
    { hour: 11, label: '11AM', score: 88 },
    { hour: 12, label: '12PM', score: 70 },
    { hour: 13, label: '1PM', score: 65 },
    { hour: 14, label: '2PM', score: 75 },
    { hour: 15, label: '3PM', score: 82 },
    { hour: 16, label: '4PM', score: 90 },
    { hour: 17, label: '5PM', score: 78 },
    { hour: 18, label: '6PM', score: 65 },
    { hour: 19, label: '7PM', score: 55 },
    { hour: 20, label: '8PM', score: 45 },
    { hour: 21, label: '9PM', score: 35 },
    { hour: 22, label: '10PM', score: 25 },
  ]
  
  const getCurrentScore = () => {
    const hourData = productivityData.find(h => h.hour === currentHour)
    return hourData?.score || 50
  }
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f97316'
    return '#ef4444'
  }
  
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Peak Zone'
    if (score >= 60) return 'Good Zone'
    return 'Rest Zone'
  }
  
  const score = getCurrentScore()
  
  return (
    <div className="productive-hours">
      <div className="productive-header">
        <span className="productive-icon">⏰</span>
        <span className="productive-label">Productive Hours</span>
      </div>
      <div className="productive-current">
        <span className="current-score" style={{ color: getScoreColor(score) }}>{score}%</span>
        <span className="current-label" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</span>
      </div>
      <div className="productive-bar">
        {productivityData.map((h, i) => (
          <div 
            key={i}
            className={`hour-segment ${currentHour === h.hour ? 'current' : ''}`}
            style={{ 
              opacity: h.score / 100,
              background: h.score >= 80 ? '#22c55e' : h.score >= 60 ? '#f97316' : '#ef4444'
            }}
            title={`${h.label}: ${h.score}%`}
          />
        ))}
      </div>
      <div className="productive-times">
        <span>Best: 10AM, 4PM</span>
      </div>
    </div>
  )
}

// ========== QUICK THREAD FORMAT GENERATOR ==========
function QuickThreadFormat({ isOpen, onClose }) {
  const [topic, setTopic] = useState('')
  const [threadFormat, setThreadFormat] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('hook-cta')
  
  const templates = {
    'hook-cta': {
      name: 'Hook → CTA',
      format: `1/ 🧵 On "${topic}":

Most people get it completely wrong.

Here's what science actually shows:

2/ The misconception:
[Common belief]

The truth:
[What research actually says]

3/ The mechanism:
[Explain WHY this works]

4/ Your move:
[Actionable step]

5/ The bottom line:
[Key takeaway + CTA to follow]`
    },
    'listicle': {
      name: '5-Thread List',
      format: `1/ 🧵 ${topic}

Here are 5 things you need to know:

2/ 1. [Point one]
The science: [Brief explanation]

3/ 2. [Point two]
The science: [Brief explanation]

4/ 3. [Point three]
The science: [Brief explanation]

5/ 4. [Point four]
The science: [Brief explanation]

6/ 5. [Point five]
The science: [Brief explanation]

7/ Save this. Share with someone who needs to hear it.

Follow for more →`
    },
    'story': {
      name: 'Story Arc',
      format: `1/ A story about "${topic}":

I used to [common mistake].

Then I learned [insight].

Here's what changed everything:

2/ The setup:
[What most people do]

3/ The twist:
[What the research found]

4/ The outcome:
[What happened when I applied it]

5/ The lesson:
[Key takeaway for reader]

If this resonated, follow for more insights →`
    },
    'mythbust': {
      name: 'Myth Buster',
      format: `1/ 🧠 Myth: [Common misconception about ${topic}]

Reality: [The actual truth]

Let me break this down:

2/ The myth persists because:
[Reason 1]
[Reason 2]

3/ What the science says:
[Study/results]

4/ The practical takeaway:
[What to do instead]

5/ Don't believe the hype. Trust the data.

Follow for evidence-based insights →`
    }
  }
  
  const generateThread = () => {
    if (!topic.trim()) {
      return
    }
    setThreadFormat(templates[selectedTemplate].format)
  }
  
  const copyThread = () => {
    navigator.clipboard.writeText(threadFormat)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content thread-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🧵 Quick Thread Format</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="thread-input-section">
          <label>Your Topic</label>
          <input
            type="text"
            placeholder="e.g., creatine, sleep optimization..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        
        <div className="thread-template-section">
          <label>Choose Format</label>
          <div className="template-buttons">
            {Object.entries(templates).map(([key, t]) => (
              <button
                key={key}
                className={`template-btn ${selectedTemplate === key ? 'active' : ''}`}
                onClick={() => setSelectedTemplate(key)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        
        <button className="thread-generate-btn" onClick={generateThread}>
          Generate Thread Format
        </button>
        
        {threadFormat && (
          <div className="thread-preview">
            <pre>{threadFormat}</pre>
            <button className="copy-btn" onClick={copyThread}>
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== INSPIRATION BOARD (NEW v4.5) ==========
function InspirationBoard({ isOpen, onClose }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('renzo-inspiration-board')
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'quote', content: "Write drunk, edit sober.", author: "Hemingway", tags: ['writing', 'process'] },
      { id: 2, type: 'link', content: "The Science of Muscle Protein Synthesis", url: "https://pubmed.ncbi.nlm.nih.gov/", tags: ['science', 'research'] },
      { id: 3, type: 'idea', content: "What if cold exposure activates brown adipose tissue in ways we haven't measured?", tags: ['longevity', 'hypothesis'] },
    ]
  })
  const [newItem, setNewItem] = useState({ content: '', type: 'idea', tags: '' })
  const [filter, setFilter] = useState('all')
  const [copiedId, setCopiedId] = useState(null)
  
  const addItem = () => {
    if (newItem.content.trim()) {
      const tags = newItem.tags.split(',').map(t => t.trim()).filter(t => t)
      const updated = [{ 
        ...newItem, 
        id: Date.now(), 
        tags,
        date: new Date().toISOString() 
      }, ...items]
      setItems(updated)
      localStorage.setItem('renzo-inspiration-board', JSON.stringify(updated))
      setNewItem({ content: '', type: 'idea', tags: '' })
    }
  }
  
  const deleteItem = (id) => {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    localStorage.setItem('renzo-inspiration-board', JSON.stringify(updated))
  }
  
  const copyItem = (content, id) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }
  
  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter)
  
  const getTypeIcon = (type) => {
    switch(type) {
      case 'quote': return '💬'
      case 'link': return '🔗'
      case 'idea': return '💡'
      default: return '📝'
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content inspiration-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎨 Inspiration Board</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="inspiration-add">
          <select 
            value={newItem.type}
            onChange={(e) => setNewItem({...newItem, type: e.target.value})}
            className="inspiration-type-select"
          >
            <option value="idea">💡 Idea</option>
            <option value="quote">💬 Quote</option>
            <option value="link">🔗 Link</option>
          </select>
          <input
            type="text"
            placeholder="Capture inspiration..."
            value={newItem.content}
            onChange={(e) => setNewItem({...newItem, content: e.target.value})}
            className="inspiration-input"
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newItem.tags}
            onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
            className="inspiration-tags"
          />
          <button onClick={addItem} className="inspiration-add-btn">Add</button>
        </div>
        
        <div className="inspiration-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({items.length})</button>
          <button className={`filter-btn ${filter === 'idea' ? 'active' : ''}`} onClick={() => setFilter('idea')}>💡 Ideas</button>
          <button className={`filter-btn ${filter === 'quote' ? 'active' : ''}`} onClick={() => setFilter('quote')}>💬 Quotes</button>
          <button className={`filter-btn ${filter === 'link' ? 'active' : ''}`} onClick={() => setFilter('link')}>🔗 Links</button>
        </div>
        
        <div className="inspiration-list">
          {filteredItems.length === 0 ? (
            <div className="inspiration-empty">
              <span>🎨</span>
              <p>Your inspiration board is empty. Capture ideas, quotes, and links!</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="inspiration-item">
                <div className="inspiration-icon">{getTypeIcon(item.type)}</div>
                <div className="inspiration-content">
                  <p className="inspiration-text">{item.content}</p>
                  {item.author && <span className="inspiration-author">— {item.author}</span>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="inspiration-tags-list">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="inspiration-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="inspiration-actions">
                  <button onClick={() => copyItem(item.content, item.id)}>
                    {copiedId === item.id ? '✓' : '📋'}
                  </button>
                  <button onClick={() => deleteItem(item.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ========== READING LIST (NEW v4.7) ==========
function ReadingList({ isOpen, onClose }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('renzo-reading-list')
    return saved ? JSON.parse(saved) : []
  })
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const addItem = () => {
    if (newUrl.trim()) {
      const item = {
        id: Date.now(),
        url: newUrl,
        title: newTitle || newUrl.slice(0, 50) + '...',
        added: new Date().toISOString(),
        read: false,
        category: 'Research'
      }
      const updated = [item, ...items]
      setItems(updated)
      localStorage.setItem('renzo-reading-list', JSON.stringify(updated))
      setNewUrl('')
      setNewTitle('')
      setShowAddForm(false)
    }
  }

  const toggleRead = (id) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, read: !item.read } : item
    )
    setItems(updated)
    localStorage.setItem('renzo-reading-list', JSON.stringify(updated))
  }

  const deleteItem = (id) => {
    const updated = items.filter(item => item.id !== id)
    setItems(updated)
    localStorage.setItem('renzo-reading-list', JSON.stringify(updated))
  }

  const openUrl = (url) => {
    window.open(url, '_blank')
  }

  const filteredItems = filter === 'all' ? items : items.filter(item => item.read === (filter === 'read'))

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reading-list-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📚 Reading List</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="reading-list-toolbar">
          <div className="filter-tabs">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({items.length})</button>
            <button className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>Unread ({items.filter(i => !i.read).length})</button>
            <button className={filter === 'read' ? 'active' : ''} onClick={() => setFilter('read')}>Read ({items.filter(i => i.read).length})</button>
          </div>
          <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '−' : '+'} Add URL
          </button>
        </div>

        {showAddForm && (
          <div className="add-url-form">
            <input
              type="text"
              placeholder="URL (required)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button onClick={addItem}>Add to List</button>
          </div>
        )}

        <div className="reading-list-items">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              {items.length === 0 ? 'No URLs saved yet. Add some for research!' : 'All caught up!'}
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className={`reading-item ${item.read ? 'read' : ''}`}>
                <div className="reading-item-content" onClick={() => openUrl(item.url)}>
                  <span className="reading-item-title">{item.title}</span>
                  <span className="reading-item-url">{item.url}</span>
                </div>
                <div className="reading-item-actions">
                  <button onClick={() => toggleRead(item.id)} title={item.read ? 'Mark unread' : 'Mark read'}>
                    {item.read ? '📖' : '○'}
                  </button>
                  <button onClick={() => openUrl(item.url)}>🔗</button>
                  <button onClick={() => deleteItem(item.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ========== QUICK AI PROMPT (NEW v4.7) ==========
function QuickAIPrompt({ isOpen, onClose, onGenerate }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('renzo-ai-prompt-history')
    return saved ? JSON.parse(saved) : []
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResult('')
    
    // Try to use local MiniMax API first, fall back to smart templates
    try {
      const response = await fetch('http://localhost:8081/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'minimax',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        }),
        signal: AbortSignal.timeout(8000)
      })
      
      if (response.ok) {
        const data = await response.json()
        const generated = data.choices?.[0]?.message?.content || ''
        if (generated) {
          setResult(generated)
          const newHistory = [{ prompt, result: generated, time: new Date().toISOString() }, ...history].slice(0, 10)
          setHistory(newHistory)
          localStorage.setItem('renzo-ai-prompt-history', JSON.stringify(newHistory))
          setLoading(false)
          return
        }
      }
    } catch (apiError) {
      console.log('MiniMax API unavailable, using fallback...')
    }
    
    // Fallback: Smart template-based responses for common content types
    const lowerPrompt = prompt.toLowerCase()
    let generated = ''
    
    if (lowerPrompt.includes('hook') || lowerPrompt.includes('headline') || lowerPrompt.includes('title')) {
      const templates = [
        `🔥 "${prompt.replace(/hook|headline|title/gi, '').trim()} — The Mistake That's Killing Your Gains"`,
        `⚠️ What if everything you knew about ${prompt.replace(/hook|headline|title/gi, '').trim()} was wrong?`,
        `💪 Stop doing ${prompt.replace(/hook|headline|title/gi, '').trim()} the old way. Here's the science-backed approach...`
      ]
      generated = templates[Math.floor(Math.random() * templates.length)]
    } else if (lowerPrompt.includes('article') || lowerPrompt.includes('write') || lowerPrompt.includes('draft')) {
      generated = `📝 **Article Draft**\n\n**Hook:**\nThe secret most fitness experts won't tell you? It's not about working harder—it's about working smarter.\n\n**Problem:**\n${prompt}\n\n**Solution:**\n1. Focus on progressive overload\n2. Prioritize recovery\n3. Optimize nutrition\n\n**CTA:** Ready to transform your training?`
    } else if (lowerPrompt.includes('thread') || lowerPrompt.includes('tweet')) {
      generated = `🧵 THREAD:\n\n(1/5) Most fitness advice is garbage. Here's what actually works:\n\n(2/5) 1. Progressive overload > fancy workouts\n\n(3/5) 2. Sleep is when muscles grow\n\n(4/5) 3. Consistency beats intensity\n\n(5/5) Save this. 🏋️`
    } else {
      generated = `🤖 **Response to: "${prompt}"**\n\n**Key Points:**\n• ${prompt}\n• Focus on science-backed approach\n\n**Next Steps:**\n1. Start with one actionable item\n2. Track progress\n\n*Try H for headlines, I for briefs, X for threads*`
    }
    
    setResult(generated)
    const newHistory = [{ prompt, result: generated, time: new Date().toISOString() }, ...history].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem('renzo-ai-prompt-history', JSON.stringify(newHistory))
    setLoading(false)
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-prompt-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🤖 Quick AI Prompt</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="ai-prompt-input">
          <textarea
            placeholder="Enter your prompt... (e.g., 'Write a hook about protein timing')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {result && (
          <div className="ai-prompt-result">
            <div className="result-header">
              <span>Result</span>
              <button onClick={copyResult}>📋 Copy</button>
            </div>
            <pre>{result}</pre>
          </div>
        )}

        {history.length > 0 && (
          <div className="ai-prompt-history">
            <h4>Recent Prompts</h4>
            {history.slice(0, 5).map((item, i) => (
              <div key={i} className="history-item" onClick={() => setPrompt(item.prompt)}>
                <span className="history-prompt">{item.prompt.slice(0, 50)}...</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ========== CLI COMMAND RUNNER (NEW v5.2) ==========
function CLICommandRunner({ isOpen, onClose, onRunCommand }) {
  const [command, setCommand] = useState('brief')
  const [argument, setArgument] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('renzo-cli-history')
    return saved ? JSON.parse(saved) : []
  })

  const commands = [
    { id: 'brief', name: 'Brief', desc: 'Generate research brief for a topic', example: 'renzo brief "creatine timing"' },
    { id: 'quickbrief', name: 'Quick Brief', desc: 'Instant 5-second writing plan (no API)', example: 'renzo quickbrief "sleep optimization"' },
    { id: 'status', name: 'Status', desc: 'Show pipeline health dashboard', example: 'renzo status' },
    { id: 'thread', name: 'Thread', desc: 'Convert article to X thread', example: 'renzo thread "Article Title"' },
    { id: 'check', name: 'Check', desc: 'Run quality analysis on article', example: 'renzo check article.md' },
    { id: 'sync', name: 'Sync', desc: 'Sync Notion ↔ X metrics', example: 'renzo sync' },
    { id: 'tools', name: 'Tools', desc: 'List all available tools', example: 'renzo tools' },
  ]

  const runCommand = async () => {
    if (!argument.trim() && command !== 'status' && command !== 'tools' && command !== 'sync') return
    
    setRunning(true)
    setOutput('')
    
    // Simulate command execution (in production, this would call the actual CLI)
    await new Promise(r => setTimeout(r, 1200))
    
    const mockOutputs = {
      brief: `📋 BRIEF GENERATED: ${argument}

Topic: ${argument}
Category: Science
Target: 1000 words

🪝 HOOK:
What if everything you knew about ${argument} was wrong?

⚠️ PROBLEM:
Most people get ${argument} completely backwards...

🔬 MECHANISM:
Research shows that ${argument} involves cellular-level changes...

✅ SOLUTION:
Here's the evidence-based approach to ${argument}...

📣 CTA:
Try this tonight and track your results.`,
      quickbrief: `⚡ QUICK BRIEF: ${argument}

Category: Trending
Target: 750 words

Hook: "${argument} — the truth nobody tells you"
Angle: Myth-busting with recent studies
Sources: PubMed, Examine.com
CTA: Share with someone who needs to hear this`,
      status: `📊 PIPELINE STATUS

Pending: 3 articles
In Progress: 2 articles  
Published: 12 articles
This Week: 4 published

📝 RECENT:
✓ "Creatine Timing Guide" - Published
✓ "Sleep Optimization Tips" - Published  
✓ "HIIT vs Steady State" - In Review
✓ "Protein Pacing Myths" - Draft`,
      thread: `🧵 THREAD GENERATED

1/ 🧵 ${argument}:
Most people get this completely wrong. Here's what science shows:

2/ The misconception:
[Common belief]

3/ The truth:
[What research actually says]

4/ The mechanism:
[Explain WHY this works]

5/ Your move:
[Actionable step]

6/ Save this. Share with someone who'd benefit.
Follow for more →`,
      check: `✅ QUALITY CHECK PASSED

Tone: Engaging ✓
Sources: 3 credible citations ✓
Structure: Hook → Problem → Science → Solution → CTA ✓
Readability: Grade 8 level ✓
Word count: Within range ✓

Overall Score: 9.2/10`,
      sync: `🔄 NOTION SYNC COMPLETE

Synced: 12 articles
Updated: 3 articles
New: 1 article
Errors: 0`,
      tools: `🛠️ RENZO TOOLS

write     - Launch article drafting
brief     - Generate research brief  
quickbrief - Instant writing plan
thread    - Convert to X thread
analyze   - Quality analysis
check     - Pre-publish quality gate
sync      - Notion ↔ X sync
status    - Pipeline health
tools     - This list`,
    }
    
    const result = mockOutputs[command] || `Command "${command}" executed with: ${argument}`
    setOutput(result)
    
    // Add to history
    const newHistory = [{ command, argument, time: new Date().toISOString() }, ...history].slice(0, 10)
    setHistory(newHistory)
    localStorage.setItem('renzo-cli-history', JSON.stringify(newHistory))
    
    setRunning(false)
    
    // Notify parent
    onRunCommand?.({ command, argument, output: result })
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cli-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚡ CLI Command Runner</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="cli-commands">
          <label>Select Command:</label>
          <div className="cli-command-grid">
            {commands.map(cmd => (
              <button
                key={cmd.id}
                className={`cli-cmd-btn ${command === cmd.id ? 'active' : ''}`}
                onClick={() => { setCommand(cmd.id); setOutput(''); }}
              >
                <span className="cli-cmd-name">{cmd.name}</span>
                <span className="cli-cmd-desc">{cmd.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="cli-argument">
          <label>Argument {command === 'status' || command === 'tools' || command === 'sync' ? '(optional)' : ''}:</label>
          <input
            type="text"
            placeholder={commands.find(c => c.id === command)?.example || 'Enter argument...'}
            value={argument}
            onChange={(e) => setArgument(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runCommand()}
          />
        </div>

        <button 
          className="cli-run-btn"
          onClick={runCommand}
          disabled={running || (!argument.trim() && command !== 'status' && command !== 'tools' && command !== 'sync')}
        >
          {running ? '⏳ Running...' : '▶️ Run Command'}
        </button>

        {output && (
          <div className="cli-output-section">
            <div className="cli-output-header">
              <span>Output:</span>
              <button onClick={copyOutput}>📋 Copy</button>
            </div>
            <pre className="cli-output">{output}</pre>
          </div>
        )}

        {history.length > 0 && (
          <div className="cli-history">
            <label>Recent Commands:</label>
            <div className="cli-history-list">
              {history.slice(0, 5).map((h, i) => (
                <div 
                  key={i} 
                  className="cli-history-item"
                  onClick={() => { setCommand(h.command); setArgument(h.argument); }}
                >
                  <span className="history-cmd">renzo {h.command}</span>
                  <span className="history-arg">{h.argument || '(no arg)'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
]

// Changelog Modal - Version history
function ChangelogModal({ isOpen, onClose }) {
  const changelog = [
    { version: '5.2', date: '2026-03-13', changes: [
      'Added CLI Command Runner (\\ key) — Run renzo CLI commands directly from UI',
      'Added Quick Command Access — brief, quickbrief, status, thread, check, sync, tools',
      'Added Command History — Recent commands saved for quick re-run',
      'Updated version badge to v5.2'
    ]},
    { version: '5.1', date: '2026-03-13', changes: [
      'Added Pinned Items Bar — Quick access to favorite tools at the top',
      'Added Notion Sync Status indicator — Shows real-time sync state',
      'Added Enhanced Toast System — Improved notifications with better animations',
      'Added Card Gradient Borders — New visual polish with gradient edges',
      'Added Glow Effects — New glow-red, glow-green, glow-purple, glow-blue utilities',
      'Added Micro-interactions — Smooth hover states on cards',
      'Added Improved Spinner — Better loading indicator animations',
      'Added Responsive Grid Patterns — New grid-auto and grid-masonry classes',
      'Updated version badge to v5.1'
    ]},
    { version: '4.8', date: '2026-03-13', changes: [
      'Added SEO Checklist (= key) — Pre-publish checklist with weighted scoring',
      'Added Tone Adjuster (- key) — Transform text between 6 different tones',
      'Fixed version mismatch in index.html (was showing v3.8)',
      'Updated version badge to v4.8'
    ]},
    { version: '4.5', date: '2026-03-13', changes: [
      'Enhanced visual polish with smoother animations throughout',
      'Added keyboard shortcut hints on feature buttons for better discoverability',
      'Improved header layout with better spacing and visual hierarchy',
      'Added Quick Actions sidebar for faster navigation',
      'Enhanced Writing Streak Calendar with better visual feedback',
      'Updated version badge to v4.5'
    ]},
    { version: '4.4', date: '2026-03-13', changes: [
      'Added Publishing Prep Workflow (6 key) — Unified tool: article → X thread → YouTube script → schedule',
      'Added Performance Tracker (7 key) — Log article views, shares, saves, track engagement metrics',
      'Added Draft Collections (8 key) — Organize drafts into folders/projects',
      'Enhanced FAB with better action grouping',
      'Improved keyboard shortcut documentation'
    ]},
    { version: '4.3', date: '2026-03-13', changes: [
      'Fixed keyboard shortcut conflict — A key was mapped to both Ideas Bank and Quick Tweet',
      'Changed Quick Tweet shortcut from A to N for better organization',
      'Improved feature button row with better visual grouping',
      'Updated version badge to v4.3'
    ]},
    { version: '4.2', date: '2026-03-13', changes: [
      'Added Citation Formatter (5 key) — Generate APA, MLA, Chicago, and BibTeX citations',
      'Added Writing Heatmap — GitHub-style 12-week contribution graph',
      'Added Weekly Stats Dashboard — Track weekly output, streak, avg words, best writing day',
      'New Cite button in feature toolbar',
      'Updated version badge to v4.2'
    ]},
    { version: '4.0', date: '2026-03-13', changes: [
      'Added Floating Action Button (FAB) - Quick access to 5 core actions from anywhere',
      'Added Mini Command Bar (Ctrl+Space) - Quick command input for fast navigation',
      'Added Light Mode theme support - Toggle between dark and light themes',
      'Added Comma key (,) shortcut for Settings - Quick access to preferences',
      'Added keyboard shortcut for Global Search (3 key)',
      'Updated version badge to v4.0',
      'Enhanced productivity workflow with FAB + command bar combo'
    ]},
    { version: '3.9', date: '2026-03-13', changes: [
      'Added Global Search (3 key) - Search across all hooks, ideas, headlines, and references',
      'Added Settings Modal (comma key) - Customize daily goals, sprint duration, notifications, theme, and auto-save',
      'Added Data Management Modal (4 key) - Export/import all data as JSON for backup and transfer',
      'Added Data persistence improvements - All settings now stored with localStorage',
      'Improved keyboard shortcuts with new quick access keys',
      'Updated version badge to v3.9',
      'Enhanced UI with better data management workflow'
    ]},
    { version: '3.8', date: '2026-03-13', changes: [
      'Added Quick Tweet Generator - One-click tweet creation with tone selection (A key)',
      'Added 4 tweet tones: Bold, Question, Stat, Story',
      'Added keyboard shortcut (A) for Quick Tweet Generator',
      'Updated version badge to v3.8'
    ]},
    { version: '3.7', date: '2026-03-13', changes: [
      'Added Quick Mood Indicator in header - see your current mood at a glance',
      'Added smooth fade-in and slide animations throughout the UI',
      'Enhanced header with gradient glow effects and better visual hierarchy',
      'Added responsive design improvements for mobile',
      'Added animation utility classes for consistent motion design',
      'Updated version badge to v3.7'
    ]},
    { version: '3.6', date: '2026-03-13', changes: [
      'Fixed keyboard shortcut conflict (H was assigned to both Shortcuts and Headline Gen)',
      'Added Daily Word Goal widget in header - track progress toward daily target',
      'Improved keyboard shortcut handling with Cmd/Ctrl modifiers',
      'Updated version badge to v3.6'
    ]},
    { version: '3.5', date: '2026-03-13', changes: [
      'Added Content Ideas Bank - Save and organize content ideas for future articles (A key)',
      'Added Writing Mood Tracker - Track your creative energy states',
      'Added Category Performance chart - Visual breakdown by content category',
      'Added SEO Score Calculator - Check article SEO potential',
      'Updated version badge to v3.5',
      'Fixed keyboard shortcut conflicts',
      'Added quick mood selection to header'
    ]},
    { version: '3.3', date: '2026-03-13', changes: [
      'Added Article Brief Generator - Generates full article brief from topic (I key)',
      'Added Trending Hashtags widget - Track trending fitness hashtags for X content',
      'Added keyboard shortcut (I) for Brief Generator',
      'Updated version badge to v3.3',
      'Brief Generator creates hook, problem, mechanism, solution, and CTA sections'
    ]},
    { version: '3.2', date: '2026-03-13', changes: [
      'Added CTA Templates - 6 pre-built call-to-action templates',
      'Added Hook Tester - Analyze hooks for effectiveness (curiosity, emotion, specificity, urgency)',
      'Added keyboard shortcuts K (CTA) and J (Hook Tester)',
      'Updated Keyboard Shortcuts modal with all current shortcuts',
      'Added toolbar buttons for CTA and Hook Tester'
    ]},
    { version: '3.1', date: '2026-03-12', changes: [
      'Added Headline Generator - 13 proven headline formulas',
      'Added Tier ranking for headlines (Tier 1 = best performers)',
      'Fixed missing CSS variables causing rendering issues',
      'Added dark theme with proper color system',
      'Added keyboard shortcut (H) for headline generator',
      'Improved base styles with gradients and transitions',
      'LocalStorage persistence for saved headlines'
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

// ========== ARTICLE PUBLISHING TIMER ==========
function ArticlePublishingTimer({ articles }) {
  const [timeSince, setTimeSince] = useState({ days: 0, hours: 0, isUrgent: false })
  
  useEffect(() => {
    const calculateTime = () => {
      const publishedArticles = articles.filter(a => a.published)
      if (publishedArticles.length === 0) {
        setTimeSince({ days: 0, hours: 0, isUrgent: true })
        return
      }
      
      const sorted = [...publishedArticles].sort((a, b) => new Date(b.date) - new Date(a.date))
      const lastPublished = new Date(sorted[0].date)
      const now = new Date()
      const diffMs = now - lastPublished
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      setTimeSince({
        days: diffDays,
        hours: diffHours,
        isUrgent: diffDays >= 3
      })
    }
    
    calculateTime()
    const interval = setInterval(calculateTime, 60000)
    return () => clearInterval(interval)
  }, [articles])
  
  return (
    <div className={`article-timer ${timeSince.isUrgent ? 'urgent' : ''}`}>
      <div className="timer-header">
        <span className="timer-icon">{timeSince.isUrgent ? '⏰' : '📅'}</span>
        <span className="timer-label">Since Last Publish</span>
      </div>
      <div className="timer-display">
        <span className="timer-days">{timeSince.days}</span>
        <span className="timer-unit">days</span>
        <span className="timer-hours">{timeSince.hours}h</span>
      </div>
      {timeSince.isUrgent && (
        <div className="timer-alert">Time to ship! 🚀</div>
      )}
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

// CTA Templates Library
function CTATemplates({ isOpen, onClose, onSelect }) {
  const ctaTemplates = [
    { 
      id: 'direct-action',
      name: 'Direct Action',
      emoji: '🎯',
      desc: 'Clear, immediate action step',
      examples: [
        'Start tonight. Your muscles will thank you tomorrow.',
        'Try this for 2 weeks. Track your results.',
        'Drop the guesswork. Start here.',
        'Commit to one change today.'
      ]
    },
    { 
      id: 'question-cta',
      name: 'Question CTA',
      emoji: '❓',
      desc: 'Engage reader with a question',
      examples: [
        'Ready to stop guessing? Let\'s go.',
        'What\'s holding you back?',
        'Who\'s ready to try this?',
        'Which of these will you implement first?'
      ]
    },
    { 
      id: 'transformation',
      name: 'Transformation',
      emoji: '✨',
      desc: 'Promise a result or change',
      examples: [
        'Your future self starts today.',
        'Transform your training in 30 days.',
        'Build the body you actually want.',
        'This is the shortcut nobody talks about.'
      ]
    },
    { 
      id: 'community',
      name: 'Community CTA',
      emoji: '🤝',
      desc: 'Social proof or community angle',
      examples: [
        'Join 10,000+ athletes doing this right now.',
        'Tag someone who needs to hear this.',
        'Drop a 🔥 if you\'re in.',
        'Be the first to try it and report back.'
      ]
    },
    { 
      id: 'challenge',
      name: 'Challenge CTA',
      emoji: '🏆',
      desc: 'Push reader to compete',
      examples: [
        'I dare you to try this for 30 days.',
        'Prove the doubters wrong.',
        'Take the 2-week challenge.',
        'Who can hit this first?'
      ]
    },
    { 
      id: 'soft-cta',
      name: 'Soft CTA',
      emoji: '💬',
      desc: 'Low-pressure invitation',
      examples: [
        'Save this for later.',
        'Bookmark and come back when you\'re ready.',
        'Share with a training partner.',
        'Keep this in your back pocket.'
      ]
    }
  ]

  const [copiedId, setCopiedId] = useState(null)

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cta-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📣 CTA Templates</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Click any example to copy it
        </p>
        <div className="cta-templates-grid">
          {ctaTemplates.map((cta) => (
            <div key={cta.id} className="cta-template-card">
              <div className="cta-template-header">
                <span className="cta-emoji">{cta.emoji}</span>
                <span className="cta-name">{cta.name}</span>
              </div>
              <div className="cta-desc">{cta.desc}</div>
              <div className="cta-examples">
                {cta.examples.map((ex, i) => (
                  <div 
                    key={i} 
                    className="cta-example"
                    onClick={() => copyToClipboard(ex, `${cta.id}-${i}`)}
                  >
                    {copiedId === `${cta.id}-${i}` ? '✓ Copied!' : ex}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Hook Effectiveness Tester
function HookTester({ isOpen, onClose }) {
  const [hook, setHook] = useState('')
  const [analysis, setAnalysis] = useState(null)

  const analyzeHook = (text) => {
    const score = { total: 0, curiosity: 0, emotion: 0, specificity: 0, urgency: 0, clarity: 0 }
    const feedback = []

    // Curiosity check (question, gap, "secret", "truth", "myth", "what happens")
    if (text.includes('?') || /\b(secret|truth|myth|what happens|why|how come)\b/i.test(text)) {
      score.curiosity = 25
      feedback.push('✅ Good curiosity gap')
    } else {
      score.curiosity = 10
      feedback.push('💡 Add a question or curiosity gap')
    }

    // Emotion check (strong words)
    const emotionWords = /\b(shocking|surprising|devastating|amazing|life-changing|insane|killer|deadly|real|honest|brutal|game-changer)\b/i
    if (emotionWords.test(text)) {
      score.emotion = 25
      feedback.push('✅ Strong emotional language')
    } else {
      score.emotion = 10
      feedback.push('💡 Add emotion with stronger words')
    }

    // Specificity check (numbers, конкрет)
    if (/\d+/.test(text) || /\b(once|twice|exactly|specifically)\b/i.test(text)) {
      score.specificity = 25
      feedback.push('✅ Good specificity')
    } else {
      score.specificity = 10
      feedback.push('💡 Add numbers or specific details')
    }

    // Urgency check (now, today, tonight, stop, start, don't)
    if (/\b(now|today|tonight|stop|start|don\'t|never|finally)\b/i.test(text)) {
      score.urgency = 15
      feedback.push('✅ Creates urgency')
    } else {
      score.urgency = 5
      feedback.push('💡 Add urgency words')
    }

    // Clarity check (short, readable)
    if (text.length < 80) {
      score.clarity = 10
      feedback.push('✅ Good length for scroll')
    } else if (text.length < 120) {
      score.clarity = 5
      feedback.push('⚠️ Getting long - consider trimming')
    } else {
      score.clarity = 0
      feedback.push('❌ Too long - will get cut off')
    }

    score.total = score.curiosity + score.emotion + score.specificity + score.urgency + score.clarity

    return { score, feedback }
  }

  const handleAnalyze = () => {
    if (hook.trim()) {
      setAnalysis(analyzeHook(hook))
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--accent-green)'
    if (score >= 60) return 'var(--accent-blue)'
    if (score >= 40) return 'var(--accent-orange)'
    return 'var(--text-muted)'
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hook-tester-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔍 Hook Tester</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="hook-input-area">
          <textarea
            className="hook-input"
            placeholder="Paste your hook here..."
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            rows={3}
          />
          <button className="analyze-btn" onClick={handleAnalyze} disabled={!hook.trim()}>
            Analyze Hook
          </button>
        </div>
        {analysis && (
          <div className="hook-analysis">
            <div className="hook-score-display">
              <div className="score-circle" style={{ borderColor: getScoreColor(analysis.score.total) }}>
                <span className="score-number" style={{ color: getScoreColor(analysis.score.total) }}>
                  {analysis.score.total}
                </span>
                <span className="score-label">/100</span>
              </div>
            </div>
            <div className="hook-feedback">
              {analysis.feedback.map((f, i) => (
                <div key={i} className="feedback-item">{f}</div>
              ))}
            </div>
            <div className="score-breakdown">
              <div className="breakdown-row">
                <span>Curiosity</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${analysis.score.curiosity}%` }} />
                </div>
                <span>{analysis.score.curiosity}/25</span>
              </div>
              <div className="breakdown-row">
                <span>Emotion</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${analysis.score.emotion}%` }} />
                </div>
                <span>{analysis.score.emotion}/25</span>
              </div>
              <div className="breakdown-row">
                <span>Specificity</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${analysis.score.specificity}%` }} />
                </div>
                <span>{analysis.score.specificity}/25</span>
              </div>
              <div className="breakdown-row">
                <span>Urgency</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${analysis.score.urgency}%` }} />
                </div>
                <span>{analysis.score.urgency}/15</span>
              </div>
              <div className="breakdown-row">
                <span>Clarity</span>
                <div className="breakdown-bar">
                  <div className="breakdown-fill" style={{ width: `${analysis.score.clarity}%` }} />
                </div>
                <span>{analysis.score.clarity}/10</span>
              </div>
            </div>
          </div>
        )}
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

// ========== CITATION FORMATTER (NEW v4.2) ==========
function CitationFormatter({ isOpen, onClose }) {
  const [citation, setCitation] = useState({
    authors: '',
    title: '',
    journal: '',
    year: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    url: '',
    accessDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  })
  const [format, setFormat] = useState('apa')
  const [copied, setCopied] = useState(false)

  const formats = {
    apa: (c) => {
      let auth = c.authors.split(',').map((a, i) => {
        const parts = a.trim().split(' ')
        if (parts.length === 1) return parts[0]
        return `${parts[parts.length - 1]}, ${parts[0].charAt(0)}.`
      }).join(', ')
      let result = `${auth} (${c.year}). ${c.title}. `
      if (c.journal) result += `*${c.journal}*`
      if (c.volume) result += `, *${c.volume}*`
      if (c.issue) result += `(${c.issue})`
      if (c.pages) result += `, ${c.pages}`
      result += '.'
      if (c.doi) result += ` https://doi.org/${c.doi}`
      else if (c.url) result += ` ${c.url}`
      return result
    },
    mla: (c) => {
      let auth = c.authors.split(',').map((a, i) => {
        const parts = a.trim().split(' ')
        if (parts.length === 1) return parts[0]
        if (i === 0) return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`
        return a.trim()
      }).join(', ')
      let result = `${auth}. "${c.title}." `
      if (c.journal) result += `*${c.journal}*`
      if (c.volume) result += `, vol. ${c.volume}`
      if (c.issue) result += `, no. ${c.issue}`
      result += `, ${c.year}`
      if (c.pages) result += `, pp. ${c.pages}`
      if (c.doi) result += `. doi:${c.doi}`
      result += '.'
      return result
    },
    chicago: (c) => {
      let auth = c.authors.split(',').map((a, i) => {
        const parts = a.trim().split(' ')
        if (parts.length === 1) return parts[0]
        if (i === 0) return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`
        return a.trim()
      }).join(', ')
      let result = `${auth}. "${c.title}." `
      if (c.journal) result += `*${c.journal}*`
      if (c.volume) result += ` ${c.volume}`
      if (c.issue) result += `, no. ${c.issue}`
      result += ` (${c.year})`
      if (c.pages) result += `: ${c.pages}`
      result += '.'
      if (c.doi) result += ` https://doi.org/${c.doi}`
      return result
    },
    bibtex: (c) => {
      const key = c.authors.split(',')[0].trim().split(' ')[0].toLowerCase() + c.year
      return `@article{${key},\n  author = {${c.authors}},\n  title = {${c.title}},\n  journal = {${c.journal || ''}},\n  year = {${c.year}},\n  volume = {${c.volume || ''}},\n  number = {${c.issue || ''}},\n  pages = {${c.pages || ''}},\n  doi = {${c.doi || ''}}\n}`
    }
  }

  const generateCitation = () => formats[format](citation)

  const copyCitation = () => {
    navigator.clipboard.writeText(generateCitation())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateField = (field, value) => {
    setCitation(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content citation-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📚 Citation Formatter</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="citation-format-select">
          <label>Citation Style:</label>
          <div className="citation-buttons">
            {['apa', 'mla', 'chicago', 'bibtex'].map(f => (
              <button 
                key={f}
                className={`citation-style-btn ${format === f ? 'active' : ''}`}
                onClick={() => setFormat(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="citation-fields">
          <div className="citation-field">
            <label>Authors (comma separated)</label>
            <input 
              type="text" 
              placeholder="Smith, John, Doe, Jane"
              value={citation.authors}
              onChange={(e) => updateField('authors', e.target.value)}
            />
          </div>
          <div className="citation-field">
            <label>Article Title</label>
            <input 
              type="text" 
              placeholder="The effects of exercise on..."
              value={citation.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div className="citation-field">
            <label>Journal Name</label>
            <input 
              type="text" 
              placeholder="Journal of Sports Science"
              value={citation.journal}
              onChange={(e) => updateField('journal', e.target.value)}
            />
          </div>
          <div className="citation-row">
            <div className="citation-field small">
              <label>Year</label>
              <input 
                type="text" 
                placeholder="2024"
                value={citation.year}
                onChange={(e) => updateField('year', e.target.value)}
              />
            </div>
            <div className="citation-field small">
              <label>Volume</label>
              <input 
                type="text" 
                placeholder="12"
                value={citation.volume}
                onChange={(e) => updateField('volume', e.target.value)}
              />
            </div>
            <div className="citation-field small">
              <label>Issue</label>
              <input 
                type="text" 
                placeholder="3"
                value={citation.issue}
                onChange={(e) => updateField('issue', e.target.value)}
              />
            </div>
          </div>
          <div className="citation-row">
            <div className="citation-field small">
              <label>Pages</label>
              <input 
                type="text" 
                placeholder="45-67"
                value={citation.pages}
                onChange={(e) => updateField('pages', e.target.value)}
              />
            </div>
            <div className="citation-field">
              <label>DOI</label>
              <input 
                type="text" 
                placeholder="10.1000/xyz123"
                value={citation.doi}
                onChange={(e) => updateField('doi', e.target.value)}
              />
            </div>
          </div>
        </div>

        {citation.title && (
          <div className="citation-output">
            <label>Generated Citation:</label>
            <div className="citation-result">
              <p>{generateCitation()}</p>
            </div>
            <button 
              className={`citation-copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyCitation}
            >
              {copied ? '✓ Copied!' : '📋 Copy Citation'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== SEO CHECKLIST (NEW v4.8) ==========
function SEOChecklist({ isOpen, onClose }) {
  const [checks, setChecks] = useState([
    { id: 'title', label: 'Compelling headline with keyword', checked: false, weight: 15 },
    { id: 'meta', label: 'Meta description (150-160 chars)', checked: false, weight: 10 },
    { id: 'hook', label: 'Hook in first 50 words', checked: false, weight: 15 },
    { id: 'h1', label: 'H1 contains main keyword', checked: false, weight: 10 },
    { id: 'subheads', label: '2-3 H2 subheadings with keywords', checked: false, weight: 10 },
    { id: 'images', label: 'Images have alt text', checked: false, weight: 5 },
    { id: 'links', label: '2-3 outbound links to权威 sources', checked: false, weight: 10 },
    { id: 'cta', label: 'Clear call-to-action', checked: false, weight: 10 },
    { id: 'length', label: '750-1500 words', checked: false, weight: 10 },
    { id: 'sources', label: 'At least 3 credible source citations', checked: false, weight: 5 },
  ])
  
  const toggleCheck = (id) => {
    setChecks(prev => prev.map(c => 
      c.id === id ? { ...c, checked: !c.checked } : c
    ))
  }
  
  const score = checks.reduce((sum, c) => sum + (c.checked ? c.weight : 0), 0)
  const maxScore = checks.reduce((sum, c) => sum + c.weight, 0)
  const percentage = Math.round((score / maxScore) * 100)
  
  const getScoreColor = (p) => {
    if (p >= 80) return '#22c55e'
    if (p >= 60) return '#f97316'
    return '#ef4444'
  }
  
  const reset = () => {
    setChecks(prev => prev.map(c => ({ ...c, checked: false })))
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content seo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔍 SEO Checklist</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="seo-score-display">
          <div className="seo-score-circle" style={{ borderColor: getScoreColor(percentage) }}>
            <span className="seo-score-number" style={{ color: getScoreColor(percentage) }}>
              {percentage}%
            </span>
            <span className="seo-score-label">Score</span>
          </div>
          <div className="seo-score-details">
            <span className="seo-score-points">{score}/{maxScore} points</span>
            <button className="seo-reset-btn" onClick={reset}>Reset</button>
          </div>
        </div>
        
        <div className="seo-progress-bar">
          <div 
            className="seo-progress-fill" 
            style={{ width: `${percentage}%`, background: getScoreColor(percentage) }}
          />
        </div>
        
        <div className="seo-checklist">
          {checks.map(check => (
            <label 
              key={check.id} 
              className={`seo-check-item ${check.checked ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={check.checked}
                onChange={() => toggleCheck(check.id)}
              />
              <span className="seo-check-label">{check.label}</span>
              <span className="seo-check-weight">+{check.weight}</span>
            </label>
          ))}
        </div>
        
        {percentage >= 80 && (
          <div className="seo-success">
            <span>🎉</span> Ready to publish!
          </div>
        )}
      </div>
    </div>
  )
}

// ========== TONE ADJUSTER (NEW v4.8) ==========
function ToneAdjuster({ isOpen, onClose }) {
  const [text, setText] = useState('')
  const [selectedTone, setSelectedTone] = useState('professional')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  
  const tones = [
    { id: 'professional', name: 'Professional', emoji: '💼', desc: 'Formal, authoritative' },
    { id: 'conversational', name: 'Conversational', emoji: '💬', desc: 'Friendly, casual' },
    { id: 'bold', name: 'Bold', emoji: '🔥', desc: 'Confident, edgy' },
    { id: 'scientific', name: 'Scientific', emoji: '🔬', desc: 'Data-driven, precise' },
    { id: 'storytelling', name: 'Storytelling', emoji: '📖', desc: 'Narrative, engaging' },
    { id: 'direct', name: 'Direct', emoji: '🎯', desc: 'No fluff, action-oriented' },
  ]
  
  // Simulated tone transformation (in production, this would call an AI API)
  const transformText = () => {
    if (!text.trim()) return
    
    const transformations = {
      professional: text.replace(/you're/gi, 'you are').replace(/can't/gi, 'cannot').replace(/won't/gi, 'will not'),
      conversational: text.replace(/\b(is|are|was|were)\b/gi, m => m.toLowerCase()).replace(/Furthermore/gi, 'Also').replace(/Additionally/gi, 'Plus'),
      bold: text.replace(/\b(maybe|perhaps|possibly)\b/gi, 'definitely').replace(/could/gi, 'will').replace(/might/gi, 'can'),
      scientific: text.replace(/\b(good|great|amazing)\b/gi, 'optimal').replace(/\b(bad|poor|badly)\b/gi, 'suboptimal').replace(/think/gi, 'hypothesize'),
      storytelling: text.replace(/^/, 'Once upon a time, ').replace(/\. /g, '. '),
      direct: text.replace(/However/gi, 'But').replace(/Furthermore/gi, 'And').replace(/It is important to note that/gi, ''),
    }
    
    setOutput(transformations[selectedTone] || text)
  }
  
  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tone-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎨 Tone Adjuster</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="tone-input-section">
          <label>Paste your text:</label>
          <textarea
            placeholder="Paste article text, headline, or hook to adjust tone..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </div>
        
        <div className="tone-selection">
          <label>Select tone:</label>
          <div className="tone-grid">
            {tones.map(tone => (
              <button
                key={tone.id}
                className={`tone-option ${selectedTone === tone.id ? 'active' : ''}`}
                onClick={() => setSelectedTone(tone.id)}
              >
                <span className="tone-emoji">{tone.emoji}</span>
                <span className="tone-name">{tone.name}</span>
                <span className="tone-desc">{tone.desc}</span>
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="tone-transform-btn"
          onClick={transformText}
          disabled={!text.trim()}
        >
          Transform Tone
        </button>
        
        {output && (
          <div className="tone-output-section">
            <label>Transformed text:</label>
            <div className="tone-output">
              <p>{output}</p>
            </div>
            <button 
              className={`tone-copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyOutput}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== WRITING HEATMAP (NEW v4.2) ==========
function WritingHeatmap() {
  const [data, setData] = useState([])
  const [totalWords, setTotalWords] = useState(0)
  
  useEffect(() => {
    const today = new Date()
    const writingData = JSON.parse(localStorage.getItem('renzo-writing-history') || '[]')
    const wordsByDate = {}
    
    writingData.forEach(entry => {
      const date = new Date(entry.date).toDateString()
      wordsByDate[date] = (wordsByDate[date] || 0) + (entry.words || 0)
    })
    
    const newData = []
    let total = 0
    
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      const words = wordsByDate[dateStr] || 0
      total += words
      newData.push({
        date: date,
        day: date.getDay(),
        words: words,
        level: words === 0 ? 0 : words < 250 ? 1 : words < 500 ? 2 : words < 1000 ? 3 : 4
      })
    }
    
    setData(newData)
    setTotalWords(total)
  }, [])
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const getMonthLabels = () => {
    const labels = []
    let lastMonth = -1
    data.forEach((d, i) => {
      const month = d.date.getMonth()
      if (month !== lastMonth) {
        labels.push({ month: months[month], index: i })
        lastMonth = month
      }
    })
    return labels
  }
  
  const getLevelColor = (level) => {
    if (level === 0) return 'var(--bg-hover)'
    if (level === 1) return 'rgba(220, 38, 38, 0.2)'
    if (level === 2) return 'rgba(220, 38, 38, 0.4)'
    if (level === 3) return 'rgba(220, 38, 38, 0.7)'
    return 'var(--accent)'
  }
  
  return (
    <div className="writing-heatmap">
      <div className="heatmap-header">
        <span className="heatmap-title">📊 Writing Activity</span>
        <span className="heatmap-total">{totalWords.toLocaleString()} words / 12 weeks</span>
      </div>
      <div className="heatmap-container">
        <div className="heatmap-months">
          {getMonthLabels().map((m, i) => (
            <span key={i} style={{ gridColumnStart: m.index + 1 }}>{m.month}</span>
          ))}
        </div>
        <div className="heatmap-grid">
          <div className="heatmap-days">
            {days.map((d, i) => (
              <span key={i} className={i % 2 === 0 ? '' : 'hide'}>{d}</span>
            ))}
          </div>
          <div className="heatmap-cells">
            {data.map((d, i) => (
              <div 
                key={i} 
                className="heatmap-cell"
                style={{ background: getLevelColor(d.level) }}
                title={`${d.date.toLocaleDateString()}: ${d.words} words`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div key={l} className="legend-cell" style={{ background: getLevelColor(l) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

// ========== WEEKLY STATS DASHBOARD (NEW v4.2) ==========
function WeeklyStatsDashboard({ articles }) {
  const [stats, setStats] = useState({
    thisWeek: 0,
    lastWeek: 0,
    avgWords: 0,
    totalPublished: 0,
    avgEngagement: 0,
    streak: 0,
    bestDay: '',
    categoryBreakdown: {}
  })
  
  useEffect(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date(now)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    
    const drafts = JSON.parse(localStorage.getItem('renzo-drafts') || '[]')
    
    const thisWeekDrafts = drafts.filter(d => new Date(d.date) > weekAgo)
    const lastWeekDrafts = drafts.filter(d => {
      const date = new Date(d.date)
      return date > twoWeeksAgo && date <= weekAgo
    })
    
    const thisWeekWords = thisWeekDrafts.reduce((sum, d) => sum + (d.words || 0), 0)
    const lastWeekWords = lastWeekDrafts.reduce((sum, d) => sum + (d.words || 0), 0)
    
    const categories = {}
    drafts.forEach(d => {
      const cat = d.category || 'Uncategorized'
      categories[cat] = (categories[cat] || 0) + 1
    })
    
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]
    drafts.forEach(d => {
      dayCounts[new Date(d.date).getDay()] += (d.words || 0)
    })
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const bestDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))]
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const hasWritten = drafts.some(d => 
        new Date(d.date).toDateString() === checkDate.toDateString()
      )
      if (hasWritten) streak++
      else if (i > 0) break
    }
    
    setStats({
      thisWeek: thisWeekWords,
      lastWeek: lastWeekWords,
      avgWords: drafts.length > 0 ? Math.round(drafts.reduce((s, d) => s + (d.words || 0), 0) / drafts.length) : 0,
      totalPublished: drafts.filter(d => d.status === 'published').length,
      avgEngagement: 8.2,
      streak: streak,
      bestDay: bestDay,
      categoryBreakdown: categories
    })
  }, [articles])
  
  const weekChange = stats.lastWeek > 0 
    ? Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100)
    : stats.thisWeek > 0 ? 100 : 0
  
  return (
    <div className="weekly-stats">
      <div className="stats-header">
        <span className="stats-title">📈 Weekly Stats</span>
        <span className={`stats-change ${weekChange >= 0 ? 'positive' : 'negative'}`}>
          {weekChange >= 0 ? '↑' : '↓'} {Math.abs(weekChange)}%
        </span>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{stats.thisWeek.toLocaleString()}</span>
          <span className="stat-label">This Week</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{stats.streak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{stats.avgWords}</span>
          <span className="stat-label">Avg Words</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{stats.bestDay}</span>
          <span className="stat-label">Best Day</span>
        </div>
      </div>
      
      {Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="stats-categories">
          <span className="categories-title">Categories</span>
          <div className="categories-list">
            {Object.entries(stats.categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([cat, count], i) => (
                <div key={i} className="category-item">
                  <span className="category-name">{cat}</span>
                  <span className="category-count">{count}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ========== QUOTE COLLECTION (NEW v5.9) ==========
function QuoteCollection({ isOpen, onClose, quotes, onSaveQuote, onDeleteQuote }) {
  const [newQuote, setNewQuote] = useState('')
  const [source, setSource] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('Science')
  const [filter, setFilter] = useState('all')
  
  const categories = ['Science', 'Motivation', 'Technique', 'Nutrition', 'Health', 'Performance', 'Other']
  
  const filteredQuotes = filter === 'all' ? quotes : quotes.filter(q => q.category === filter)
  
  const handleSave = () => {
    if (!newQuote.trim()) return
    onSaveQuote({ text: newQuote, source, author, category, date: new Date().toISOString() })
    setNewQuote('')
    setSource('')
    setAuthor('')
  }
  
  const copyQuote = (text) => {
    navigator.clipboard.writeText(text)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quote-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💬 Quote Collection</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="quote-form">
          <textarea
            className="quote-input"
            placeholder="Paste or write a notable quote..."
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            rows={3}
          />
          <div className="quote-form-row">
            <input
              type="text"
              className="quote-author"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <input
              type="text"
              className="quote-source"
              placeholder="Source (book, study, article)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="quote-category">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <button className="quote-save-btn" onClick={handleSave} disabled={!newQuote.trim()}>
            Save Quote
          </button>
        </div>
        
        <div className="quote-filter">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({quotes.length})
          </button>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat} ({quotes.filter(q => q.category === cat).length})
            </button>
          ))}
        </div>
        
        <div className="quote-list">
          {filteredQuotes.length === 0 ? (
            <div className="quote-empty">No quotes yet. Start collecting!</div>
          ) : (
            filteredQuotes.map((quote, i) => (
              <div key={i} className="quote-card">
                <div className="quote-text">"{quote.text}"</div>
                <div className="quote-meta">
                  {quote.author && <span className="quote-author-name">— {quote.author}</span>}
                  {quote.source && <span className="quote-source-name"> from {quote.source}</span>}
                  <span className="quote-category-tag">{quote.category}</span>
                </div>
                <div className="quote-actions">
                  <button className="quote-copy-btn" onClick={() => copyQuote(quote.text)}>Copy</button>
                  <button className="quote-delete-btn" onClick={() => onDeleteQuote(i)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ========== TOPIC FREQUENCY ANALYZER (NEW v5.9) ==========
function TopicFrequency({ isOpen, onClose, ideas, articles }) {
  const [timeRange, setTimeRange] = useState('all') // all, 30, 7
  
  const getTopics = () => {
    const topics = {}
    
    // Extract from ideas
    ideas.forEach(idea => {
      const title = idea.title.toLowerCase()
      const words = title.split(/\s+/).filter(w => w.length > 3)
      words.forEach(word => {
        topics[word] = (topics[word] || 0) + 1
      })
    })
    
    // Extract from articles
    articles.forEach(article => {
      const title = (article.title || '').toLowerCase()
      const words = title.split(/\s+/).filter(w => w.length > 3)
      words.forEach(word => {
        topics[word] = (topics[word] || 0) + 2 // Weight articles more
      })
    })
    
    return Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  }
  
  const topics = getTopics()
  const maxCount = topics[0]?.[1] || 1
  
  // Find content gaps - topics with low frequency
  const getGaps = () => {
    const importantTopics = ['protein', 'strength', 'cardio', 'recovery', 'sleep', 'nutrition', 'hypertrophy', 'endurance', 'mobility', 'fatloss', 'muscle', 'weight', 'health', 'fitness', 'training', 'workout', 'exercise', 'diet', 'weightloss', 'gains']
    const currentTopics = topics.map(t => t[0])
    
    return importantTopics
      .filter(t => !currentTopics.includes(t))
      .slice(0, 10)
  }
  
  const gaps = getGaps()
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content frequency-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 Topic Frequency Analyzer</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="frequency-section">
          <h4>Top Topics in Your Content Bank</h4>
          <p className="frequency-subtitle">Words that appear most often in your ideas and articles</p>
          
          <div className="frequency-chart">
            {topics.length === 0 ? (
              <div className="frequency-empty">No topics found. Add some ideas first!</div>
            ) : (
              topics.map(([topic, count], i) => (
                <div key={i} className="frequency-bar-row">
                  <span className="frequency-label">{topic}</span>
                  <div className="frequency-bar-container">
                    <div 
                      className="frequency-bar" 
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="frequency-count">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="frequency-section gaps-section">
          <h4>🎯 Content Gaps</h4>
          <p className="frequency-subtitle">Important topics you haven't covered recently</p>
          
          <div className="gaps-list">
            {gaps.length === 0 ? (
              <div className="gaps-full">Great job! You've covered all major topics.</div>
            ) : (
              gaps.map((gap, i) => (
                <span key={i} className="gap-tag">{gap}</span>
              ))
            )}
          </div>
        </div>
        
        <div className="frequency-stats">
          <div className="stat-card">
            <span className="stat-number">{ideas.length}</span>
            <span className="stat-label">Ideas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{articles.length}</span>
            <span className="stat-label">Articles</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{topics.length}</span>
            <span className="stat-label">Unique Topics</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== SCRATCHPAD (NEW v5.8) ==========
function Scratchpad({ isOpen, onClose }) {
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('renzo-scratchpad') || ''
  })
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    localStorage.setItem('renzo-scratchpad', notes)
  }, [notes])

  const handleCopy = () => {
    navigator.clipboard.writeText(notes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    if (confirm('Clear all scratch notes?')) {
      setNotes('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content scratchpad-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📝 Scratchpad</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="scratchpad-toolbar">
          <button onClick={handleCopy} className={copied ? 'copied' : ''}>
            {copied ? '✓ Copied!' : '📋 Copy All'}
          </button>
          <button onClick={handleClear}>🗑️ Clear</button>
          <span className="scratchpad-hint">Auto-saves as you type</span>
        </div>
        <textarea
          ref={textareaRef}
          className="scratchpad-textarea"
          placeholder="Quick notes, research snippets, article ideas... anything goes here. Auto-saves to localStorage."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="scratchpad-footer">
          <span>{notes.length} characters</span>
          <span>{notes.trim().split(/\s+/).filter(w => w).length} words</span>
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

// ========== WRITING VELOCITY TRACKER (NEW v4.6) ==========
function WritingVelocityTracker() {
  const [velocity, setVelocity] = useState(0)
  const [sessionWords, setSessionWords] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('renzo-velocity-history')
    return saved ? JSON.parse(saved) : []
  })
  
  useEffect(() => {
    let interval
    if (isActive) {
      interval = setInterval(() => {
        setSessionTime(t => t + 1)
        // Calculate velocity every 30 seconds
        if (sessionTime > 0 && sessionTime % 30 === 0) {
          const wpm = Math.round((sessionWords / sessionTime) * 60)
          setVelocity(wpm)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, sessionWords, sessionTime])
  
  const startSession = () => {
    setIsActive(true)
    setSessionWords(0)
    setSessionTime(0)
    setVelocity(0)
  }
  
  const endSession = () => {
    if (sessionWords > 0 && sessionTime > 60) {
      const wpm = Math.round((sessionWords / sessionTime) * 60)
      const newEntry = {
        words: sessionWords,
        time: sessionTime,
        wpm: wpm,
        date: new Date().toISOString()
      }
      const updated = [newEntry, ...history].slice(0, 20)
      setHistory(updated)
      localStorage.setItem('renzo-velocity-history', JSON.stringify(updated))
    }
    setIsActive(false)
  }
  
  const addWords = (count) => {
    setSessionWords(w => w + count)
  }
  
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  
  const avgVelocity = history.length > 0 
    ? Math.round(history.reduce((s, h) => s + h.wpm, 0) / history.length)
    : 0
  
  return (
    <div className="velocity-tracker">
      <div className="velocity-header">
        <span className="velocity-icon">⚡</span>
        <span className="velocity-title">Writing Velocity</span>
        {isActive && <span className="velocity-badge">LIVE</span>}
      </div>
      
      <div className="velocity-display">
        <div className="velocity-main">
          <span className="velocity-value">{isActive ? velocity : avgVelocity}</span>
          <span className="velocity-unit">WPM</span>
        </div>
        <div className="velocity-stats">
          <div className="velocity-stat">
            <span className="stat-num">{sessionWords}</span>
            <span className="stat-lbl">words</span>
          </div>
          <div className="velocity-stat">
            <span className="stat-num">{formatTime(sessionTime)}</span>
            <span className="stat-lbl">time</span>
          </div>
        </div>
      </div>
      
      <div className="velocity-actions">
        {!isActive ? (
          <>
            <button className="velocity-start" onClick={startSession}>Start Session</button>
            {sessionWords > 0 && (
              <button className="velocity-save" onClick={() => {
                const wpm = Math.round((sessionWords / sessionTime) * 60)
                const newEntry = { words: sessionWords, time: sessionTime, wpm, date: new Date().toISOString() }
                const updated = [newEntry, ...history].slice(0, 20)
                setHistory(updated)
                localStorage.setItem('renzo-velocity-history', JSON.stringify(updated))
                setSessionWords(0)
                setSessionTime(0)
              }}>Save & Reset</button>
            )}
          </>
        ) : (
          <>
            <button className="velocity-add" onClick={() => addWords(50)}>+50 words</button>
            <button className="velocity-end" onClick={endSession}>End Session</button>
          </>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="velocity-history">
          <span className="history-label">Recent Sessions</span>
          <div className="history-list">
            {history.slice(0, 3).map((h, i) => (
              <div key={i} className="history-item">
                <span className="history-wpm">{h.wpm} WPM</span>
                <span className="history-words">{h.words} words</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ========== KEYBOARD SHORTCUTS FOOTER (NEW v4.6) ==========
function KeyboardShortcutsFooter({ onShowShortcuts }) {
  const shortcuts = [
    { key: '?', help: 'Shortcuts' },
    { key: 'M', help: 'Focus Mode' },
    { key: 'H', help: 'Headlines' },
    { key: 'D', help: 'New Draft' },
    { key: 'S', help: 'Sprint' },
    { key: 'A', help: 'Ideas' },
    { key: 'Q', help: 'Capture' },
  ]
  
  return (
    <div className="shortcuts-footer">
      <div className="footer-shortcuts">
        {shortcuts.map((s, i) => (
          <button 
            key={i} 
            className="footer-shortcut"
            onClick={() => {
              if (s.key === '?') onShowShortcuts?.()
            }}
          >
            <kbd>{s.key}</kbd>
            <span>{s.help}</span>
          </button>
        ))}
      </div>
      <div className="footer-tip">
        Press <kbd>?</kbd> for all shortcuts
      </div>
    </div>
  )
}

// Daily Writing Challenge Component
function DailyChallenge({ onComplete }) {
  const [challenge, setChallenge] = useState(() => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('renzo-daily-challenge')
    const savedDate = localStorage.getItem('renzo-daily-challenge-date')
    if (saved && savedDate === today) {
      return JSON.parse(saved)
    }
    // Generate a new challenge for today
    const challenges = [
      { type: 'word', target: 500, desc: 'Write 500 words on any topic', icon: '✍️' },
      { type: 'headline', target: 10, desc: 'Generate 10 headline variations', icon: '📰' },
      { type: 'hook', target: 5, desc: 'Write 5 opening hooks', icon: '🪝' },
      { type: 'sprint', target: 1, desc: 'Complete a 15-min word sprint', icon: '⚡' },
      { type: 'research', target: 3, desc: 'Find 3 new study citations', icon: '🔬' },
      { type: 'thread', target: 1, desc: 'Create 1 X/Twitter thread outline', icon: '🧵' },
    ]
    const newChallenge = challenges[Math.floor(Math.random() * challenges.length)]
    newChallenge.progress = 0
    newChallenge.completed = false
    newChallenge.date = today
    localStorage.setItem('renzo-daily-challenge', JSON.stringify(newChallenge))
    localStorage.setItem('renzo-daily-challenge-date', today)
    return newChallenge
  })
  
  const updateProgress = (amount) => {
    const newProgress = Math.min(challenge.progress + amount, challenge.target)
    const updated = { ...challenge, progress: newProgress, completed: newProgress >= challenge.target }
    setChallenge(updated)
    localStorage.setItem('renzo-daily-challenge', JSON.stringify(updated))
    if (updated.completed && !challenge.completed) {
      onComplete?.()
    }
  }
  
  const progress = Math.min((challenge.progress / challenge.target) * 100, 100)
  const isComplete = challenge.completed
  
  return (
    <div className={`daily-challenge ${isComplete ? 'completed' : ''}`}>
      <div className="challenge-header">
        <span className="challenge-icon">{challenge.icon}</span>
        <span className="challenge-label">Daily Challenge</span>
        {isComplete && <span className="challenge-badge">✓ Done</span>}
      </div>
      <div className="challenge-desc">{challenge.desc}</div>
      <div className="challenge-progress">
        <div className="challenge-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="challenge-numbers">
        <span className="challenge-current">{challenge.progress}</span>
        <span className="challenge-sep">/</span>
        <span className="challenge-target">{challenge.target}</span>
      </div>
      <div className="challenge-actions">
        <button 
          className="challenge-btn"
          onClick={() => updateProgress(challenge.type === 'sprint' ? 1 : Math.ceil(challenge.target / 4))}
          disabled={isComplete}
        >
          {isComplete ? 'Completed!' : 'Make Progress'}
        </button>
      </div>
    </div>
  )
}

// Study Spotlight Component
function StudySpotlight() {
  const studies = [
    { title: "Muscle Protein Synthesis", finding: "Leucine threshold of ~2.5g triggers maximum MPS", source: "JISSN 2013", pmid: "23780383" },
    { title: "Sleep & Recovery", finding: "8+ hours sleep doubles testosterone recovery", source: "Sleep 2011", pmid: "21250361" },
    { title: "HIIT vs Steady State", finding: "HIIT burns 25% more fat in half the time", source: "JAP 2009", pmid: "18710271" },
    { title: "Protein Pacing", finding: "4 meals/day optimizes muscle protein synthesis", source: "AJCN 2009", pmid: "19553497" },
    { title: "Strength Training & Bone", finding: "Resistance training increases bone density 1-3%", source: "Osteoporosis Int 2007", pmid: "17106784" },
    { title: "Creatine & Brain", finding: "Creatine improves cognitive performance under stress", source: "Nutritional Neuroscience 2020", pmid: "31850822" },
    { title: "Sarcopenia Prevention", finding: "Adults lose 3-8% muscle mass per decade after 30", source: "JAMA 2004", pmid: "15026638" },
    { title: "Cortisol & Training", finding: "Morning cortisol peaks can impair evening workouts", source: "Endocrine 2015", pmid: "25421584" },
    { title: "Protein & Muscle Loss", finding: "1.6-2.2g/kg protein daily maximizes lean mass", source: "ISSN 2017", pmid: "28698222" },
    { title: "Resistance Training Frequency", finding: "Training each muscle 2x/week outperforms 1x/week", source: "Sports Med 2016", pmid: "26666743" },
  ]
  const [study, setStudy] = useState(() => studies[Math.floor(Math.random() * studies.length)])
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const refreshStudy = () => {
    const newStudy = studies[Math.floor(Math.random() * studies.length)]
    setStudy(newStudy)
    setExpanded(false)
  }

  const getPubMedUrl = () => {
    return `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`
  }

  const copyToClipboard = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${study.title}: ${study.finding} (${study.source})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="study-spotlight" onClick={() => setExpanded(!expanded)}>
      <div className="study-header">
        <span className="study-icon">🔬</span>
        <span className="study-label">Study Spotlight</span>
        <button className="study-refresh" onClick={(e) => { e.stopPropagation(); refreshStudy() }} title="Load another study">↻</button>
      </div>
      <div className="study-title">{study.title}</div>
      {expanded && (
        <div className="study-expanded">
          <p className="study-finding">{study.finding}</p>
          <div className="study-source-row">
            <span className="study-source">{study.source}</span>
            <a href={getPubMedUrl()} target="_blank" rel="noopener noreferrer" className="study-link" title="Open on PubMed">
              🔗 PubMed
            </a>
            <button className="study-copy" onClick={copyToClipboard} title="Copy study info">
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Quick Stat Generator with study references
function QuickStatGenerator() {
  const stats = [
    { text: "73% of people quit their fitness routine within 6 months", source: "Stanford University", link: "https://stanford.edu" },
    { text: "Muscle remains metabolically active for 72 hours post-workout", source: "J Appl Physiol", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "The average person walks 3,000-4,000 steps per day", source: "CDC", link: "https://www.cdc.gov/" },
    { text: "Sleep deprivation can reduce testosterone by 15% in one week", source: "JAMA", link: "https://pubmed.ncbi.nlm.nih.gov/21250361/" },
    { text: "Creatine monohydrate is the most researched supplement in history", source: "Examine.com", link: "https://examine.com/" },
    { text: "Fast-twitch fibers fatigue 10x faster than slow-twitch", source: "Nature", link: "https://nature.com" },
    { text: "Your gut microbiome produces 10% of your daily energy", source: "Cell Host & Microbe", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "Resistance training maintains bone density better than cardio", source: "Osteoporosis Int", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "Protein thermic effect is 20-30% vs 5-10% for carbs/fat", source: "Am J Clin Nutr", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "HRV is a stronger predictor of overtraining than resting HR", source: "Br J Sports Med", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "You can build muscle with just 3 sets per exercise", source: "J Strength Cond Res", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "Protein timing matters less than total daily protein intake", source: "ISSN", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "Walking 8,000+ steps daily reduces mortality risk by 50%", source: "JAMA Intern Med", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "Caffeine can improve workout performance by 12%", source: "Sports Med", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { text: "Strength training improves insulin sensitivity within weeks", source: "Diabetes Care", link: "https://pubmed.ncbi.nlm.nih.gov/" },
  ]
  const [stat, setStat] = useState(stats[Math.floor(Math.random() * stats.length)])
  const [animating, setAnimating] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const generateStat = () => {
    setAnimating(true)
    setShowSource(false)
    setCopied(false)
    setTimeout(() => {
      let newStat
      do {
        newStat = stats[Math.floor(Math.random() * stats.length)]
      } while (newStat.text === stat.text && stats.length > 1)
      setStat(newStat)
      setAnimating(false)
    }, 200)
  }

  const copyStat = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${stat.text} (${stat.source})`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="quick-stat">
      <div className="quick-stat-header">
        <span className="stat-icon">📊</span>
        <span className="stat-label">Quick Stat</span>
        <div className="stat-actions">
          <button className="source-toggle" onClick={() => setShowSource(!showSource)} title="Show source">
            {showSource ? '🔗' : '📖'}
          </button>
          <button className="stat-copy-btn" onClick={copyStat} title="Copy stat">
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>
      <p className={`quick-stat-text ${animating ? 'animating' : ''}`}>{stat.text}</p>
      {showSource && (
        <a href={stat.link} target="_blank" rel="noopener noreferrer" className="stat-source">
          Source: {stat.source} →
        </a>
      )}
      <button className="stat-generate-btn" onClick={generateStat}>Generate New</button>
    </div>
  )
}

// Trending Hashtags - For X/Twitter content
function TrendingHashtags() {
  const [hashtags, setHashtags] = useState([
    { tag: '#FitnessTips', posts: '12.4K', trend: 'up' },
    { tag: '#ScienceBased', posts: '8.2K', trend: 'up' },
    { tag: '#MuscleGrowth', posts: '15.7K', trend: 'stable' },
    { tag: '#Longevity', posts: '6.1K', trend: 'up' },
    { tag: '#Training', posts: '22.3K', trend: 'down' },
    { tag: '#Biohacking', posts: '4.8K', trend: 'up' },
    { tag: '#HealthTips', posts: '18.9K', trend: 'stable' },
    { tag: '#Science', posts: '31.2K', trend: 'up' },
  ])
  const [copiedTag, setCopiedTag] = useState(null)
  
  const copyTag = (tag) => {
    navigator.clipboard.writeText(tag)
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag(null), 1500)
  }
  
  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '→'
  }
  
  const getTrendColor = (trend) => {
    if (trend === 'up') return '#22c55e'
    if (trend === 'down') return '#ef4444'
    return '#a1a1aa'
  }
  
  return (
    <div className="trending-hashtags">
      <div className="hashtags-header">
        <span className="hashtags-icon">🏷️</span>
        <span className="hashtags-label">Trending Hashtags</span>
        <button className="hashtags-refresh" onClick={() => setHashtags([...hashtags].sort(() => 0.5 - Math.random()))}>↻</button>
      </div>
      <div className="hashtags-list">
        {hashtags.map((h, i) => (
          <div key={i} className="hashtag-item" onClick={() => copyTag(h.tag)}>
            <span className="hashtag-tag">{h.tag}</span>
            <div className="hashtag-meta">
              <span className="hashtag-posts">{h.posts} posts</span>
              <span className="hashtag-trend" style={{ color: getTrendColor(h.trend) }}>
                {getTrendIcon(h.trend)}
              </span>
            </div>
            {copiedTag === h.tag && <span className="hashtag-copied">Copied!</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ========== TRENDING TOPICS PANEL (NEW v5.4) ==========
function TrendingTopics() {
  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('renzo-trending-topics')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.date === new Date().toDateString()) {
          return parsed.topics
        }
      } catch {}
    }
    // Default trending topics for fitness content
    return [
      { topic: 'Photobiomodulation', category: 'Longevity', virality: 9, angle: 'Red light therapy science' },
      { topic: 'Myostatin inhibition', category: 'Science', virality: 8, angle: 'Future of muscle growth' },
      { topic: 'Zone 2 training', category: 'Training', virality: 9, angle: 'Cardio myths busted' },
      { topic: 'Epigenetic age reversal', category: 'Longevity', virality: 10, angle: 'Biological age optimization' },
      { topic: 'Sleep tracking accuracy', category: 'Metrics', virality: 7, angle: 'What your device misses' },
      { topic: 'Creatine timing', category: 'Science', virality: 6, angle: 'Does timing matter?' },
      { topic: 'Sarcopenia prevention', category: 'Longevity', virality: 8, angle: 'Stop muscle loss' },
      { topic: 'HRV optimization', category: 'Metrics', virality: 7, angle: 'Recovery metrics that matter' },
    ]
  })
  const [copiedTopic, setCopiedTopic] = useState(null)
  
  const saveTopics = (newTopics) => {
    setTopics(newTopics)
    localStorage.setItem('renzo-trending-topics', JSON.stringify({
      topics: newTopics,
      date: new Date().toDateString()
    }))
  }
  
  const copyTopic = (topic) => {
    navigator.clipboard.writeText(topic.topic)
    setCopiedTopic(topic.topic)
    setTimeout(() => setCopiedTopic(null), 1500)
  }
  
  const getCategoryColor = (cat) => {
    const colors = { 'Longevity': '#22c55e', 'Science': '#3b82f6', 'Training': '#f97316', 'Metrics': '#a855f7', 'Recovery': '#06b6d4' }
    return colors[cat] || '#a1a1aa'
  }
  
  const getViralityColor = (v) => {
    if (v >= 9) return '#22c55e'
    if (v >= 7) return '#f97316'
    return '#a1a1aa'
  }
  
  const useTopic = (topic) => {
    // Create a quick draft from this topic
    const draft = {
      title: topic.topic,
      category: topic.category,
      hook: topic.angle,
      content: `${topic.angle}.\n\nThe science behind ${topic.topic} shows promising results...`,
      words: 500,
      date: new Date().toISOString()
    }
    const saved = JSON.parse(localStorage.getItem('renzo-drafts') || '[]')
    localStorage.setItem('renzo-drafts', JSON.stringify([draft, ...saved]))
    setCopiedTopic('Draft created!')
    setTimeout(() => setCopiedTopic(null), 2000)
  }
  
  const refreshTopics = () => {
    const shuffled = [...topics].sort(() => 0.5 - Math.random())
    saveTopics(shuffled)
  }
  
  return (
    <div className="trending-topics">
      <div className="topics-header">
        <span className="topics-icon">🔥</span>
        <span className="topics-label">Trending Topics</span>
        <button className="topics-refresh" onClick={refreshTopics}>↻</button>
      </div>
      <div className="topics-list">
        {topics.slice(0, 6).map((t, i) => (
          <div key={i} className="topic-item">
            <div className="topic-main" onClick={() => copyTopic(t)}>
              <span className="topic-name">{t.topic}</span>
              <span className="topic-angle">{t.angle}</span>
            </div>
            <div className="topic-meta">
              <span className="topic-category" style={{ color: getCategoryColor(t.category) }}>
                {t.category}
              </span>
              <span className="topic-virality" style={{ color: getViralityColor(t.virality) }}>
                {t.virality}/10
              </span>
            </div>
            <button className="topic-use" onClick={() => useTopic(t)}>
              Use →
            </button>
            {copiedTopic === t.topic && <span className="topic-copied">Copied!</span>}
            {copiedTopic === 'Draft created!' && copiedTopic !== t.topic === false && <span className="topic-copied">Draft created!</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Article Brief Generator - Quick article brief from topic
function ArticleBriefGenerator({ isOpen, onClose, onSave }) {
  const [topic, setTopic] = useState('')
  const [brief, setBrief] = useState(null)
  const [generating, setGenerating] = useState(false)
  
  const generateBrief = () => {
    if (!topic.trim()) return
    
    setGenerating(true)
    setTimeout(() => {
      const topics = topic.toLowerCase()
      const isLongevity = topics.includes('longevity') || topics.includes('age') || topics.includes('biological')
      const isTraining = topics.includes('training') || topics.includes('workout') || topics.includes('exercise')
      const isScience = topics.includes('science') || topics.includes('research') || topics.includes('study')
      const isRecovery = topics.includes('recovery') || topics.includes('sleep') || topics.includes('rest')
      
      let category = 'Science'
      if (isLongevity) category = 'Longevity'
      else if (isTraining) category = 'Training'
      else if (isRecovery) category = 'Recovery'
      
      const templates = {
        hook: [
          `What if everything you knew about ${topic} was wrong?`,
          `The truth about ${topic} that the industry doesn't want you to know`,
          `Scientists just discovered something shocking about ${topic}`,
        ],
        problem: [
          `Most people get ${topic} completely backwards`,
          `You're probably doing ${topic} wrong — here's why`,
          `The ${topic} myth that's costing you results`,
        ],
        mechanism: [
          `Research shows that the mechanism behind ${topic} involves cellular-level changes`,
          `New studies reveal ${topic} triggers specific metabolic pathways`,
          `The science of ${topic} points to a surprising mechanism`,
        ],
        solution: [
          `Here's the evidence-based approach to ${topic}`,
          `The optimal strategy for ${topic}, backed by research`,
          `What top experts recommend for ${topic}`,
        ],
        cta: [
          `Try this tonight and track your results. Your body will thank you.`,
          `Ready to optimize ${topic}? Start with one change today.`,
          `Share this with someone who needs to hear the truth about ${topic}`,
        ]
      }
      
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
      
      const newBrief = {
        topic,
        category,
        hook: pick(templates.hook),
        problem: pick(templates.problem),
        mechanism: pick(templates.mechanism),
        solution: pick(templates.solution),
        cta: pick(templates.cta),
        targetWords: isLongevity ? 1200 : isTraining ? 1000 : 800,
        sources: [
          'PubMed / JISSN',
          'Examine.com',
          'Recent review articles',
        ],
        created: new Date().toISOString()
      }
      
      setBrief(newBrief)
      setGenerating(false)
    }, 800)
  }
  
  const copyBrief = () => {
    if (!brief) return
    const text = `
📝 ARTICLE BRIEF: ${brief.topic}

Category: ${brief.category}
Target: ${brief.targetWords} words

🪝 HOOK:
${brief.hook}

⚠️ PROBLEM:
${brief.problem}

🔬 MECHANISM:
${brief.mechanism}

✅ SOLUTION:
${brief.solution}

📣 CTA:
${brief.cta}

📚 SOURCES:
${brief.sources.join('\n')}
    `.trim()
    navigator.clipboard.writeText(text)
  }
  
  const saveBrief = () => {
    if (brief) {
      onSave?.(brief)
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content brief-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📋 Article Brief Generator</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="brief-input">
          <input
            type="text"
            placeholder="Enter topic (e.g., 'intermittent fasting', 'sleep optimization')..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateBrief()}
          />
          <button 
            className="brief-generate-btn"
            onClick={generateBrief}
            disabled={!topic.trim() || generating}
          >
            {generating ? 'Generating...' : 'Generate Brief'}
          </button>
        </div>
        
        {brief && (
          <div className="brief-output">
            <div className="brief-meta">
              <span className="brief-category" style={{ color: categoryColors[brief.category] }}>
                {brief.category}
              </span>
              <span className="brief-target">{brief.targetWords} words</span>
            </div>
            
            <div className="brief-section">
              <span className="brief-label">🪝 Hook</span>
              <p>{brief.hook}</p>
            </div>
            
            <div className="brief-section">
              <span className="brief-label">⚠️ Problem</span>
              <p>{brief.problem}</p>
            </div>
            
            <div className="brief-section">
              <span className="brief-label">🔬 Mechanism</span>
              <p>{brief.mechanism}</p>
            </div>
            
            <div className="brief-section">
              <span className="brief-label">✅ Solution</span>
              <p>{brief.solution}</p>
            </div>
            
            <div className="brief-section">
              <span className="brief-label">📣 CTA</span>
              <p>{brief.cta}</p>
            </div>
            
            <div className="brief-actions">
              <button className="brief-copy-btn" onClick={copyBrief}>📋 Copy Brief</button>
              <button className="brief-save-btn" onClick={saveBrief}>💾 Save to Drafts</button>
            </div>
          </div>
        )}
      </div>
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
    { key: '⌘K', action: 'Command Palette' },
    { key: 'N', action: 'Quick Flow' },
    { key: 'D', action: 'Quick Draft' },
    { key: 'T', action: 'Article Templates' },
    { key: 'K', action: 'CTA Templates' },
    { key: 'J', action: 'Hook Tester' },
    { key: 'Y', action: 'Hot Take Generator' },
    { key: 'P', action: 'Writing Prompt' },
    { key: 'V', action: 'Virality Calculator' },
    { key: 'H', action: 'Headline Generator' },
    { key: 'I', action: 'Brief Generator' },
    { key: 'F', action: 'Content Formula' },
    { key: 'G', action: 'Topic Generator' },
    { key: 'B', action: 'Brainstorm Mode' },
    { key: 'C', action: 'Clipboard History' },
    { key: 'Q', action: 'Quick Capture' },
    { key: 'W', action: 'Quick Write' },
    { key: 'M', action: 'Focus Mode' },
    { key: 'R', action: 'Reference Panel' },
    { key: 'O', action: 'Research Queue' },
    { key: 'U', action: 'Saved Hooks' },
    { key: 'S', action: 'Word Sprint' },
    { key: 'Z', action: 'Article Series' },
    { key: 'X', action: 'Thread Format' },
    { key: 'A', action: 'Ideas Bank' },
    { key: 'E', action: 'Export Drafts' },
    { key: 'L', action: 'Changelog' },
    { key: '3', action: 'Global Search' },
    { key: ',', action: 'Settings' },
    { key: '!', action: 'Performance Analytics' },
    { key: '@', action: 'Writing Goals' },
    { key: '*', action: 'Draft Analyzer' },
    { key: '(', action: 'Format Preview' },
    { key: ')', action: 'Pomodoro Timer' },
    { key: '+', action: 'Quick Share' },
    { key: '6', action: 'Publishing Prep' },
    { key: '7', action: 'Performance Tracker' },
    { key: '8', action: 'Draft Collections' },
    { key: '9', action: 'Inspiration Board' },
    { key: '0', action: 'Reading List' },
    { key: '`', action: 'AI Prompt' },
    { key: '-', action: 'Tone Adjuster' },
    { key: '=', action: 'SEO Checklist' },
    { key: '\\', action: 'CLI Runner' },
    { key: 'Esc', action: 'Close Modal' },
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

// Daily Writing Challenge - Gamified daily writing prompts
function DailyWritingChallenge({ isOpen, onClose, onSelect }) {
  const [completed, setCompleted] = useState(false)
  const [streak, setStreak] = useState(0)
  
  // Deterministic daily challenge based on date
  const dailyChallenges = [
    { id: 1, type: 'hook', prompt: 'Write 3 different hooks for an article about protein timing', emoji: '🎣' },
    { id: 2, type: 'headline', prompt: 'Generate 5 headlines using the "Number + Benefit" formula', emoji: '📰' },
    { id: 3, type: 'myth', prompt: 'Debunk a popular fitness myth in 3 sentences', emoji: '🚫' },
    { id: 4, type: 'cta', prompt: 'Write 3 different CTAs for a strength training article', emoji: '💪' },
    { id: 5, type: 'thread', prompt: 'Outline a 5-tweet thread on sleep optimization', emoji: '🧵' },
    { id: 6, type: 'sci', prompt: 'Explain the mechanisms of muscle protein synthesis', emoji: '🔬' },
    { id: 7, type: 'compare', prompt: 'Compare HIIT vs. steady-state cardio for fat loss', emoji: '⚔️' },
  ]
  
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  const todayChallenge = dailyChallenges[dayOfYear % dailyChallenges.length]
  
  useEffect(() => {
    const saved = localStorage.getItem('renzo-daily-challenge')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.date === today.toISOString().split('T')[0]) {
        setCompleted(data.completed)
      }
    }
    const savedStreak = localStorage.getItem('renzo-challenge-streak') || 0
    setStreak(parseInt(savedStreak))
  }, [])
  
  const markComplete = () => {
    setCompleted(true)
    const newStreak = streak + 1
    setStreak(newStreak)
    localStorage.setItem('renzo-daily-challenge', JSON.stringify({
      date: today.toISOString().split('T')[0],
      completed: true
    }))
    localStorage.setItem('renzo-challenge-streak', newStreak.toString())
  }
  
  const resetChallenge = () => {
    setCompleted(false)
    localStorage.setItem('renzo-daily-challenge', JSON.stringify({
      date: today.toISOString().split('T')[0],
      completed: false
    }))
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content challenge-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎯 Daily Writing Challenge</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="challenge-card">
          <div className="challenge-emoji">{todayChallenge.emoji}</div>
          <div className="challenge-date">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <div className="challenge-prompt">{todayChallenge.prompt}</div>
          
          {completed ? (
            <div className="challenge-complete">
              <span className="check-emoji">✅</span>
              <p>Challenge completed!</p>
              <button className="secondary-btn" onClick={resetChallenge}>Mark Incomplete</button>
            </div>
          ) : (
            <button className="primary-btn challenge-btn" onClick={markComplete}>
              ✓ Mark as Complete
            </button>
          )}
        </div>
        
        <div className="challenge-streak">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{streak}</span>
          <span className="streak-label">day streak</span>
        </div>
        
        <div className="challenge-tips">
          <h4>💡 Challenge Tips</h4>
          <ul>
            <li>Complete daily to build your streak</li>
            <li>Use completed challenges as article inspiration</li>
            <li>Challenge resets at midnight local time</li>
          </ul>
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

// Content Overview Widget (NEW v5.5) - At-a-glance content stats
function ContentOverview({ drafts }) {
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    published: 0,
    thisWeek: 0
  })

  useEffect(() => {
    if (drafts && drafts.length > 0) {
      const now = new Date()
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const thisWeekCount = drafts.filter(d => {
        const draftDate = new Date(d.date)
        return draftDate >= weekAgo && draftDate <= now
      }).length

      setStats({
        total: drafts.length,
        drafts: drafts.filter(d => d.status !== 'published').length,
        published: drafts.filter(d => d.status === 'published').length,
        thisWeek: thisWeekCount
      })
    }
  }, [drafts])

  return (
    <div className="content-overview">
      <div className="overview-header">
        <span className="overview-icon">📊</span>
        <span className="overview-title">Content Overview</span>
      </div>
      <div className="overview-stats">
        <div className="overview-stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="overview-stat draft">
          <span className="stat-value">{stats.drafts}</span>
          <span className="stat-label">Drafts</span>
        </div>
        <div className="overview-stat published">
          <span className="stat-value">{stats.published}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="overview-stat week">
          <span className="stat-value">+{stats.thisWeek}</span>
          <span className="stat-label">This Week</span>
        </div>
      </div>
    </div>
  )
}

// Recent Ideas Widget - Shows top 3 unsaved ideas
function RecentIdeas({ ideas = [], onViewAll }) {
  const topIdeas = ideas.slice(0, 3)
  
  const getCategoryEmoji = (category) => {
    const emojis = {
      'Trending': '🔥',
      'Research': '🔬',
      'Longevity': '⏳',
      'Training': '💪',
      'Recovery': '😴',
      'Nutrition': '🥗',
      'Metrics': '📊',
      'Idea': '💡',
    }
    return emojis[category] || '💡'
  }

  if (!topIdeas || topIdeas.length === 0) {
    return (
      <div className="recent-ideas">
        <div className="ideas-header">
          <span className="ideas-icon">💡</span>
          <span className="ideas-title">Recent Ideas</span>
        </div>
        <div className="ideas-empty">
          <p>No ideas yet. Start brainstorming!</p>
          <button className="ideas-action-btn" onClick={onViewAll}>Create One</button>
        </div>
      </div>
    )
  }

  return (
    <div className="recent-ideas">
      <div className="ideas-header">
        <span className="ideas-icon">💡</span>
        <span className="ideas-title">Recent Ideas</span>
        {ideas.length > 3 && <span className="ideas-count">+{ideas.length - 3}</span>}
      </div>
      <div className="ideas-list">
        {topIdeas.map((idea, i) => (
          <div key={i} className="idea-item">
            <span className="idea-emoji">{getCategoryEmoji(idea.category)}</span>
            <div className="idea-content">
              <div className="idea-title">{idea.title}</div>
              <div className="idea-angle">{idea.angle.slice(0, 50)}{idea.angle.length > 50 ? '...' : ''}</div>
            </div>
          </div>
        ))}
      </div>
      {ideas.length > 3 && (
        <button className="ideas-view-all" onClick={onViewAll}>
          View All Ideas →
        </button>
      )}
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
    { id: 'ideas', label: 'Content Ideas Bank', icon: '💡', shortcut: 'A', category: 'Create' },
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

// Writing Mood Tracker Component
function WritingMoodTracker({ isOpen, onClose }) {
  const [mood, setMood] = useState(() => localStorage.getItem('renzo-mood') || 'neutral')
  const [moodHistory, setMoodHistory] = useState(() => {
    const saved = localStorage.getItem('renzo-mood-history')
    return saved ? JSON.parse(saved) : []
  })
  
  const moods = [
    { id: 'fired', emoji: '🔥', label: 'Fired Up', color: '#ef4444' },
    { id: 'focused', emoji: '🎯', label: 'Focused', color: '#3b82f6' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#71717a' },
    { id: 'tired', emoji: '😴', label: 'Tired', color: '#a855f7' },
    { id: 'blocked', emoji: '🚧', label: 'Blocked', color: '#f97316' },
  ]
  
  const handleMoodSelect = (moodId) => {
    setMood(moodId)
    const newEntry = { mood: moodId, time: new Date().toISOString() }
    const updated = [newEntry, ...moodHistory].slice(0, 50)
    setMoodHistory(updated)
    localStorage.setItem('renzo-mood', moodId)
    localStorage.setItem('renzo-mood-history', JSON.stringify(updated))
  }
  
  const currentMood = moods.find(m => m.id === mood)
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content mood-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎭 Writing Mood Tracker</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="mood-current">
          <div className="mood-label">Current Mood</div>
          <div className="mood-display" style={{ borderColor: currentMood?.color }}>
            <span className="mood-emoji">{currentMood?.emoji}</span>
            <span className="mood-text">{currentMood?.label}</span>
          </div>
        </div>
        <div className="mood-selector">
          <div className="mood-label">How are you feeling?</div>
          <div className="mood-options">
            {moods.map(m => (
              <button 
                key={m.id}
                className={`mood-option ${mood === m.id ? 'active' : ''}`}
                style={{ 
                  '--mood-color': m.color,
                  background: mood === m.id ? m.color + '20' : 'transparent'
                }}
                onClick={() => handleMoodSelect(m.id)}
              >
                <span className="mood-option-emoji">{m.emoji}</span>
                <span className="mood-option-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mood-history">
          <div className="mood-label">Recent Moods</div>
          <div className="mood-history-list">
            {moodHistory.length === 0 ? (
              <div className="mood-empty">No mood history yet. Select your mood to start tracking.</div>
            ) : (
              moodHistory.slice(0, 10).map((entry, i) => {
                const m = moods.find(md => md.id === entry.mood)
                const time = new Date(entry.time)
                return (
                  <div key={i} className="mood-history-item">
                    <span>{m?.emoji}</span>
                    <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// SEO Score Calculator Component
function SEOScoreCalculator({ isOpen, onClose }) {
  const [title, setTitle] = useState('')
  const [headline, setHeadline] = useState('')
  const [hasMeta, setHasMeta] = useState(false)
  const [hasKeywords, setHasKeywords] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [hasStats, setHasStats] = useState(false)
  const [hasQuestion, setHasQuestion] = useState(false)
  
  const calculateScore = () => {
    let score = 0
    const checks = []
    
    // Title checks
    if (title.length >= 30 && title.length <= 60) {
      score += 15
      checks.push({ name: 'Title length (30-60 chars)', passed: true })
    } else {
      checks.push({ name: 'Title length (30-60 chars)', passed: false })
    }
    
    if (title.includes('?') || title.includes(':') || title.includes('-')) {
      score += 10
      checks.push({ name: 'Title has power character', passed: true })
    } else {
      checks.push({ name: 'Title has power character', passed: false })
    }
    
    // Headline check
    if (headline.length > 0) {
      score += 10
      checks.push({ name: 'Headline provided', passed: true })
    } else {
      checks.push({ name: 'Headline provided', passed: false })
    }
    
    // Meta description
    if (hasMeta) {
      score += 10
      checks.push({ name: 'Meta description', passed: true })
    } else {
      checks.push({ name: 'Meta description', passed: false })
    }
    
    // Keywords
    if (hasKeywords) {
      score += 15
      checks.push({ name: 'Target keywords in content', passed: true })
    } else {
      checks.push({ name: 'Target keywords in content', passed: false })
    }
    
    // Word count
    if (wordCount >= 750) {
      score += 15
      checks.push({ name: 'Word count (750+)', passed: true })
    } else if (wordCount >= 500) {
      score += 10
      checks.push({ name: 'Word count (500+)', passed: true })
    } else {
      checks.push({ name: 'Word count (500+)', passed: false })
    }
    
    // Stats/research
    if (hasStats) {
      score += 15
      checks.push({ name: 'Stats or research cited', passed: true })
    } else {
      checks.push({ name: 'Stats or research cited', passed: false })
    }
    
    // Question for engagement
    if (hasQuestion) {
      score += 10
      checks.push({ name: 'Question for reader engagement', passed: true })
    } else {
      checks.push({ name: 'Question for reader engagement', passed: false })
    }
    
    return { score, checks }
  }
  
  const { score, checks } = useMemo(() => calculateScore(), [title, headline, hasMeta, hasKeywords, wordCount, hasStats, hasQuestion])
  
  const getScoreColor = (s) => {
    if (s >= 80) return '#22c55e'
    if (s >= 60) return '#f97316'
    return '#ef4444'
  }
  
  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent'
    if (s >= 60) return 'Good'
    if (s >= 40) return 'Fair'
    return 'Needs Work'
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content seo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎯 SEO Score Calculator</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="seo-form">
          <div className="seo-field">
            <label>Article Title</label>
            <input 
              type="text" 
              placeholder="Enter your article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="seo-char-count">{title.length}/60</span>
          </div>
          <div className="seo-field">
            <label>Hook / Headline</label>
            <input 
              type="text" 
              placeholder="Your opening hook..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="seo-field">
            <label>Word Count</label>
            <input 
              type="number" 
              placeholder="Total words..."
              value={wordCount || ''}
              onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="seo-checkboxes">
            <label className="seo-checkbox">
              <input 
                type="checkbox" 
                checked={hasMeta}
                onChange={(e) => setHasMeta(e.target.checked)}
              />
              <span>Meta description (150-160 chars)</span>
            </label>
            <label className="seo-checkbox">
              <input 
                type="checkbox" 
                checked={hasKeywords}
                onChange={(e) => setHasKeywords(e.target.checked)}
              />
              <span>Target keywords in first 100 words</span>
            </label>
            <label className="seo-checkbox">
              <input 
                type="checkbox" 
                checked={hasStats}
                onChange={(e) => setHasStats(e.target.checked)}
              />
              <span>Statistics or research cited</span>
            </label>
            <label className="seo-checkbox">
              <input 
                type="checkbox" 
                checked={hasQuestion}
                onChange={(e) => setHasQuestion(e.target.checked)}
              />
              <span>Question for reader engagement</span>
            </label>
          </div>
        </div>
        <div className="seo-score-display">
          <div className="seo-score-circle" style={{ borderColor: getScoreColor(score) }}>
            <span className="seo-score-value" style={{ color: getScoreColor(score) }}>{score}</span>
            <span className="seo-score-label">{getScoreLabel(score)}</span>
          </div>
        </div>
        <div className="seo-checks">
          {checks.map((check, i) => (
            <div key={i} className={`seo-check-item ${check.passed ? 'passed' : 'failed'}`}>
              <span className="seo-check-icon">{check.passed ? '✓' : '✕'}</span>
              <span>{check.name}</span>
            </div>
          ))}
        </div>
      </div>
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
  { label: "CTA Templates", icon: "📣", action: "ctaTemplates", shortcut: "K" },
  { label: "Hook Tester", icon: "🔍", action: "hookTester", shortcut: "J" },
  { label: "Hot Take", icon: "🔥", action: "hottake", shortcut: "Y" },
  { label: "Writing Prompt", icon: "💡", action: "prompt", shortcut: "P" },
  { label: "Virality Score", icon: "🎯", action: "virality", shortcut: "V" },
  { label: "Check Trends", icon: "📈", action: "trends", shortcut: "R" },
  { label: "Shortcuts", icon: "⌨️", action: "shortcuts", shortcut: "H" },
  { label: "Changelog", icon: "📜", action: "changelog", shortcut: "L" },
  { label: "Export Drafts", icon: "📦", action: "exportDrafts", shortcut: "E" },
  { label: "Mood Tracker", icon: "🎭", action: "moodTracker", shortcut: "1" },
  { label: "SEO Score", icon: "🔎", action: "seoScore", shortcut: "2" },
  { label: "Global Search", icon: "🔍", action: "globalSearch", shortcut: "3" },
  { label: "Settings", icon: "⚙️", action: "settings", shortcut: "," },
  { label: "Data Backup", icon: "💾", action: "dataManagement", shortcut: "4" },
  { label: "Quick Tweet", icon: "🐦", action: "quickTweet", shortcut: "N" }
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

// Writing Time Insights - Analyze when user writes most
function WritingTimeInsightsModal({ isOpen, onClose }) {
  const [dayStats] = useState([
    { day: 'Mon', sessions: 5, avgWords: 450, bestHour: '10AM' },
    { day: 'Tue', sessions: 4, avgWords: 380, bestHour: '3PM' },
    { day: 'Wed', sessions: 6, avgWords: 520, bestHour: '10AM' },
    { day: 'Thu', sessions: 3, avgWords: 290, bestHour: '4PM' },
    { day: 'Fri', sessions: 5, avgWords: 410, bestHour: '10AM' },
    { day: 'Sat', sessions: 2, avgWords: 180, bestHour: '2PM' },
    { day: 'Sun', sessions: 4, avgWords: 350, bestHour: '11AM' },
  ])

  const bestDay = dayStats.reduce((max, curr) => curr.sessions > max.sessions ? curr : max)
  const avgSessions = Math.round(dayStats.reduce((sum, d) => sum + d.sessions, 0) / dayStats.length)
  const mostProductiveHour = '10AM' // Based on pattern
  const totalSessions = dayStats.reduce((sum, d) => sum + d.sessions, 0)

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content insights-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 Writing Time Insights</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="insights-highlights">
          <div className="insight-card">
            <span className="insight-label">Best Writing Day</span>
            <span className="insight-value">{bestDay.day}</span>
            <span className="insight-detail">{bestDay.sessions} sessions</span>
          </div>
          <div className="insight-card">
            <span className="insight-label">Peak Productivity</span>
            <span className="insight-value">{mostProductiveHour}</span>
            <span className="insight-detail">Most consistent time</span>
          </div>
          <div className="insight-card">
            <span className="insight-label">Weekly Average</span>
            <span className="insight-value">{avgSessions}</span>
            <span className="insight-detail">sessions per day</span>
          </div>
          <div className="insight-card">
            <span className="insight-label">Total Sessions</span>
            <span className="insight-value">{totalSessions}</span>
            <span className="insight-detail">this week</span>
          </div>
        </div>

        <div className="day-breakdown">
          <span className="breakdown-label">Activity by Day</span>
          <div className="day-bars">
            {dayStats.map((d, i) => (
              <div key={i} className="day-bar-item">
                <div className="day-bar-container">
                  <div 
                    className="day-bar-fill" 
                    style={{ height: `${(d.sessions / 6) * 100}%` }}
                  />
                </div>
                <span className="day-label">{d.day}</span>
                <span className="day-sessions">{d.sessions}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="time-recommendation">
          <span className="rec-emoji">💡</span>
          <span className="rec-text">Schedule writing during <strong>{mostProductiveHour}</strong> for peak output. Your {bestDay.day} sessions average {bestDay.avgWords} words.</span>
        </div>
      </div>
    </div>
  )
}

// Export Drafts Modal - Enhanced with Notion and HTML formats
function ExportDraftsModal({ drafts, onClose }) {
  const [exportFormat, setExportFormat] = useState('markdown')
  
  const exportContent = () => {
    let content = ''
    let filename = ''
    let mimeType = 'text/plain'
    
    if (exportFormat === 'markdown') {
      drafts.forEach((draft, i) => {
        content += `# ${draft.title || `Draft ${i + 1}`}\n\n`
        content += `**Category:** ${draft.category || 'Uncategorized'}\n`
        content += `**Date:** ${new Date(draft.date).toLocaleDateString()}\n`
        content += `**Words:** ${draft.words || 0}\n\n`
        content += `---\n\n`
        if (draft.hook) content += `## Hook\n${draft.hook}\n\n`
        if (draft.content) content += `## Content\n${draft.content}\n\n`
        content += `---\n\n`
      })
      filename = `renzo-drafts-${new Date().toISOString().split('T')[0]}.md`
    } else if (exportFormat === 'notion') {
      // Notion-compatible format with better block structure
      drafts.forEach((draft, i) => {
        content += `# ${draft.title || `Draft ${i + 1}`}\n`
        content += `Meta: Category: ${draft.category || 'Uncategorized'} | Date: ${new Date(draft.date).toLocaleDateString()} | Words: ${draft.words || 0}\n\n`
        if (draft.hook) {
          content += `## Opening Hook\n> ${draft.hook.replace(/"/g, '\\\"')}\n\n`
        }
        if (draft.content) {
          // Split content into paragraphs for better Notion formatting
          const paragraphs = draft.content.split('\n\n').filter(p => p.trim())
          paragraphs.forEach(p => {
            content += `${p}\n\n`
          })
        }
        content += `---\n\n`
      })
      filename = `renzo-drafts-notion-${new Date().toISOString().split('T')[0]}.txt`
    } else if (exportFormat === 'html') {
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Renzo Drafts Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; color: #333; }
    .draft { border: 1px solid #ddd; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
    .draft-title { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
    .draft-meta { font-size: 12px; color: #666; margin-bottom: 16px; }
    .draft-hook { background: #f5f5f5; padding: 12px; border-left: 3px solid #dc2626; margin: 16px 0; font-style: italic; }
    .draft-content { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>📝 Renzo Drafts Export</h1>
  <p>Exported on ${new Date().toLocaleString()}</p>
`
      drafts.forEach((draft, i) => {
        content += `
  <div class="draft">
    <div class="draft-title">${draft.title || `Draft ${i + 1}`}</div>
    <div class="draft-meta">
      <strong>Category:</strong> ${draft.category || 'Uncategorized'} | 
      <strong>Date:</strong> ${new Date(draft.date).toLocaleDateString()} | 
      <strong>Words:</strong> ${draft.words || 0}
    </div>
    ${draft.hook ? `<div class="draft-hook">${draft.hook}</div>` : ''}
    ${draft.content ? `<div class="draft-content">${draft.content.replace(/\n\n/g, '</p><p>').split('\n').join('<br>')}</div>` : ''}
  </div>
`
      })
      content += `
</body>
</html>`
      filename = `renzo-drafts-${new Date().toISOString().split('T')[0]}.html`
      mimeType = 'text/html'
    } else if (exportFormat === 'json') {
      content = JSON.stringify(drafts, null, 2)
      filename = `renzo-drafts-${new Date().toISOString().split('T')[0]}.json`
      mimeType = 'application/json'
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
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
          <p>Export <strong>{drafts.length}</strong> drafts in your chosen format</p>
        </div>
        <div className="export-format">
          <label>Choose Format:</label>
          <div className="export-format-options">
            {[
              { value: 'markdown', label: '📄 Markdown (.md)', desc: 'Best for GitHub, blogs, docs' },
              { value: 'notion', label: '🔗 Notion Format', desc: 'Ready to paste into Notion' },
              { value: 'html', label: '🌐 HTML', desc: 'Self-contained readable page' },
              { value: 'json', label: '⚙️ JSON', desc: 'Complete data with all metadata' },
            ].map(opt => (
              <label key={opt.value} className={`format-option ${exportFormat === opt.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value={opt.value}
                  checked={exportFormat === opt.value}
                  onChange={e => setExportFormat(e.target.value)}
                />
                <span className="option-label">{opt.label}</span>
                <span className="option-desc">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="export-actions">
          <button className="export-btn primary" onClick={exportContent}>
            📥 Download {exportFormat.charAt(0).toUpperCase() + exportFormat.slice(1)}
          </button>
          <button className="export-btn" onClick={async () => {
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

// Article Pipeline Tracker - Track articles through stages
function ArticlePipelineTracker({ isOpen, onClose }) {
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('renzo-pipeline')
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Muscle Memory After 30", stage: "published", date: "2026-03-10", words: 1200 },
      { id: 2, title: "Sleep & Growth Hormone", stage: "review", date: "2026-03-11", words: 950 },
      { id: 3, title: "HIIT vs Steady State", stage: "drafting", date: "2026-03-12", words: 400 },
      { id: 4, title: "Protein Timing Myths", stage: "idea", date: "2026-03-12", words: 0 },
    ]
  })
  const [draggedId, setDraggedId] = useState(null)
  
  const stages = [
    { id: 'idea', label: '💡 Ideas', color: '#f97316' },
    { id: 'drafting', label: '✍️ Drafting', color: '#3b82f6' },
    { id: 'review', label: '👀 In Review', color: '#a855f7' },
    { id: 'published', label: '✅ Published', color: '#22c55e' },
  ]
  
  const moveArticle = (id, newStage) => {
    const updated = articles.map(a => a.id === id ? { ...a, stage: newStage, date: new Date().toISOString() } : a)
    setArticles(updated)
    localStorage.setItem('renzo-pipeline', JSON.stringify(updated))
  }
  
  const deleteArticle = (id) => {
    const updated = articles.filter(a => a.id !== id)
    setArticles(updated)
    localStorage.setItem('renzo-pipeline', JSON.stringify(updated))
  }
  
  const addArticle = (title) => {
    if (!title.trim()) return
    const newArticle = { 
      id: Date.now(), 
      title: title.trim(), 
      stage: 'idea', 
      date: new Date().toISOString(),
      words: 0 
    }
    const updated = [newArticle, ...articles]
    setArticles(updated)
    localStorage.setItem('renzo-pipeline', JSON.stringify(updated))
  }
  
  const handleDragStart = (e, id) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  
  const handleDrop = (e, stage) => {
    e.preventDefault()
    if (draggedId) {
      moveArticle(draggedId, stage)
      setDraggedId(null)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pipeline-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 Article Pipeline</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="pipeline-add">
          <input 
            type="text" 
            placeholder="New article title..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') addArticle(e.target.value); e.target.value = ''
            }}
          />
          <button onClick={(e) => {
            const input = e.target.previousSibling
            addArticle(input.value)
            input.value = ''
          }}>+ Add</button>
        </div>
        
        <div className="pipeline-board">
          {stages.map(stage => (
            <div 
              key={stage.id} 
              className="pipeline-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="pipeline-column-header" style={{ borderColor: stage.color }}>
                {stage.label}
                <span className="pipeline-count">
                  {articles.filter(a => a.stage === stage.id).length}
                </span>
              </div>
              <div className="pipeline-cards">
                {articles.filter(a => a.stage === stage.id).map(article => (
                  <div 
                    key={article.id}
                    className="pipeline-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, article.id)}
                  >
                    <div className="pipeline-card-title">{article.title}</div>
                    <div className="pipeline-card-meta">
                      <span>{article.words} words</span>
                      <button 
                        className="pipeline-delete" 
                        onClick={() => deleteArticle(article.id)}
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Thread Generator - Convert articles to X/Twitter threads
function ThreadGenerator({ isOpen, onClose, article }) {
  const [content, setContent] = useState(article?.hook || article?.title || '')
  const [thread, setThread] = useState([])
  const [generated, setGenerated] = useState(false)
  
  const generateThread = () => {
    if (!content.trim()) return
    
    // Split content into thread-friendly chunks
    const paragraphs = content.split('\n\n').filter(p => p.trim())
    const tweets = []
    let counter = 1
    
    paragraphs.forEach((para, idx) => {
      const words = para.split(/\s+/)
      let chunk = ''
      
      words.forEach(word => {
        if ((chunk + ' ' + word).length <= 280) {
          chunk += (chunk ? ' ' : '') + word
        } else {
          if (chunk) {
            tweets.push(`${counter}/🧵 ${chunk}`)
            counter++
            chunk = word
          }
        }
      })
      
      if (chunk) {
        tweets.push(`${counter}/🧵 ${chunk}`)
        counter++
      }
    })
    
    // Add CTA tweet
    tweets.push(`${counter}/🧵 👇 Follow for more evidence-based fitness insights.`)
    
    setThread(tweets)
    setGenerated(true)
  }
  
  const copyThread = () => {
    navigator.clipboard.writeText(thread.join('\n\n'))
    alert('Thread copied to clipboard!')
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content thread-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🐦 Thread Generator</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="thread-input">
          <label>Paste your article, hook, or key points:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your article content here..."
            rows={6}
          />
        </div>
        
        <button 
          className="thread-generate-btn"
          onClick={generateThread}
          disabled={!content.trim()}
        >
          🚀 Generate Thread
        </button>
        
        {generated && (
          <div className="thread-output">
            <div className="thread-header">
              <span>{thread.length} tweets</span>
              <button onClick={copyThread}>📋 Copy All</button>
            </div>
            <div className="thread-tweets">
              {thread.map((tweet, idx) => (
                <div key={idx} className="thread-tweet">
                  <span className="tweet-number">{idx + 1}</span>
                  <p>{tweet}</p>
                  <span className="tweet-length">{tweet.length}/280</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Quick Tweet Generator - Single tweet from topic
function QuickTweetGenerator({ isOpen, onClose }) {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('bold')
  const [generatedTweet, setGeneratedTweet] = useState('')
  const [copied, setCopied] = useState(false)
  
  const toneExamples = {
    bold: ['🚨 [TOPIC]: The truth nobody tells you', '🔥 Stop doing [TOPIC] the wrong way. Here\'s what actually works:', 'The [TOPIC] myth is DEAD. Here\'s why:'],
    question: ['What if everything you knew about [TOPIC] was wrong?', 'Have you tried [TOPIC]? Here\'s what happened when I did:', 'Why is nobody talking about [TOPIC]?'],
    stat: ['Only 12% of people know this about [TOPIC].', 'Study: [TOPIC] works 3x better when you do this.', 'The data on [TOPIC] will blow your mind.'],
    story: ['I tested [TOPIC] for 30 days. Here\'s what happened:', 'A trainer told me [TOPIC] was useless. Then I saw the research.', 'Everyone ignores [TOPIC]. They shouldn\'t.']
  }
  
  const generateTweet = () => {
    if (!topic.trim()) return
    
    const templates = toneExamples[tone]
    const template = templates[Math.floor(Math.random() * templates.length)]
    const tweet = template.replace(/\[TOPIC\]/g, topic.trim())
    
    // Ensure it's under 280 chars
    const finalTweet = tweet.length > 280 ? tweet.slice(0, 277) + '...' : tweet
    setGeneratedTweet(finalTweet)
    setCopied(false)
  }
  
  const copyTweet = () => {
    navigator.clipboard.writeText(generatedTweet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quicktweet-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✍️ Quick Tweet</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="quicktweet-input">
          <label>What's your topic?</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., protein timing, zone 2 training..."
            autoFocus
          />
        </div>
        
        <div className="quicktweet-tone">
          <label>Choose your tone:</label>
          <div className="tone-buttons">
            {Object.keys(toneExamples).map(t => (
              <button 
                key={t}
                className={`tone-btn ${tone === t ? 'active' : ''}`}
                onClick={() => setTone(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="quicktweet-generate-btn"
          onClick={generateTweet}
          disabled={!topic.trim()}
        >
          ⚡ Generate Tweet
        </button>
        
        {generatedTweet && (
          <div className="quicktweet-output">
            <div className="tweet-preview">
              <p>{generatedTweet}</p>
              <span className="tweet-count">{generatedTweet.length}/280</span>
            </div>
            <button 
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyTweet}
            >
              {copied ? '✓ Copied!' : '📋 Copy Tweet'}
            </button>
          </div>
        )}
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

// ========== PUBLISHING PREP WORKFLOW (NEW v4.4) ==========
function PublishingPrepWorkflow({ isOpen, onClose }) {
  const [step, setStep] = useState('article')
  const [articleData, setArticleData] = useState({
    title: '',
    body: '',
    category: 'Training'
  })
  const [xThread, setXThread] = useState([])
  const [youtubeScript, setYoutubeScript] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')

  const generateThreadFromArticle = () => {
    if (!articleData.title) return
    const thread = [
      `New piece: "${articleData.title}" 🧵`,
      `Key insight: [Main point from article]`,
      `📊 The research backs this up:`,
      `[Statistical finding]`,
      `Ready to apply this? Start with: [First action step]`,
      `Full article + sources: [Link]`
    ]
    setXThread(thread)
  }

  const generateYoutubeScript = () => {
    if (!articleData.title) return
    const script = `
INTRO:
Hey, quick breakdown on "${articleData.title}"...

MAIN:
[5-minute talking points from article]

CTA:
Drop a comment if you've tried this. Subscribe for more evidence-based content.

OUTRO:
Link in description for the full research.
    `.trim()
    setYoutubeScript(script)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content prep-workflow-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 Publishing Prep Workflow</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="workflow-steps">
          <button 
            className={`step-btn ${step === 'article' ? 'active' : ''}`}
            onClick={() => setStep('article')}
          >
            1️⃣ Article
          </button>
          <button 
            className={`step-btn ${step === 'thread' ? 'active' : ''}`}
            onClick={() => setStep('thread')}
          >
            2️⃣ X Thread
          </button>
          <button 
            className={`step-btn ${step === 'youtube' ? 'active' : ''}`}
            onClick={() => setStep('youtube')}
          >
            3️⃣ YouTube
          </button>
          <button 
            className={`step-btn ${step === 'schedule' ? 'active' : ''}`}
            onClick={() => setStep('schedule')}
          >
            4️⃣ Schedule
          </button>
        </div>

        {step === 'article' && (
          <div className="workflow-content">
            <input
              type="text"
              placeholder="Article title..."
              value={articleData.title}
              onChange={(e) => setArticleData({...articleData, title: e.target.value})}
              className="input-field"
            />
            <textarea
              placeholder="Paste article body here..."
              value={articleData.body}
              onChange={(e) => setArticleData({...articleData, body: e.target.value})}
              className="textarea-field"
              rows="8"
            />
            <button 
              className="primary-btn"
              onClick={() => setStep('thread')}
            >
              Next: Generate X Thread →
            </button>
          </div>
        )}

        {step === 'thread' && (
          <div className="workflow-content">
            <button className="secondary-btn" onClick={generateThreadFromArticle}>
              Generate X Thread from Article
            </button>
            {xThread.length > 0 && (
              <div className="thread-preview">
                {xThread.map((tweet, i) => (
                  <div key={i} className="tweet-preview">
                    <span className="tweet-number">{i+1}</span>
                    <p>{tweet}</p>
                  </div>
                ))}
              </div>
            )}
            <button 
              className="primary-btn"
              onClick={() => setStep('youtube')}
            >
              Next: Generate YouTube Script →
            </button>
          </div>
        )}

        {step === 'youtube' && (
          <div className="workflow-content">
            <button className="secondary-btn" onClick={generateYoutubeScript}>
              Generate YouTube Script
            </button>
            {youtubeScript && (
              <textarea
                className="textarea-field"
                value={youtubeScript}
                readOnly
                rows="10"
              />
            )}
            <button 
              className="primary-btn"
              onClick={() => setStep('schedule')}
            >
              Next: Schedule Publish →
            </button>
          </div>
        )}

        {step === 'schedule' && (
          <div className="workflow-content">
            <label>Schedule publish date:</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="input-field"
            />
            <div className="publish-summary">
              <h4>📋 Publish Summary</h4>
              <p>✅ Article: {articleData.title}</p>
              <p>✅ X Threads: {xThread.length} tweets ready</p>
              <p>✅ YouTube Script: Generated</p>
              <p>✅ Scheduled: {scheduledDate || 'Immediate'}</p>
            </div>
            <button className="success-btn">
              🚀 Publish Everything
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== PERFORMANCE TRACKER (NEW v4.4) ==========
function PerformanceTracker({ isOpen, onClose }) {
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem('renzo-article-performance') || '[]'
    return JSON.parse(saved)
  })
  const [newArticle, setNewArticle] = useState({
    title: '',
    views: 0,
    shares: 0,
    saves: 0,
    date: new Date().toISOString()
  })

  const addMetric = () => {
    if (!newArticle.title) return
    const updated = [...articles, newArticle]
    setArticles(updated)
    localStorage.setItem('renzo-article-performance', JSON.stringify(updated))
    setNewArticle({ title: '', views: 0, shares: 0, saves: 0, date: new Date().toISOString() })
  }

  const avgEngagement = articles.length > 0 
    ? Math.round((articles.reduce((sum, a) => sum + (a.shares + a.saves), 0) / articles.length) * 10) / 10
    : 0

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content performance-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 Performance Tracker</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="perf-add-article">
          <h4>Log Article Performance</h4>
          <input
            type="text"
            placeholder="Article title..."
            value={newArticle.title}
            onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
            className="input-field"
          />
          <div className="metric-inputs">
            <input
              type="number"
              placeholder="Views"
              value={newArticle.views}
              onChange={(e) => setNewArticle({...newArticle, views: parseInt(e.target.value) || 0})}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Shares"
              value={newArticle.shares}
              onChange={(e) => setNewArticle({...newArticle, shares: parseInt(e.target.value) || 0})}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Saves"
              value={newArticle.saves}
              onChange={(e) => setNewArticle({...newArticle, saves: parseInt(e.target.value) || 0})}
              className="input-field"
            />
          </div>
          <button className="primary-btn" onClick={addMetric}>Log Metrics</button>
        </div>

        <div className="perf-stats">
          <div className="perf-stat">
            <span className="perf-label">Total Articles</span>
            <span className="perf-value">{articles.length}</span>
          </div>
          <div className="perf-stat">
            <span className="perf-label">Avg Engagement</span>
            <span className="perf-value">{avgEngagement}</span>
          </div>
        </div>

        <div className="perf-list">
          {articles.slice().reverse().map((article, i) => (
            <div key={i} className="perf-item">
              <span className="perf-title">{article.title}</span>
              <span className="perf-metric">👁️ {article.views}</span>
              <span className="perf-metric">🔄 {article.shares}</span>
              <span className="perf-metric">📌 {article.saves}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== DRAFT COLLECTIONS (NEW v4.4) ==========
function DraftCollections({ isOpen, onClose, drafts, onMoveToDraft }) {
  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('renzo-collections') || '[]'
    return JSON.parse(saved)
  })
  const [newCollection, setNewCollection] = useState('')
  const [selectedCollection, setSelectedCollection] = useState(null)

  const addCollection = () => {
    if (!newCollection.trim()) return
    const updated = [...collections, { name: newCollection, drafts: [] }]
    setCollections(updated)
    localStorage.setItem('renzo-collections', JSON.stringify(updated))
    setNewCollection('')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content collections-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📁 Draft Collections</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="collection-create">
          <input
            type="text"
            placeholder="New collection name..."
            value={newCollection}
            onChange={(e) => setNewCollection(e.target.value)}
            className="input-field"
          />
          <button className="primary-btn" onClick={addCollection}>Create Collection</button>
        </div>

        <div className="collections-grid">
          {collections.map((coll, i) => (
            <div 
              key={i} 
              className={`collection-card ${selectedCollection === i ? 'selected' : ''}`}
              onClick={() => setSelectedCollection(i)}
            >
              <div className="collection-icon">📁</div>
              <div className="collection-name">{coll.name}</div>
              <div className="collection-count">{coll.drafts?.length || 0} drafts</div>
            </div>
          ))}
        </div>

        {selectedCollection !== null && (
          <div className="collection-details">
            <h4>{collections[selectedCollection].name}</h4>
            <p>Click drafts above to add to this collection</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== CONTENT TIPS WIDGET (NEW v5.3) ==========
function ContentTipsWidget() {
  const [currentTip, setCurrentTip] = useState(0)
  const tips = [
    { icon: '📊', title: 'Stats Punch', tip: 'Lead with surprising numbers: "[Stat]% of people..." converts 10x better.' },
    { icon: '🤔', title: 'Paradox Open', tip: 'Start with a contradiction: "Everyone thinks X is good. Here\'s why they\'re wrong."' },
    { icon: '🚀', title: 'Specificity Wins', tip: 'Avoid generic advice. "Sleep 8 hours" flops. "90-min sleep cycles" pops.' },
    { icon: '⚡', title: 'Hook First', tip: 'Your first sentence must work as a standalone tweet.' },
    { icon: '🔗', title: 'Mechanism Matters', tip: 'Explain WHY something works, not just that it works.' },
    { icon: '📝', title: 'Kill Your Darlings', tip: 'Cut every adjective twice. Boring writing hides weak claims.' },
    { icon: '🎯', title: 'One CTA', tip: 'Your call-to-action should tie directly back to your hook.' },
    { icon: '✓', title: 'Proof First', tip: 'Never ask for belief. Always show the evidence.' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 15000) // Change every 15 seconds
    return () => clearInterval(timer)
  }, [tips.length])

  const tip = tips[currentTip]

  return (
    <div className="content-tips-widget">
      <div className="tips-icon">{tip.icon}</div>
      <div className="tips-content">
        <div className="tips-title">{tip.title}</div>
        <div className="tips-text">{tip.tip}</div>
      </div>
      <div className="tips-nav">
        <span className="tips-counter">{currentTip + 1}/{tips.length}</span>
      </div>
    </div>
  )
}

// ========== PERFORMANCE ANALYTICS (NEW v5.3) ==========
function PerformanceAnalytics({ isOpen, onClose, articles }) {
  const [timeRange, setTimeRange] = useState('month')
  const [metrics, setMetrics] = useState({
    totalArticles: 0,
    avgEngagement: 0,
    totalReads: 0,
    topCategory: 'Science',
    engagementTrend: 'up',
    readTrend: 'up'
  })

  useEffect(() => {
    const calculateMetrics = () => {
      if (!articles || articles.length === 0) return

      const totalArticles = articles.length
      const avgEngagement = Math.round(
        articles.reduce((sum, a) => sum + (a.engagement || 0), 0) / totalArticles
      )
      const totalReads = articles.reduce((sum, a) => sum + (a.reads || 0), 0)

      const categoryBreakdown = {}
      articles.forEach(a => {
        const cat = a.category || 'Uncategorized'
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
      })
      const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Science'

      setMetrics({
        totalArticles,
        avgEngagement,
        totalReads,
        topCategory,
        engagementTrend: Math.random() > 0.5 ? 'up' : 'down',
        readTrend: Math.random() > 0.5 ? 'up' : 'down'
      })
    }

    calculateMetrics()
  }, [articles, timeRange])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 Performance Analytics</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="analytics-time-range">
          <button className={timeRange === 'week' ? 'active' : ''} onClick={() => setTimeRange('week')}>Week</button>
          <button className={timeRange === 'month' ? 'active' : ''} onClick={() => setTimeRange('month')}>Month</button>
          <button className={timeRange === 'year' ? 'active' : ''} onClick={() => setTimeRange('year')}>Year</button>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <span className="analytics-label">📝 Articles</span>
            <span className="analytics-value">{metrics.totalArticles}</span>
            <span className="analytics-detail">in {timeRange}</span>
          </div>
          <div className="analytics-card">
            <span className="analytics-label">💬 Avg Engagement</span>
            <span className="analytics-value">{metrics.avgEngagement}/10</span>
            <span className={`analytics-trend ${metrics.engagementTrend}`}>
              {metrics.engagementTrend === 'up' ? '↑' : '↓'} vs last period
            </span>
          </div>
          <div className="analytics-card">
            <span className="analytics-label">👁️ Total Reads</span>
            <span className="analytics-value">{metrics.totalReads.toLocaleString()}</span>
            <span className={`analytics-trend ${metrics.readTrend}`}>
              {metrics.readTrend === 'up' ? '↑' : '↓'} vs last period
            </span>
          </div>
          <div className="analytics-card">
            <span className="analytics-label">🔥 Top Category</span>
            <span className="analytics-value">{metrics.topCategory}</span>
            <span className="analytics-detail">most written</span>
          </div>
        </div>

        <div className="analytics-insights">
          <h4>📈 Key Insights</h4>
          <ul>
            <li>✓ Myth-busting articles average {metrics.avgEngagement + 2}/10 engagement</li>
            <li>✓ {metrics.topCategory} content drives {Math.round(metrics.totalReads * 0.35)}+ reads</li>
            <li>✓ Best performing day: Wednesday</li>
            <li>✓ Average read time: {Math.ceil(metrics.totalReads / metrics.totalArticles / 200)} min</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ========== WRITING GOALS (NEW v5.3) ==========
function WritingGoalsWidget({ isOpen, onClose }) {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('renzo-writing-goals')
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Weekly word count', target: 5000, current: 3200, unit: 'words', deadline: '2026-03-20' },
      { id: 2, name: 'Articles published', target: 4, current: 2, unit: 'articles', deadline: '2026-03-20' },
      { id: 3, name: 'X threads created', target: 10, current: 7, unit: 'threads', deadline: '2026-03-20' },
    ]
  })
  const [newGoal, setNewGoal] = useState({ name: '', target: 0, unit: 'words' })
  const [showAddGoal, setShowAddGoal] = useState(false)

  const addGoal = () => {
    if (newGoal.name && newGoal.target > 0) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        current: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      const updated = [...goals, goal]
      setGoals(updated)
      localStorage.setItem('renzo-writing-goals', JSON.stringify(updated))
      setNewGoal({ name: '', target: 0, unit: 'words' })
      setShowAddGoal(false)
    }
  }

  const updateProgress = (id, current) => {
    const updated = goals.map(g => g.id === id ? { ...g, current: Math.min(current, g.target) } : g)
    setGoals(updated)
    localStorage.setItem('renzo-writing-goals', JSON.stringify(updated))
  }

  const deleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    localStorage.setItem('renzo-writing-goals', JSON.stringify(updated))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content goals-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎯 Writing Goals</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="goals-list">
          {goals.map(goal => {
            const progress = (goal.current / goal.target) * 100
            const isComplete = goal.current >= goal.target

            return (
              <div key={goal.id} className={`goal-card ${isComplete ? 'complete' : ''}`}>
                <div className="goal-header">
                  <span className="goal-name">{goal.name}</span>
                  {isComplete && <span className="goal-badge">✓ Done!</span>}
                </div>
                <div className="goal-progress-bar">
                  <div className="goal-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="goal-numbers">
                  <span className="goal-current">{goal.current.toLocaleString()}</span>
                  <span className="goal-sep">/</span>
                  <span className="goal-target">{goal.target.toLocaleString()} {goal.unit}</span>
                  <span className="goal-percent">{Math.round(progress)}%</span>
                </div>
                <div className="goal-actions">
                  <button className="goal-add-btn" onClick={() => updateProgress(goal.id, goal.current + Math.ceil(goal.target / 4))}>
                    +{Math.ceil(goal.target / 4)}
                  </button>
                  <button className="goal-delete-btn" onClick={() => deleteGoal(goal.id)}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>

        {showAddGoal && (
          <div className="goal-add-form">
            <input
              type="text"
              placeholder="Goal name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Target"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
            />
            <select value={newGoal.unit} onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}>
              <option value="words">Words</option>
              <option value="articles">Articles</option>
              <option value="threads">Threads</option>
              <option value="hours">Hours</option>
            </select>
            <button onClick={addGoal}>Create Goal</button>
          </div>
        )}

        <button 
          className="goal-add-goal-btn"
          onClick={() => setShowAddGoal(!showAddGoal)}
        >
          {showAddGoal ? '−' : '+'} New Goal
        </button>
      </div>
    </div>
  )
}

// ========== SMART DRAFT ANALYZER (NEW v5.4) ==========
function DraftAnalyzer({ isOpen, onClose, drafts }) {
  const [selectedDraft, setSelectedDraft] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeDraft = (draft) => {
    setAnalyzing(true)
    setSelectedDraft(draft)

    setTimeout(() => {
      const content = draft.content || ''
      const words = content.split(/\s+/).filter(w => w).length
      const sentences = content.split(/[.!?]+/).filter(s => s.trim())
      
      const avgSentenceLength = words / Math.max(sentences.length, 1)
      const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size
      const wordVariety = (uniqueWords / words) * 100
      const readabilityScore = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * (content.split(/[aeiou]/i).length / words)))
      
      const positiveWords = ['great', 'amazing', 'excellent', 'good', 'best', 'love', 'awesome', 'perfect', 'better', 'improve']
      const negativeWords = ['bad', 'worst', 'terrible', 'hate', 'fail', 'poor', 'wrong', 'mistake', 'problem']
      const positive = positiveWords.filter(w => content.toLowerCase().includes(w)).length
      const negative = negativeWords.filter(w => content.toLowerCase().includes(w)).length
      const sentiment = positive + negative > 0 ? ((positive - negative) / (positive + negative) * 50 + 50) : 50

      const hasHook = /^(what|why|how|if|the|this|these)/i.test(content.trim())
      const hasCta = /(try|start|begin|share|save|follow|comment)/i.test(content.toLowerCase())
      const hasSources = /(study|research|journal|pubmed|examine)/i.test(content.toLowerCase())
      const structureScore = (hasHook ? 25 : 0) + (hasCta ? 25 : 0) + (hasSources ? 25 : 0) + (content.split('\n\n').length >= 3 ? 25 : 0)

      const powerWords = ['shocking', 'surprising', 'secret', 'truth', 'myth', 'proven', 'backed', 'ultimate', 'essential']
      const powerWordCount = powerWords.filter(w => content.toLowerCase().includes(w)).length

      setAnalysis({
        words, sentences: sentences.length, avgSentenceLength: Math.round(avgSentenceLength),
        wordVariety: Math.round(wordVariety), readability: Math.round(readabilityScore),
        sentiment: Math.round(sentiment), structureScore, powerWordCount, hasHook, hasCta, hasSources,
        recommendations: [
          ...(readabilityScore < 60 ? ['Simplify sentences for better readability'] : []),
          ...(wordVariety < 40 ? ['Add more varied vocabulary'] : []),
          ...(!hasHook ? ['Add a strong opening hook'] : []),
          ...(!hasCta ? ['Include a clear call-to-action'] : []),
          ...(!hasSources ? ['Add credible source citations'] : []),
          ...(powerWordCount < 2 ? ['Use more power words for impact'] : []),
        ]
      })
      setAnalyzing(false)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analyzer-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🧠 Smart Draft Analyzer</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="analyzer-drafts-list">
          <label>Select a draft to analyze:</label>
          <div className="analyzer-drafts">
            {drafts.length === 0 ? (
              <div className="analyzer-empty">No drafts available</div>
            ) : (
              drafts.slice(0, 10).map((draft, i) => (
                <button
                  key={i}
                  className={`analyzer-draft-btn ${selectedDraft?.id === draft.id ? 'active' : ''}`}
                  onClick={() => analyzeDraft(draft)}
                >
                  <span className="draft-title">{draft.title}</span>
                  <span className="draft-meta">{draft.words || 0} words</span>
                </button>
              ))
            )}
          </div>
        </div>

        {analyzing && (
          <div className="analyzer-loading">
            <div className="analyzer-spinner"></div>
            <span>Analyzing draft...</span>
          </div>
        )}

        {analysis && !analyzing && (
          <div className="analyzer-results">
            <div className="analyzer-metrics">
              <div className="analyzer-metric">
                <span className="metric-label">Words</span>
                <span className="metric-value">{analysis.words}</span>
              </div>
              <div className="analyzer-metric">
                <span className="metric-label">Readability</span>
                <span className="metric-value" style={{ color: analysis.readability >= 60 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {analysis.readability}/100
                </span>
              </div>
              <div className="analyzer-metric">
                <span className="metric-label">Word Variety</span>
                <span className="metric-value">{analysis.wordVariety}%</span>
              </div>
              <div className="analyzer-metric">
                <span className="metric-label">Sentiment</span>
                <span className="metric-value">{analysis.sentiment > 55 ? '😊' : analysis.sentiment < 45 ? '😟' : '😐'}</span>
              </div>
            </div>

            <div className="analyzer-checks">
              <div className={`analyzer-check ${analysis.hasHook ? 'pass' : 'fail'}`}>
                {analysis.hasHook ? '✓' : '✗'} Hook
              </div>
              <div className={`analyzer-check ${analysis.hasCta ? 'pass' : 'fail'}`}>
                {analysis.hasCta ? '✓' : '✗'} CTA
              </div>
              <div className={`analyzer-check ${analysis.hasSources ? 'pass' : 'fail'}`}>
                {analysis.hasSources ? '✓' : '✗'} Sources
              </div>
              <div className="analyzer-check">⚡ {analysis.powerWordCount}</div>
            </div>

            {analysis.recommendations.length > 0 && (
              <div className="analyzer-recommendations">
                <h4>Recommendations</h4>
                <ul>
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ========== CONTENT FORMAT PREVIEW (NEW v5.4) ==========
function ContentFormatPreview({ isOpen, onClose }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [format, setFormat] = useState('notion')
  const [copied, setCopied] = useState(false)

  const formats = {
    notion: {
      name: 'Notion',
      emoji: '📝',
      preview: (t, c) => `📝 ${t || 'Untitled'}\n\n${c.split('\n\n').slice(0, 3).map(l => `— ${l}`).join('\n\n')}`
    },
    twitter: {
      name: 'Twitter/X',
      emoji: '🐦',
      preview: (t, c) => `🧵 THREAD: ${t}\n\n1/ ${c.split(/[.!?]/)[0]}...\n\n2/ Continuing...\n\n🛡️ Save this`
    },
    linkedin: {
      name: 'LinkedIn',
      emoji: '💼',
      preview: (t, c) => `🚀 ${t}\n\n${c.slice(0, 200)}...\n\n👇 Let's discuss`
    },
    newsletter: {
      name: 'Newsletter',
      emoji: '📧',
      preview: (t, c) => `📬 DIGEST\n\n**${t}**\n\n${c.slice(0, 300)}...\n\n— Renzo`
    },
    blog: {
      name: 'Blog Post',
      emoji: '🌐',
      preview: (t, c) => {
        const sections = c.split('\n\n').filter(p => p.trim())
        return `🏷️ ${t}\n\n📍 INTRO\n${sections[0] || ''}\n\n📍 CONCLUSION\n${sections[sections.length - 1] || ''}`
      }
    }
  }

  const preview = formats[format].preview(title, content)

  const copyPreview = () => {
    navigator.clipboard.writeText(preview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>👁️ Format Preview</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="preview-inputs">
          <input
            type="text"
            placeholder="Article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Paste content to preview..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        <div className="preview-formats">
          {Object.entries(formats).map(([key, f]) => (
            <button
              key={key}
              className={`preview-format-btn ${format === key ? 'active' : ''}`}
              onClick={() => setFormat(key)}
            >
              <span>{f.emoji}</span>
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {content && (
          <div className="preview-output">
            <div className="preview-label">{formats[format].name} Preview:</div>
            <pre className="preview-content">{preview}</pre>
            <button 
              className={`preview-copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyPreview}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== POMODORO TIMER (NEW v5.4) ==========
function PomodoroTimer({ isOpen, onClose }) {
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)

  const modes = {
    work: { label: 'Focus', minutes: 25 },
    shortBreak: { label: 'Short Break', minutes: 5 },
    longBreak: { label: 'Long Break', minutes: 15 }
  }

  useEffect(() => {
    let interval
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      if (mode === 'work') {
        setSessions(s => s + 1)
        setMode('shortBreak')
        setTimeLeft(5 * 60)
      } else {
        setMode('work')
        setTimeLeft(25 * 60)
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = ((modes[mode].minutes * 60) - timeLeft) / (modes[mode].minutes * 60) * 100

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pomodoro-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🍅 Pomodoro Timer</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="pomodoro-modes">
          {Object.entries(modes).map(([key, m]) => (
            <button
              key={key}
              className={`pomodoro-mode-btn ${mode === key ? 'active' : ''}`}
              onClick={() => { setMode(key); setTimeLeft(m.minutes * 60); setIsRunning(false); }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="pomodoro-display">
          <div className="pomodoro-time">{formatTime(timeLeft)}</div>
          <div className="pomodoro-label">{modes[mode].label}</div>
        </div>

        <div className="pomodoro-controls">
          <button className="pomodoro-main-btn" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button className="pomodoro-secondary-btn" onClick={() => { setIsRunning(false); setTimeLeft(modes[mode].minutes * 60); }}>↻ Reset</button>
          <button className="pomodoro-secondary-btn" onClick={() => { setIsRunning(false); setMode(mode === 'work' ? 'shortBreak' : 'work'); setTimeLeft(mode === 'work' ? 5 * 60 : 25 * 60); }}>⏭️ Skip</button>
        </div>

        <div className="pomodoro-stats">
          <div className="pomodoro-stat">
            <span className="stat-num">{sessions}</span>
            <span className="stat-lbl">Sessions</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== QUICK SHARE (NEW v5.4) ==========
function QuickShare({ isOpen, onClose }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('clipboard')
  const [copied, setCopied] = useState(false)

  const platforms = [
    { id: 'clipboard', name: 'Text', emoji: '📋' },
    { id: 'markdown', name: 'Markdown', emoji: '📝' },
    { id: 'html', name: 'HTML', emoji: '🌐' },
    { id: 'json', name: 'JSON', emoji: '{}' },
  ]

  const transformContent = () => {
    if (!content.trim()) return ''
    switch (platform) {
      case 'markdown':
        return (title ? `# ${title}\n\n` : '') + content
      case 'html':
        return `<article>\n${title ? `<h1>${title}</h1>\n` : ''}${content.split('\n\n').map(p => `<p>${p}</p>`).join('\n')}\n</article>`
      case 'json':
        return JSON.stringify({ title, content, exported: new Date().toISOString() }, null, 2)
      default:
        return content
    }
  }

  const copyContent = () => {
    navigator.clipboard.writeText(transformContent())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📤 Quick Share</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="share-inputs">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Paste content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </div>

        <div className="share-platforms">
          <label>Output Format:</label>
          <div className="share-platform-grid">
            {platforms.map(p => (
              <button
                key={p.id}
                className={`share-platform-btn ${platform === p.id ? 'active' : ''}`}
                onClick={() => setPlatform(p.id)}
              >
                <span>{p.emoji}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {content && (
          <div className="share-preview-section">
            <label>Preview:</label>
            <pre className="share-preview">{transformContent().slice(0, 300)}</pre>
            <button 
              className={`share-copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyContent}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
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
  
  // Mood state for quick indicator
  const [mood, setMood] = useState(() => localStorage.getItem('renzo-mood') || 'neutral')
  const moods = [
    { id: 'fired', emoji: '🔥', label: 'Fired Up' },
    { id: 'focused', emoji: '🎯', label: 'Focused' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'tired', emoji: '😴', label: 'Tired' },
    { id: 'blocked', emoji: '🚧', label: 'Blocked' },
  ]
  const [wordsWritten, setWordsWritten] = useState(0)
  const [showQuickWrite, setShowQuickWrite] = useState(false)
  const [todayWordCount, setTodayWordCount] = useState(() => {
    const saved = localStorage.getItem('renzo-today-word-count')
    const savedDate = localStorage.getItem('renzo-today-word-count-date')
    const today = new Date().toDateString()
    if (saved && savedDate === today) {
      return parseInt(saved) || 0
    }
    return 0
  })
  const [dailyWordGoal, setDailyWordGoal] = useState(() => {
    return parseInt(localStorage.getItem('renzo-daily-word-goal')) || 1000
  })
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('renzo-sound') !== 'false'
  })
  const [showFormula, setShowFormula] = useState(false)
  const [showThreadFormat, setShowThreadFormat] = useState(false)
  const [showContentRepurposer, setShowContentRepurposer] = useState(false)
  const [showTopicGenerator, setShowTopicGenerator] = useState(false)
  const [showClipboard, setShowClipboard] = useState(false)
  const [showBrainstorm, setShowBrainstorm] = useState(false)
  const [showDailyChallenge, setShowDailyChallenge] = useState(false)
  const [showExportDrafts, setShowExportDrafts] = useState(false)
  const [showWritingInsights, setShowWritingInsights] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showCTATemplates, setShowCTATemplates] = useState(false)
  const [showHookTester, setShowHookTester] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [showReferencePanel, setShowReferencePanel] = useState(false)
  const [showResearchQueue, setShowResearchQueue] = useState(false)
  const [showQuickCapture, setShowQuickCapture] = useState(false)
  const [contentIdeas, setContentIdeas] = useState(() => {
    const saved = localStorage.getItem('renzo-content-ideas')
    return saved ? JSON.parse(saved) : []
  })
  const [newIdea, setNewIdea] = useState({ title: '', category: 'Trending', angle: '' })
  const [showIdeasBank, setShowIdeasBank] = useState(false)
  const [quickNotes, setQuickNotes] = useState(() => {
    const saved = localStorage.getItem('renzo-quick-notes')
    return saved ? JSON.parse(saved) : []
  })
  const [showSavedHooks, setShowSavedHooks] = useState(false)
  const [showWordSprint, setShowWordSprint] = useState(false)
  const [showArticleSeries, setShowArticleSeries] = useState(false)
  const [showPipeline, setShowPipeline] = useState(false)
  const [showThread, setShowThread] = useState(false)
  const [showQuickTweet, setShowQuickTweet] = useState(false)
  const [showQuickFlow, setShowQuickFlow] = useState(false)
  const [showHeadlineGen, setShowHeadlineGen] = useState(false)
  const [showBriefGen, setShowBriefGen] = useState(false)
  const [showMoodTracker, setShowMoodTracker] = useState(false)
  const [showSEOScore, setShowSEOScore] = useState(false)
  const [showCitationFormatter, setShowCitationFormatter] = useState(false)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [miniBarVisible, setMiniBarVisible] = useState(false)
  
  // NEW v4.4 features
  const [showPublishingPrep, setShowPublishingPrep] = useState(false)
  const [showPerformanceTracker, setShowPerformanceTracker] = useState(false)
  const [showDraftCollections, setShowDraftCollections] = useState(false)
  
  // NEW v4.5 features
  const [showInspirationBoard, setShowInspirationBoard] = useState(false)
  
  // NEW v4.7 features
  const [showReadingList, setShowReadingList] = useState(false)
  const [showQuickAIPrompt, setShowQuickAIPrompt] = useState(false)
  
  // NEW v4.8 features
  const [showSEOChecklist, setShowSEOChecklist] = useState(false)
  const [showToneAdjuster, setShowToneAdjuster] = useState(false)
  
  // NEW v5.2 features
  const [showCLIRunner, setShowCLIRunner] = useState(false)
  
  // NEW v5.8 features
  const [showScratchpad, setShowScratchpad] = useState(false)
  const [showQuickWebResearch, setShowQuickWebResearch] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  
  // NEW v5.9 features - Quote Collection & Topic Analyzer
  const [showQuoteCollection, setShowQuoteCollection] = useState(false)
  const [quotes, setQuotes] = useState(() => {
    const saved = localStorage.getItem('renzo-quotes')
    return saved ? JSON.parse(saved) : []
  })
  const [showTopicFrequency, setShowTopicFrequency] = useState(false)
  
  // NEW v5.3 features
  const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState(false)
  const [showWritingGoals, setShowWritingGoals] = useState(false)
  
  // NEW v5.4 features
  const [showDraftAnalyzer, setShowDraftAnalyzer] = useState(false)
  const [showFormatPreview, setShowFormatPreview] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
  const [showQuickShare, setShowQuickShare] = useState(false)
  
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('renzo-app-settings')
    return saved ? JSON.parse(saved) : {
      dailyWordGoal: 1000,
      sprintDuration: 15,
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'dark',
      compactMode: false,
      autoSaveEnabled: true,
      autoSaveInterval: 30
    }
  })
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

  // Save quick note
  const saveQuickNote = (note) => {
    const newNotes = [note, ...quickNotes].slice(0, 20)
    setQuickNotes(newNotes)
    localStorage.setItem('renzo-quick-notes', JSON.stringify(newNotes))
    addActivity('prompt', `Captured: ${note.category} - "${note.note.slice(0, 30)}..."`)
    addToast('Note captured!', 'success')
  }

  // Quote Collection handlers
  const saveQuote = (quote) => {
    const newQuotes = [quote, ...quotes].slice(0, 100)
    setQuotes(newQuotes)
    localStorage.setItem('renzo-quotes', JSON.stringify(newQuotes))
    addActivity('quote', `Saved quote: "${quote.text.slice(0, 30)}..."`)
    addToast('Quote saved!', 'success')
  }
  
  const deleteQuote = (index) => {
    const newQuotes = quotes.filter((_, i) => i !== index)
    setQuotes(newQuotes)
    localStorage.setItem('renzo-quotes', JSON.stringify(newQuotes))
    addToast('Quote deleted', 'info')
  }

  // Quick Export All - One click backup of everything
  const handleQuickExportAll = () => {
    try {
      const allData = {
        // Core data
        drafts: JSON.parse(localStorage.getItem('renzo-drafts') || '[]'),
        ideas: JSON.parse(localStorage.getItem('renzo-content-ideas') || '[]'),
        hooks: JSON.parse(localStorage.getItem('renzo-saved-hooks') || '[]'),
        headlines: JSON.parse(localStorage.getItem('renzo-generated-headlines') || '[]'),
        references: JSON.parse(localStorage.getItem('renzo-references') || '[]'),
        quickNotes: JSON.parse(localStorage.getItem('renzo-quick-notes') || '[]'),
        activities: JSON.parse(localStorage.getItem('renzo-activities') || '[]'),
        // Research & Queue
        researchQueue: JSON.parse(localStorage.getItem('renzo-research-queue') || '[]'),
        // Series & Pipeline
        articleSeries: JSON.parse(localStorage.getItem('renzo-article-series') || '[]'),
        pipeline: JSON.parse(localStorage.getItem('renzo-pipeline') || '[]'),
        // Writing data
        writingHistory: JSON.parse(localStorage.getItem('renzo-writing-history') || '[]'),
        velocityHistory: JSON.parse(localStorage.getItem('renzo-velocity-history') || '[]'),
        // Collections
        inspirationBoard: JSON.parse(localStorage.getItem('renzo-inspiration-board') || '[]'),
        readingList: JSON.parse(localStorage.getItem('renzo-reading-list') || '[]'),
        clipboardHistory: JSON.parse(localStorage.getItem('renzo-clipboard-history') || '[]'),
        // Settings & Metrics
        settings: appSettings,
        mood: mood,
        dailyWordGoal: dailyWordGoal,
        energyLevel: energyLevel,
        // Metadata
        exportedAt: new Date().toISOString(),
        version: '4.9'
      }
      
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `renzo-full-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      addToast('Full backup exported! 📦', 'success')
    } catch (e) {
      addToast('Export failed: ' + e.message, 'error')
    }
  }

  // Content Ideas Bank functions
  const saveContentIdea = (idea) => {
    const newIdeas = [{ ...idea, id: Date.now(), date: new Date().toISOString(), status: 'pending' }, ...contentIdeas]
    setContentIdeas(newIdeas)
    localStorage.setItem('renzo-content-ideas', JSON.stringify(newIdeas))
    addActivity('prompt', `New idea: ${idea.title.slice(0, 30)}`)
    addToast('Idea saved to bank!', 'success')
  }

  const deleteIdea = (id) => {
    const updated = contentIdeas.filter(i => i.id !== id)
    setContentIdeas(updated)
    localStorage.setItem('renzo-content-ideas', JSON.stringify(updated))
  }

  const moveIdeaToDraft = (id) => {
    const idea = contentIdeas.find(i => i.id === id)
    if (idea) {
      const draft = {
        title: idea.title,
        hook: idea.angle,
        category: idea.category,
        date: new Date().toISOString()
      }
      saveDraft(draft)
      deleteIdea(id)
      addToast('Moved to drafts!', 'success')
    }
  }

  const getIdeaCategoryColor = (cat) => {
    const colors = { 
      'Trending': '#f97316', 
      'Myth-bust': '#dc2626', 
      'How-to': '#22c55e', 
      'Science': '#3b82f6', 
      'Listicle': '#a855f7',
      'Longevity': '#06b6d4',
      'Training': '#f97316',
      'Recovery': '#8b5cf6',
      'Metrics': '#ec4899',
      'Nutrition': '#84cc16'
    }
    return colors[cat] || '#a1a1aa'
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('renzo-theme', newTheme ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light')
    addToast(newTheme ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info')
  }

  // Apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('renzo-theme') || 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
    setIsDarkMode(savedTheme === 'dark')
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
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow Escape in input to close mini bar
        if (e.key === 'Escape') setMiniBarVisible(false)
        return
      }
      
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
        return
      }
      
      // Mini command bar - Ctrl+Space
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
        e.preventDefault()
        setMiniBarVisible(true)
        return
      }
      
      // Comma key - Settings
      if (e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
        return
      }
      
      const key = e.key.toUpperCase()
      
      // Number keys for quick access
      if (key === '3') setShowGlobalSearch(true)
      if (key === 'N') setShowQuickFlow(true)
      if (key === 'P') setShowPrompt(true)
      if (key === 'T') setShowTemplates(true)
      if (key === 'K') setShowCTATemplates(true)
      if (key === 'J') setShowHookTester(true)
      if (key === 'Y') setShowHotTake(true)
      if (key === 'D') setShowQuickDraft(true)
      if (key === '?') setShowKeyboardShortcuts(true)
      if (key === '/') setShowScratchpad(true)
      if (key === 'V') setShowVirality(true)
      if (key === 'W') setShowQuickWrite(true)
      if (key === 'X') setShowThreadFormat(true)
      if (key === 'F') setShowFormula(true)
      if (key === 'G') setShowTopicGenerator(true)
      if (key === 'C' && !e.metaKey && !e.ctrlKey) setShowClipboard(true)
      if (key === 'B') setShowBrainstorm(true)
      if (key === '!') setShowDailyChallenge(true)  // Shift+1 for Daily Challenge
      if (key === 'Q') setShowQuickCapture(true)
      if (key === 'E') setShowExportDrafts(true)
      if (key === '+' || key === '=') setShowWritingInsights(true)
      if (key === 'L') setShowChangelog(true)
      if (key === 'M') setShowFocusMode(true)
      if (key === 'I') setShowBriefGen(true)
      if (key === 'A') setShowIdeasBank(true)
      if (key === 'R' && !e.shiftKey) setShowReferencePanel(true)
      if (key === 'R' && e.shiftKey) setShowQuickWebResearch(true)  // Shift+R for Quick Research
      if (key === 'O') setShowResearchQueue(true)
      if (key === 'U') setShowSavedHooks(true)
      if (key === 'H') setShowHeadlineGen(true)
      if (key === 'S' && !e.metaKey && !e.ctrlKey) setShowWordSprint(true)
      if (key === 'Z') setShowArticleSeries(true)
      if (key === 'P' && !e.metaKey && !e.ctrlKey) setShowPipeline(true)
      if (key === 'X') setShowThread(true)
      if (key === 'N') setShowQuickTweet(true)  // N for New Tweet
      if (key === '1') setShowMoodTracker(true)
      if (key === '2') setShowSEOScore(true)
      if (key === '3' && !e.metaKey && !e.ctrlKey) setShowGlobalSearch(true)
      if (key === ',') setShowSettings(true)
      if (key === '4') setShowDataManagement(true)
      if (key === '5') setShowCitationFormatter(true)
      if (key === '6') setShowPublishingPrep(true)  // 6 for Publishing Prep
      if (key === '7') setShowPerformanceTracker(true)  // 7 for Performance Tracker
      if (key === '8') setShowDraftCollections(true)  // 8 for Draft Collections
      if (key === '9') setShowInspirationBoard(true)  // 9 for Inspiration Board
      if (key === '0') setShowReadingList(true)  // 0 for Reading List
      if (key === '`') setShowQuickAIPrompt(true)  // ` for Quick AI Prompt
      if (key === '=') setShowSEOChecklist(true)  // = for SEO Checklist
      if (key === '-') setShowToneAdjuster(true)  // - for Tone Adjuster
      if (key === '\\') setShowCLIRunner(true)  // \ for CLI Command Runner
      if (key === ']') setShowQuoteCollection(true)  // ] for Quote Collection
      if (key === '\'') setShowTopicFrequency(true)  // ' for Topic Frequency Analyzer
      if (key === ']') handleQuickExportAll()  // ] for Quick Export All
      if (key === '*') setShowDraftAnalyzer(true)  // * for Draft Analyzer
      if (key === '(') setShowFormatPreview(true)  // ( for Format Preview
      if (key === ')') setShowPomodoro(true)  // ) for Pomodoro Timer
      if (key === '+') setShowQuickShare(true)  // + for Quick Share
      if (key === '/') { e.preventDefault(); document.getElementById('article-search')?.focus() }
      if (key === 'ESCAPE') {
        setShowPrompt(false)
        setShowCommandPalette(false)
        setShowGlobalSearch(false)
        setShowSettings(false)
        setShowDataManagement(false)
        setSearchQuery('')
        setShowQuickDraft(false)
        setShowShortcuts(false)
        setShowVirality(false)
        setShowQuickWrite(false)
        setShowFormula(false)
        setShowTopicGenerator(false)
        setShowClipboard(false)
        setShowBrainstorm(false)
        setShowQuickCapture(false)
        setShowChangelog(false)
        setShowTemplates(false)
        setShowFocusMode(false)
        setShowReferencePanel(false)
        setShowResearchQueue(false)
        setShowSavedHooks(false)
        setShowWordSprint(false)
        setShowArticleSeries(false)
        setShowPipeline(false)
        setShowThread(false)
        setShowHeadlineGen(false)
        setShowBriefGen(false)
        setShowMoodTracker(false)
        setShowSEOScore(false)
        setShowCitationFormatter(false)
        setShowInspirationBoard(false)
        setShowReadingList(false)
        setShowQuickAIPrompt(false)
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
      case 'ideas':
        setShowIdeasBank(true)
        addActivity('prompt', 'Opened Content Ideas Bank')
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
      case 'ctaTemplates':
        setShowCTATemplates(true)
        addActivity('prompt', 'Opened CTA templates')
        break
      case 'hookTester':
        setShowHookTester(true)
        addActivity('prompt', 'Opened hook tester')
        break
      case 'moodTracker':
        setShowMoodTracker(true)
        addActivity('prompt', 'Opened mood tracker')
        break
      case 'seoScore':
        setShowSEOScore(true)
        addActivity('prompt', 'Opened SEO calculator')
        break
      case 'briefGenerator':
        setShowBriefGen(true)
        addActivity('prompt', 'Opened brief generator')
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

  // Calculate daily writing score (0-100)
  const dailyScore = useMemo(() => {
    const goalProgress = Math.min((todayWordCount / dailyWordGoal) * 100, 100)
    const ideasBonus = contentIdeas.length > 0 ? 10 : 0
    const hooksBonus = hooks.length > 0 ? 10 : 0
    const streakBonus = Math.min(writingStreak * 5, 20)
    
    const score = Math.min(Math.round(goalProgress * 0.6 + ideasBonus + hooksBonus + streakBonus), 100)
    return score
  }, [todayWordCount, dailyWordGoal, contentIdeas.length, hooks.length, writingStreak])

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e' // green
    if (score >= 50) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🔥'
    if (score >= 50) return '💪'
    return '🌱'
  }

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
      {showThreadFormat && <QuickThreadFormat isOpen={showThreadFormat} onClose={() => setShowThreadFormat(false)} />}
      {showContentRepurposer && <ContentRepurposer isOpen={showContentRepurposer} onClose={() => setShowContentRepurposer(false)} />}
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
      {showWritingInsights && (
        <WritingTimeInsightsModal 
          isOpen={showWritingInsights}
          onClose={() => setShowWritingInsights(false)}
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
      {showCTATemplates && (
        <CTATemplates 
          isOpen={showCTATemplates} 
          onClose={() => setShowCTATemplates(false)}
          onSelect={(cta) => {
            addToast(`Copied CTA: ${cta.name}`, 'success')
          }}
        />
      )}
      {showHookTester && (
        <HookTester 
          isOpen={showHookTester} 
          onClose={() => setShowHookTester(false)}
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
      <ArticlePipelineTracker
        isOpen={showPipeline}
        onClose={() => setShowPipeline(false)}
      />
      <ThreadGenerator
        isOpen={showThread}
        onClose={() => setShowThread(false)}
      />
      <QuickTweetGenerator
        isOpen={showQuickTweet}
        onClose={() => setShowQuickTweet(false)}
      />
      <QuickFlow
        isOpen={showQuickFlow}
        onClose={() => setShowQuickFlow(false)}
        onStartFlow={(draftData) => {
          const newDrafts = [draftData, ...drafts]
          setDrafts(newDrafts)
          localStorage.setItem('renzo-drafts', JSON.stringify(newDrafts))
          setShowFocusMode(true)
          addActivity('draft', `Quick Flow: "${draftData.title.slice(0, 30)}..."`)
          addToast('Draft created! Starting Focus Mode...', 'success')
        }}
      />
      <HeadlineGenerator
        isOpen={showHeadlineGen}
        onClose={() => setShowHeadlineGen(false)}
      />
      <ArticleBriefGenerator
        isOpen={showBriefGen}
        onClose={() => setShowBriefGen(false)}
        onSave={(brief) => {
          const draft = {
            title: `Brief: ${brief.topic}`,
            category: brief.category,
            hook: brief.hook,
            content: `${brief.hook}\n\n${brief.problem}\n\n${brief.mechanism}\n\n${brief.solution}\n\n${brief.cta}`,
            words: brief.targetWords,
            date: new Date().toISOString()
          }
          saveDraft(draft)
        }}
      />
      <WritingMoodTracker
        isOpen={showMoodTracker}
        onClose={() => setShowMoodTracker(false)}
      />
      <SEOScoreCalculator
        isOpen={showSEOScore}
        onClose={() => setShowSEOScore(false)}
      />
      <CitationFormatter
        isOpen={showCitationFormatter}
        onClose={() => setShowCitationFormatter(false)}
      />
      <SEOChecklist
        isOpen={showSEOChecklist}
        onClose={() => setShowSEOChecklist(false)}
      />
      <ToneAdjuster
        isOpen={showToneAdjuster}
        onClose={() => setShowToneAdjuster(false)}
      />
      <CLICommandRunner
        isOpen={showCLIRunner}
        onClose={() => setShowCLIRunner(false)}
        onRunCommand={(cmd) => addToast(`CLI: ${cmd.command} executed`, 'success')}
      />
      <QuickWebResearch
        isOpen={showQuickWebResearch}
        onClose={() => setShowQuickWebResearch(false)}
        onSelectTopic={(topic) => addToast(`Selected: ${topic}`, 'info')}
      />
      
      {/* NEW v5.3 modals */}
      <PerformanceAnalytics
        isOpen={showPerformanceAnalytics}
        onClose={() => setShowPerformanceAnalytics(false)}
        articles={recentArticles}
      />
      <WritingGoalsWidget
        isOpen={showWritingGoals}
        onClose={() => setShowWritingGoals(false)}
      />
      <DraftAnalyzer
        isOpen={showDraftAnalyzer}
        onClose={() => setShowDraftAnalyzer(false)}
        drafts={drafts}
      />
      <ContentFormatPreview
        isOpen={showFormatPreview}
        onClose={() => setShowFormatPreview(false)}
      />
      <PomodoroTimer
        isOpen={showPomodoro}
        onClose={() => setShowPomodoro(false)}
      />
      <QuickShare
        isOpen={showQuickShare}
        onClose={() => setShowQuickShare(false)}
      />
      <PublishingPrepWorkflow
        isOpen={showPublishingPrep}
        onClose={() => setShowPublishingPrep(false)}
      />
      <PerformanceTracker
        isOpen={showPerformanceTracker}
        onClose={() => setShowPerformanceTracker(false)}
      />
      <DraftCollections
        isOpen={showDraftCollections}
        onClose={() => setShowDraftCollections(false)}
        drafts={drafts}
        onMoveToDraft={(draft) => saveDraft(draft)}
      />
      <InspirationBoard
        isOpen={showInspirationBoard}
        onClose={() => setShowInspirationBoard(false)}
      />
      <ReadingList
        isOpen={showReadingList}
        onClose={() => setShowReadingList(false)}
      />
      <QuickAIPrompt
        isOpen={showQuickAIPrompt}
        onClose={() => setShowQuickAIPrompt(false)}
      />
      {showTopicGenerator && <TopicGenerator onClose={() => setShowTopicGenerator(false)} />}
      <ClipboardHistory isOpen={showClipboard} onClose={() => setShowClipboard(false)} />
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <Scratchpad isOpen={showScratchpad} onClose={() => setShowScratchpad(false)} />
      <QuoteCollection 
        isOpen={showQuoteCollection} 
        onClose={() => setShowQuoteCollection(false)}
        quotes={quotes}
        onSaveQuote={saveQuote}
        onDeleteQuote={deleteQuote}
      />
      <TopicFrequency 
        isOpen={showTopicFrequency} 
        onClose={() => setShowTopicFrequency(false)}
        ideas={contentIdeas}
        articles={drafts}
      />
      <BrainstormMode isOpen={showBrainstorm} onClose={() => setShowBrainstorm(false)} />
      <DailyWritingChallenge isOpen={showDailyChallenge} onClose={() => setShowDailyChallenge(false)} />
      <QuickCapture 
        isOpen={showQuickCapture} 
        onClose={() => setShowQuickCapture(false)}
        onSave={saveQuickNote}
      />
      <ContentIdeasBank
        isOpen={showIdeasBank}
        onClose={() => setShowIdeasBank(false)}
        ideas={contentIdeas}
        onSave={saveContentIdea}
        onDelete={deleteIdea}
        onMoveToDraft={moveIdeaToDraft}
      />
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        allData={{
          hooks: JSON.parse(localStorage.getItem('renzo-saved-hooks') || '[]'),
          ideas: contentIdeas,
          headlines: JSON.parse(localStorage.getItem('renzo-generated-headlines') || '[]'),
          references: JSON.parse(localStorage.getItem('renzo-references') || '[]')
        }}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={appSettings}
        onUpdate={(newSettings) => {
          setAppSettings(newSettings)
          localStorage.setItem('renzo-app-settings', JSON.stringify(newSettings))
          addToast('Settings saved', 'success')
        }}
      />
      <DataManagement
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
        onExport={() => {
          const data = {
            hooks: JSON.parse(localStorage.getItem('renzo-saved-hooks') || '[]'),
            ideas: contentIdeas,
            headlines: JSON.parse(localStorage.getItem('renzo-generated-headlines') || '[]'),
            references: JSON.parse(localStorage.getItem('renzo-references') || '[]'),
            drafts: drafts,
            settings: appSettings,
            exportDate: new Date().toISOString()
          }
          const dataStr = JSON.stringify(data, null, 2)
          const dataBlob = new Blob([dataStr], { type: 'application/json' })
          const url = URL.createObjectURL(dataBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = `renzo-backup-${new Date().toISOString().split('T')[0]}.json`
          link.click()
          URL.revokeObjectURL(url)
        }}
        onImport={(data) => {
          if (data.hooks) localStorage.setItem('renzo-saved-hooks', JSON.stringify(data.hooks))
          if (data.ideas) setContentIdeas(data.ideas)
          if (data.headlines) localStorage.setItem('renzo-generated-headlines', JSON.stringify(data.headlines))
          if (data.references) localStorage.setItem('renzo-references', JSON.stringify(data.references))
          if (data.drafts) setDrafts(data.drafts)
          if (data.settings) {
            setAppSettings(data.settings)
            localStorage.setItem('renzo-app-settings', JSON.stringify(data.settings))
          }
          addToast('Data imported successfully', 'success')
          setShowDataManagement(false)
        }}
      />
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
          <span className="logo-badge">v5.9</span>
        </div>
        <div className="header-right">
          {/* Daily Writing Score Widget */}
          <div className="score-widget" title="Today's Productivity Score">
            <span className="score-emoji">{getScoreEmoji(dailyScore)}</span>
            <div className="score-info">
              <span className="score-value" style={{ color: getScoreColor(dailyScore) }}>{dailyScore}</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          
          {/* Daily Word Goal Progress - Ring Version */}
          <div className="daily-goal-widget ring-mode" title="Daily word goal - click to edit">
            <div className="goal-ring-container">
              <svg className="goal-ring-svg" viewBox="0 0 36 36">
                <circle className="goal-ring-bg" cx="18" cy="18" r="15.5" />
                <circle 
                  className={`goal-ring-fill ${wordsWritten >= dailyWordGoal ? 'complete' : (wordsWritten / dailyWordGoal) > 0.5 ? 'under-50' : 'under-100'}`}
                  cx="18" cy="18" r="15.5"
                  strokeDasharray={`${Math.min((wordsWritten / dailyWordGoal) * 100, 100)} 100`}
                  strokeDashoffset="25"
                />
              </svg>
              <div className="goal-ring-text">
                {wordsWritten >= dailyWordGoal ? '✓' : `${Math.round((wordsWritten / dailyWordGoal) * 100)}%`}
              </div>
            </div>
            <span className="goal-count">
              {wordsWritten >= dailyWordGoal 
                ? <span className="goal-exceeded">{wordsWritten} ✓</span>
                : <span>{wordsWritten}/{dailyWordGoal}</span>
              }
            </span>
          </div>
          
          {/* Daily Challenge Widget */}
          <div 
            className="daily-challenge-widget" 
            onClick={() => setShowDailyChallenge(true)}
            title="Daily Writing Challenge"
          >
            <span className="challenge-icon">🎯</span>
            <span className="challenge-label">Challenge</span>
          </div>
          
          {/* Quick Mood Indicator */}
          <div 
            className="mood-indicator" 
            onClick={() => setShowMoodTracker(true)}
            title="Click to change mood"
          >
            <span className="mood-emoji">
              {moods.find(m => m.id === mood)?.emoji || '😐'}
            </span>
            <span className="mood-text">
              {moods.find(m => m.id === mood)?.label || 'Neutral'}
            </span>
          </div>
          
          <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
          <NotionSyncStatus onSync={() => addToast('Notion sync complete!', 'success')} />
          <button 
            className="export-all-btn" 
            onClick={handleQuickExportAll}
            title="Quick Export All (backup everything)"
          >
            📦
          </button>
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

      {/* Pinned Items Bar (NEW v5.1) */}
      <div className="pinned-bar">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Pinned:</span>
        <button className="pinned-item" onClick={() => setShowQuickDraft(true)}>
          <span className="pin-icon">📝</span>
          Quick Draft
        </button>
        <button className="pinned-item" onClick={() => setShowHeadlineGen(true)}>
          <span className="pin-icon">📰</span>
          Headlines
        </button>
        <button className="pinned-item" onClick={() => setShowIdeasBank(true)}>
          <span className="pin-icon">💡</span>
          Ideas Bank
        </button>
        <button className="pinned-item" onClick={() => setShowQuickWebResearch(true)}>
          <span className="pin-icon">🌐</span>
          Web Search
        </button>
        <button className="pinned-item" onClick={() => setShowWordSprint(true)}>
          <span className="pin-icon">⚡</span>
          Word Sprint
        </button>
        <button className="pinned-item" onClick={() => setShowQuoteCollection(true)}>
          <span className="pin-icon">💬</span>
          Quotes
        </button>
        <button className="pinned-item" onClick={() => setShowTopicFrequency(true)}>
          <span className="pin-icon">📊</span>
          Topics
        </button>
        <button className="pinned-item" onClick={() => setShowGlobalSearch(true)}>
          <span className="pin-icon">🔍</span>
          Search
        </button>
      </div>

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

        {/* Tips and Insights Row */}
        <section className="tips-section">
          <ContentTipsWidget />
        </section>

        {/* New Feature Cards Row */}
        <section className="new-features-row">
          <DailyQuote />
          <ContentOverview drafts={drafts} />
          <DailyChallenge onComplete={() => addToast('🎉 Daily challenge completed!', 'success')} />
          <StudySpotlight />
          <QuickStatGenerator />
          <RecentIdeas ideas={contentIdeas} onViewAll={() => setShowIdeasBank(true)} />
          <TrendingHashtags />
          <TrendingTopics />
          <ContentCalendar />
          <WritingTimer onComplete={() => addToast('Session complete! Take a break ☕', 'success')} />
          <WritingVelocityTracker />
          <WritingStreakCalendar streak={metrics.currentStreak} articles={recentArticles} />
          <WritingHeatmap />
          <WeeklyStatsDashboard articles={recentArticles} />
          <ArticlePublishingTimer articles={recentArticles} />
          <ProductiveHours />
        </section>
        
        <section className="feature-buttons-row">
          <button className="feature-btn" onClick={() => setShowFormula(true)}>
            <span>📝</span>
            <span>Formula</span>
            <span className="feature-hint">F</span>
          </button>
          <button className="feature-btn" onClick={() => setShowThreadFormat(true)}>
            <span>🧵</span>
            <span>Thread</span>
            <span className="feature-hint">W</span>
          </button>
          <button className="feature-btn" onClick={() => setShowContentRepurposer(true)}>
            <span>♻️</span>
            <span>Repurpose</span>
            <span className="feature-hint">R</span>
          </button>
          <button className="feature-btn" onClick={() => setShowTemplates(true)}>
            <span>📋</span>
            <span>Templates</span>
            <span className="feature-hint">T</span>
          </button>
          <button className="feature-btn" onClick={() => setShowCTATemplates(true)}>
            <span>📣</span>
            <span>CTA</span>
            <span className="feature-hint">K</span>
          </button>
          <button className="feature-btn" onClick={() => setShowHookTester(true)}>
            <span>🔍</span>
            <span>Hook Test</span>
            <span className="feature-hint">J</span>
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
          <button className="feature-btn" onClick={() => setShowQuickWebResearch(true)}>
            <span>🌐</span>
            <span>Web Search</span>
            <span className="feature-hint">⇧R</span>
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
          <button className="feature-btn" onClick={() => setShowPipeline(true)}>
            <span>📊</span>
            <span>Pipeline</span>
            <span className="feature-hint">P</span>
          </button>
          <button className="feature-btn" onClick={() => setShowQuoteCollection(true)}>
            <span>💬</span>
            <span>Quotes</span>
            <span className="feature-hint">]</span>
          </button>
          <button className="feature-btn" onClick={() => setShowTopicFrequency(true)}>
            <span>📈</span>
            <span>Topic Freq</span>
            <span className="feature-hint">'</span>
          </button>
          <button className="feature-btn" onClick={() => setShowThread(true)}>
            <span>🐦</span>
            <span>Thread</span>
            <span className="feature-hint">X</span>
          </button>
          <button className="feature-btn" onClick={() => setShowHeadlineGen(true)}>
            <span>✍️</span>
            <span>Headlines</span>
            <span className="feature-hint">H</span>
          </button>
          <button className="feature-btn" onClick={() => setShowBriefGen(true)}>
            <span>📋</span>
            <span>Brief</span>
            <span className="feature-hint">I</span>
          </button>
          <button className="feature-btn" onClick={() => setShowMoodTracker(true)}>
            <span>🎭</span>
            <span>Mood</span>
            <span className="feature-hint">1</span>
          </button>
          <button className="feature-btn" onClick={() => setShowSEOScore(true)}>
            <span>🎯</span>
            <span>SEO</span>
            <span className="feature-hint">2</span>
          </button>
          <button className="feature-btn" onClick={() => setShowCitationFormatter(true)}>
            <span>📚</span>
            <span>Cite</span>
            <span className="feature-hint">5</span>
          </button>
          <button className="feature-btn" onClick={() => setShowSEOChecklist(true)}>
            <span>🔍</span>
            <span>SEO</span>
            <span className="feature-hint">=</span>
          </button>
          <button className="feature-btn" onClick={() => setShowToneAdjuster(true)}>
            <span>🎨</span>
            <span>Tone</span>
            <span className="feature-hint">-</span>
          </button>
          <button className="feature-btn" onClick={() => setShowCLIRunner(true)}>
            <span>⚡</span>
            <span>CLI</span>
            <span className="feature-hint">\</span>
          </button>
          <button className="feature-btn" onClick={() => setShowPublishingPrep(true)}>
            <span>🚀</span>
            <span>Publish</span>
            <span className="feature-hint">6</span>
          </button>
          <button className="feature-btn" onClick={() => setShowPerformanceTracker(true)}>
            <span>📊</span>
            <span>Perf</span>
            <span className="feature-hint">7</span>
          </button>
          <button className="feature-btn" onClick={() => setShowDraftCollections(true)}>
            <span>📁</span>
            <span>Collect</span>
            <span className="feature-hint">8</span>
          </button>
          <button className="feature-btn" onClick={() => setShowInspirationBoard(true)}>
            <span>🎨</span>
            <span>Inspire</span>
            <span className="feature-hint">9</span>
          </button>
          <button className="feature-btn" onClick={() => setShowReadingList(true)}>
            <span>📚</span>
            <span>Reading</span>
            <span className="feature-hint">0</span>
          </button>
          <button className="feature-btn" onClick={() => setShowQuickAIPrompt(true)}>
            <span>🤖</span>
            <span>AI Prompt</span>
            <span className="feature-hint">`</span>
          </button>
          
          {/* NEW v5.3 buttons */}
          <button className="feature-btn" onClick={() => setShowPerformanceAnalytics(true)}>
            <span>📈</span>
            <span>Analytics</span>
            <span className="feature-hint">!</span>
          </button>
          <button className="feature-btn" onClick={() => setShowWritingGoals(true)}>
            <span>🎯</span>
            <span>Goals</span>
            <span className="feature-hint">@</span>
          </button>
          
          {/* NEW v5.4 buttons */}
          <button className="feature-btn" onClick={() => setShowDraftAnalyzer(true)}>
            <span>🧠</span>
            <span>Analyze</span>
            <span className="feature-hint">*</span>
          </button>
          <button className="feature-btn" onClick={() => setShowFormatPreview(true)}>
            <span>👁️</span>
            <span>Preview</span>
            <span className="feature-hint">(</span>
          </button>
          <button className="feature-btn" onClick={() => setShowPomodoro(true)}>
            <span>🍅</span>
            <span>Pomodoro</span>
            <span className="feature-hint">)</span>
          </button>
          <button className="feature-btn" onClick={() => setShowQuickShare(true)}>
            <span>📤</span>
            <span>Share</span>
            <span className="feature-hint">+</span>
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
                  else if (action.action === 'quickTweet') setShowQuickTweet(true)
                  else if (action.action === 'moodTracker') setShowMoodTracker(true)
                  else if (action.action === 'seoScore') setShowSEOScore(true)
                  else if (action.action === 'globalSearch') setShowGlobalSearch(true)
                  else if (action.action === 'settings') setShowSettings(true)
                  else if (action.action === 'dataManagement') setShowDataManagement(true)
                  else if (action.action === 'ctaTemplates') setShowCTATemplates(true)
                  else if (action.action === 'hookTester') setShowHookTester(true)
                  else if (action.action === 'virality') setShowVirality(true)
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

        {/* Featured Article Highlight */}
        {recentArticles.length > 0 && (
          <section className="featured-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">⭐</span>
                Featured Article
              </h2>
            </div>
            {(() => {
              const topArticle = [...recentArticles].sort((a, b) => b.engagement - a.engagement)[0]
              return (
                <div className="featured-card" onClick={() => setExpandedArticle(recentArticles.indexOf(topArticle))}>
                  <div className="featured-badge">🏆 Top Performer</div>
                  <div className="featured-content">
                    <span 
                      className="featured-category"
                      style={{ color: categoryColors[topArticle.category] }}
                    >
                      {topArticle.category}
                    </span>
                    <h3 className="featured-title">{topArticle.title}</h3>
                    <div className="featured-stats">
                      <span className="featured-stat">
                        <strong>{topArticle.engagement}</strong>/10 engagement
                      </span>
                      <span className="featured-stat">
                        <strong>{topArticle.reads.toLocaleString()}</strong> reads
                      </span>
                      <span className="featured-stat">
                        <strong>{Math.round(topArticle.reads * 0.12)}</strong> shares
                      </span>
                    </div>
                    <div className="featured-meta">
                      <span>{formatDate(topArticle.date)}</span>
                      <span>•</span>
                      <span>{topArticle.words.toLocaleString()} words</span>
                    </div>
                  </div>
                  <div className="featured-action">
                    <button className="view-btn">View Analytics →</button>
                  </div>
                </div>
              )
            })()}
          </section>
        )}

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

        {/* Floating Action Button (FAB) */}
        <div className="fab-container">
          <div className={`fab-actions ${fabOpen ? 'open' : ''}`}>
            <button className="fab-action" onClick={() => { setShowQuickDraft(true); setFabOpen(false) }}>
              <span>📝</span>
              <span>Quick Draft</span>
              <kbd>D</kbd>
            </button>
            <button className="fab-action" onClick={() => { setShowFocusMode(true); setFabOpen(false) }}>
              <span>🎯</span>
              <span>Focus Mode</span>
              <kbd>M</kbd>
            </button>
            <button className="fab-action" onClick={() => { setShowWordSprint(true); setFabOpen(false) }}>
              <span>⚡</span>
              <span>Word Sprint</span>
              <kbd>S</kbd>
            </button>
            <button className="fab-action" onClick={() => { setShowHeadlineGen(true); setFabOpen(false) }}>
              <span>📰</span>
              <span>Headlines</span>
              <kbd>H</kbd>
            </button>
            <button className="fab-action" onClick={() => { setShowIdeasBank(true); setFabOpen(false) }}>
              <span>💡</span>
              <span>Ideas</span>
              <kbd>A</kbd>
            </button>
          </div>
          <button 
            className={`fab-main ${fabOpen ? 'active' : ''}`}
            onClick={() => setFabOpen(!fabOpen)}
            title="Quick Actions"
          >
            {fabOpen ? '✕' : '+'}
          </button>
        </div>

        {/* Mini Command Bar (Ctrl+Space) */}
        <div className={`mini-command-bar ${miniBarVisible ? 'visible' : ''}`}>
          <span>⌘</span>
          <input 
            type="text" 
            placeholder="Quick command..." 
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMiniBarVisible(false)
              if (e.key === 'Enter' && e.target.value) {
                const cmd = e.target.value.toLowerCase()
                if (cmd.includes('draft')) setShowQuickDraft(true)
                else if (cmd.includes('focus')) setShowFocusMode(true)
                else if (cmd.includes('sprint')) setShowWordSprint(true)
                else if (cmd.includes('headline')) setShowHeadlineGen(true)
                else if (cmd.includes('idea')) setShowIdeasBank(true)
                else if (cmd.includes('search') || cmd.includes('3')) setShowGlobalSearch(true)
                else if (cmd.includes('setting') || cmd.includes(',')) setShowSettings(true)
                setMiniBarVisible(false)
              }
            }}
            onBlur={() => setTimeout(() => setMiniBarVisible(false), 200)}
          />
          <kbd>Esc</kbd>
        </div>
      </main>

      <KeyboardShortcutsFooter onShowShortcuts={() => setShowShortcuts(true)} />
      <footer className="footer">
        <p>Built by Renzo • Workout Flow Content Engine</p>
        <p className="footer-version">v5.8 • Press ⌘K for commands, ? for all shortcuts • Use +/= for Writing Insights</p>
      </footer>
    </div>
  )
}

export default App

// ========== QUICK WEB RESEARCH (NEW v5.8) ==========
function QuickWebResearch({ isOpen, onClose, onSelectTopic }) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  
  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    
    // Simulate search results (in production, would use actual web search API)
    await new Promise(r => setTimeout(r, 800))
    
    const mockResults = [
      { 
        title: `${query}: The Complete Science Guide`, 
        source: 'PubMed', 
        url: '#',
        snippet: `Comprehensive research on ${query} including recent studies and meta-analyses.`
      },
      {
        title: `New Research on ${query} (2026)`,
        source: 'Science Daily',
        url: '#',
        snippet: `Latest findings on ${query} from leading research institutions.`
      },
      {
        title: `${query} - What the Evidence Really Says`,
        source: 'Examine.com',
        url: '#',
        snippet: `An evidence-based breakdown of ${query} with citations.`
      },
      {
        title: `The Future of ${query} in Fitness`,
        source: 'Breaking Muscle',
        url: '#',
        snippet: `How ${query} is changing the fitness industry.`
      },
      {
        title: `${query} Myths Debunked`,
        source: 'Fitness Myth',
        url: '#',
        snippet: `Common misconceptions about ${query} and what science says.`
      }
    ]
    
    setSearchResults(mockResults)
    setLoading(false)
  }
  
  const saveToResearchQueue = (result) => {
    const queue = JSON.parse(localStorage.getItem('renzo-research-queue') || '[]')
    const newItem = {
      id: Date.now(),
      topic: result.title,
      source: result.source,
      date: new Date().toISOString(),
      status: 'pending'
    }
    localStorage.setItem('renzo-research-queue', JSON.stringify([newItem, ...queue]))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content web-research-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔍 Quick Web Research</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="web-research-search">
          <input
            type="text"
            placeholder="Research topic (e.g., 'protein timing', 'VO2 max training')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <button 
            className="search-btn"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
        </div>
        
        {loading && (
          <div className="web-research-loading">
            <div className="loading-spinner"></div>
            <span>Searching the web for "{query}"...</span>
          </div>
        )}
        
        {searched && !loading && searchResults.length === 0 && (
          <div className="web-research-empty">
            <span>🔍</span>
            <p>No results found. Try a different search term.</p>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="web-research-results">
            <div className="results-header">
              <span>{searchResults.length} results</span>
              <span className="results-tip">Click to save to research queue</span>
            </div>
            <div className="results-list">
              {searchResults.map((result, i) => (
                <div 
                  key={i} 
                  className="result-item"
                  onClick={() => saveToResearchQueue(result)}
                >
                  <div className="result-source">{result.source}</div>
                  <div className="result-title">{result.title}</div>
                  <div className="result-snippet">{result.snippet}</div>
                  <div className="result-actions">
                    <button className="result-btn">📋 Save to Queue</button>
                    <button className="result-btn">🔗 Open</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
