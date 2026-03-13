# RENZO — Content Writing Interface (v4.5)

A comprehensive web-based writing and content management interface for fitness article creation, built with React + Vite.

## Features

### Writing Tools
- **Quick Capture** (Q) — Quick idea capture with categories
- **Focus Mode** (M) — Full-screen distraction-free writing environment
- **Word Sprint** (S) — Pomodoro-style timed writing sessions (15 min default)
- **Quick Draft** (D) — Create articles quickly
- **Quick Write** (W) — Fast capture mode for quick ideas
- **Thread Format** (X) — Generate X/Twitter thread structures with 4 templates
- **Article Templates** (T) — 6 pre-built article structures (myth-bust, comparison, deep-dive, how-to, hot take, listicle)

### Content Organization
- **Content Ideas Bank** (A) — Save and organize article ideas by category
- **Article Series Tracker** (Z) — Group related articles together
- **Research Queue** (O) — Track topics waiting to be researched
- **Quick Reference Panel** (R) — Store citations, sources, and inspiration links
- **Saved Hooks** (U) — Collect and reuse powerful opening lines

### AI-Powered Generation
- **Headline Generator** (H) — 13 proven headline formulas (Tier 1-3 ranking)
- **Article Brief Generator** (I) — Auto-generate complete article briefs with sections
- **Hot Take Generator** (Y) — Create controversial opinions with backing
- **Quick Tweet Generator** (A) — One-click tweet creation with 4 tones

### Analytics & Tracking
- **Virality Score Calculator** (V) — Estimate article virality potential
- **SEO Score Checker** (2) — Analyze article SEO effectiveness
- **Reading Time Estimator** — Auto-calculate reading time
- **Writing Streak Calendar** — Visual 28-day activity tracker
- **Article Publishing Timer** — Days since last published (urges you to ship!)
- **Performance Dashboard** — Track metrics over time
- **Quick Stat Generator** — Random fitness facts with study sources
- **Daily Challenge** — Daily writing goals to keep you accountable

### Data Management & Publishing (v4.5)
- **Publishing Prep Workflow** (6) — Unified tool: article → X thread → YouTube script → schedule
- **Performance Tracker** (7) — Log article views, shares, saves, track engagement metrics
- **Draft Collections** (8) — Organize drafts into folders/projects for better organization
- **Floating Action Button (FAB)** — Quick access to 5 core actions from anywhere
- **Mini Command Bar** (Ctrl+Space) — Fast command input for navigation
- **Global Search** (3) — Search across all hooks, ideas, headlines, and references
- **Settings Modal** (,) — Customize daily goals, notifications, theme, auto-save
- **Data Management** (4) — Export/import all data as JSON for backup

### Visual Polish (v4.5)
- Enhanced animations with smoother transitions throughout
- Keyboard shortcut hints on feature buttons for better discoverability
- Improved header layout with better spacing and visual hierarchy
- Enhanced FAB with hover effects and keyboard shortcut display
- Improved Writing Streak Calendar with better visual feedback

### Keyboard Shortcuts
```
⌘K              Command Palette
Ctrl+Space      Mini Command Bar
3               Global Search
,               Settings
4               Data Management
6               Publishing Prep Workflow (NEW)
7               Performance Tracker (NEW)
8               Draft Collections (NEW)
H               Headline Generator
I               Article Brief Generator
D               Quick Draft
M               Focus Mode
N               Quick Tweet
S               Word Sprint
Q               Quick Capture
A               Content Ideas Bank
Y               Hot Take Generator
V               Virality Score
2               SEO Score
?               Keyboard Shortcuts Help
L               Changelog
```

## Technology Stack
- **React 18** — UI framework
- **Vite** — Build tool (5307 lines of optimized React)
- **CSS Variables** — Dark theme with accent colors
- **LocalStorage** — Persistent data storage
- **No external dependencies** — Pure React

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## Architecture

### Component Structure
- **Global Search** — Full-text search across all user data
- **Settings Modal** — User preferences and configuration
- **Data Management** — Export/import functionality
- **Content Modules** — Ideas, hooks, headlines, series, queue, references, templates
- **Writing Modes** — Focus mode, quick draft, word sprint
- **Analytics** — Streak calendar, performance metrics, virality scores
- **UI Components** — Modals, buttons, theme toggle, notifications

### Data Flow
- LocalStorage → State Management → Component Rendering
- User actions → Event handlers → State updates → Persistent storage
- Keyboard shortcuts → Global handlers → Modal/panel triggers

### Styling
- CSS Variables for theming (dark mode by default)
- Gradient backgrounds with accent colors
- Smooth transitions and animations
- Mobile-responsive design
- Accessibility-first approach

## What's New in v4.4

✅ **Publishing Prep Workflow** (6) — One-stop shop for article → X thread → YouTube script → scheduling
  - Step-by-step guided workflow
  - Auto-generate X threads from articles
  - Auto-generate YouTube scripts
  - Schedule publish dates
  - Unified summary before publishing

✅ **Performance Tracker** (7) — Track what's working
  - Log article views, shares, saves
  - Calculate average engagement
  - See which articles perform best
  - Make data-driven decisions on topics

✅ **Draft Collections** (8) — Better organization
  - Group drafts into projects/collections
  - Organize by topic, series, or season
  - Quick folder-based access
  - Better workflow for related articles

## What's New in v4.3

✅ **Keyboard Shortcut Fix** — Fixed conflict where A key was mapped to both Ideas Bank and Quick Tweet
✅ **Quick Tweet Shortcut Updated** — Changed from A to N for better organization
✅ **Bug Fixes** — Improved keyboard shortcut handling

## What's New in v4.0

✅ **Thread Format Generator** — One-click X/Twitter thread templates (Hook→CTA, Listicle, Story, MythBust)
✅ **Article Publishing Timer** — Visual countdown showing days since your last published article (triggers urgency at 3+ days)
✅ **Enhanced Quick Stats** — Random fitness facts now include study sources and PubMed links
✅ **Floating Action Button (FAB)** — Quick access to 5 core actions
✅ **Mini Command Bar** — Press Ctrl+Space for lightning-fast command input
✅ **Light Mode Theme** — Toggle between dark and light themes in Settings
✅ **Enhanced Keyboard Shortcuts** — X for Thread Format, , for settings, 3 for search

## Previous Versions

- **v3.9** — Global Search, Settings Modal, Data Management
- **v3.8** — Quick Tweet Generator with tone selection
- **v3.7** — Article Series and Pipeline Tracker
- **v3.6** — SEO Score and Brief Generator
- **v3.5** — Content Ideas Bank and Mood Tracker
- **v3.3** — Article Brief Generator
- **v3.2** — CTA Templates and Hook Tester
- **v3.1** — Headline Generator (13 formulas)
- **v3.0** — Focus Mode, Word Sprint, Research Queue, Saved Hooks

## Usage Tips

1. **Publishing Prep (6)** — Use the unified workflow to turn articles into full content packages
2. **Performance Tracker (7)** — Log metrics after articles go live to track what works
3. **Draft Collections (8)** — Organize series and related articles into projects
4. **Start with Global Search (3)** — Find your previous ideas quickly
5. **Set Daily Goals** — Configure in Settings (,) to track progress
6. **Use Templates** — Pick an article template to structure your writing
7. **Save Reusable Content** — Hooks, CTAs, and ideas for future articles
8. **Backup Regularly** — Export data (4) weekly for peace of mind
9. **Keyboard Shortcuts** — Press ? to see all available shortcuts

## Keyboard Shortcut Cheat Sheet

| Key | Feature |
|-----|---------|
| ⌘K | Command Palette |
| 3 | Global Search |
| , | Settings |
| 4 | Data Management |
| H | Headline Generator |
| D | Quick Draft |
| M | Focus Mode |
| ? | Help |

Press `Esc` to close any modal.

## License

Built for Workout Flow Marketing Engine
