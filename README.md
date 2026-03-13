# RENZO — Content Writing Interface (v3.9)

A comprehensive web-based writing and content management interface for fitness article creation, built with React + Vite.

## Features

### Writing Tools
- **Quick Capture** (Q) — Quick idea capture with categories
- **Focus Mode** (M) — Full-screen distraction-free writing environment
- **Word Sprint** (S) — Pomodoro-style timed writing sessions (15 min default)
- **Quick Draft** (D) — Create articles quickly
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

### Analytics & Optimization
- **Virality Score Calculator** (V) — Estimate article virality potential
- **SEO Score Checker** (2) — Analyze article SEO effectiveness
- **Reading Time Estimator** — Auto-calculate reading time
- **Writing Streak Calendar** — Visual 28-day activity tracker
- **Performance Dashboard** — Track metrics over time

### Data Management (NEW v3.9)
- **Global Search** (3) — Search across all hooks, ideas, headlines, and references
- **Settings Modal** (,) — Customize daily goals, notifications, theme, auto-save
- **Data Management** (4) — Export/import all data as JSON for backup and transfer

### Keyboard Shortcuts
```
⌘K              Command Palette
3               Global Search
,               Settings
4               Data Management
H               Headline Generator
I               Article Brief Generator
D               Quick Draft
M               Focus Mode
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

## What's New in v3.9

✅ **Global Search** — Find any saved content instantly
✅ **Settings Panel** — Fully customizable preferences
✅ **Data Export/Import** — Backup and restore all data
✅ **Improved Keyboard Shortcuts** — Better organization and documentation
✅ **Enhanced UI Polish** — Better visual hierarchy and spacing

## Previous Versions

- **v3.8** — Quick Tweet Generator with tone selection
- **v3.7** — Article Series and Pipeline Tracker
- **v3.6** — SEO Score and Brief Generator
- **v3.5** — Content Ideas Bank and Mood Tracker
- **v3.3** — Article Brief Generator
- **v3.2** — CTA Templates and Hook Tester
- **v3.1** — Headline Generator (13 formulas)
- **v3.0** — Focus Mode, Word Sprint, Research Queue, Saved Hooks

## Usage Tips

1. **Start with Global Search (3)** — Find your previous ideas quickly
2. **Set Daily Goals** — Configure in Settings (,) to track progress
3. **Use Templates** — Pick an article template to structure your writing
4. **Save Reusable Content** — Hooks, CTAs, and ideas for future articles
5. **Backup Regularly** — Export data (4) weekly for peace of mind
6. **Keyboard Shortcuts** — Press ? to see all available shortcuts

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
