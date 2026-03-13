# RENZO Interface — Changelog

All notable changes to this project will be documented in this file.

## [4.6.0] — March 13, 2026

### Added

#### Writing Velocity Tracker
- Real-time words-per-minute tracking during writing sessions
- Session history with average velocity calculations
- Quick-add buttons for tracking words written
- Persistent storage of velocity history
- Compare current velocity vs. historical average

#### Keyboard Shortcuts Footer
- Persistent footer showing common keyboard shortcuts
- Quick access to essential features
- Press ? for full shortcuts list

### Improvements
- Updated version badge to v4.6
- Enhanced daily goal widget in header

## [4.5.0] — March 13, 2026

### Added

#### Inspiration Board (Key 9)
- Capture and organize inspiration (quotes, links, ideas)
- Tag-based organization system
- Filter by type (idea, quote, link)
- Quick copy to clipboard functionality
- Persistent storage with localStorage

### Improvements
- Fixed keyboard shortcut for Quick Capture (was conflicting)
- Added UI polish and animations

## [4.4.0] — March 13, 2026

### Added

#### Publishing Prep Workflow (Key 6)
- Unified article → content pipeline
- Step-by-step guided workflow (Input → X Thread → YouTube Script → Schedule)
- Auto-generate X/Twitter threads from articles
- Auto-generate YouTube video scripts with full structure
- Schedule publish dates for future content
- Content summary before final publishing
- Supports copying individual outputs to clipboard

#### Performance Tracker (Key 7)
- Track article performance metrics
- Log views, shares, saves, likes per article
- Calculate aggregate engagement rate
- Filter by content category
- Sort by any metric (views, shares, saves, likes)
- Inline editing of metrics
- Persistent storage with localStorage

#### Draft Collections (Key 8)
- Organize drafts into projects/folders
- Create custom named collections
- Color-code collections for quick visual identification
- Add/remove drafts from collections
- Track collection size
- Fully customizable organization system

### Improved

- **Feature Button Row**: Added UI buttons for all v4.4 features with keyboard hints
- **Package.json**: Updated version to 4.4.0
- **README.md**: Comprehensive documentation of v4.4 features with usage tips
- **Keyboard Shortcuts**: Added 6, 7, 8 keys for new v4.4 features
- **Build**: Maintains optimized bundle size (359.99 KB gzipped JS)

### Technical

- All features use localStorage for persistence
- No external dependencies required
- Keyboard shortcuts integrated into global handler
- CSS styling follows Renzo brand color system
- Responsive design maintained across all new components

---

## [4.3.0] — March 12, 2026

### Fixed
- Keyboard shortcut conflict where A was mapped to both Ideas Bank and Quick Tweet
- Quick Tweet shortcut updated from A to N
- Improved keyboard shortcut handling and conflicts

### Improved
- Better keyboard shortcut organization
- Clearer feature hints in UI

---

## [4.2.0] — March 10, 2026

### Added
- Citation Formatter component
- Writing Heatmap component
- Weekly Stats Dashboard component

### Improved
- Analytics dashboard functionality
- Performance visualization options

---

## [4.1.0] — March 5, 2026

### Added
- Light mode theme support
- CSV export functionality
- Enhanced data management

### Fixed
- Light mode styling issues

---

## [4.0.0] — March 1, 2026

### Added
- **Floating Action Button (FAB)** — Quick access to 5 core actions
- **Mini Command Bar** — Ctrl+Space for fast command input
- **Light Mode Theme** — Toggle between dark and light themes
- **Thread Format Generator** — One-click X/Twitter thread templates
- **Article Publishing Timer** — Days since last published counter
- **Enhanced Quick Stats** — Random fitness facts with study sources

### Improved
- Overall UI polish
- Animation quality
- Keyboard shortcut system

---

## [3.9.0] — February 28, 2026

### Added
- Global Search functionality
- Settings Modal
- Data Management (export/import)

---

## [3.8.0] — February 26, 2026

### Added
- Quick Tweet Generator with tone selection

---

## [3.7.0] — February 24, 2026

### Added
- Article Series Tracker
- Pipeline Tracker

---

## [3.6.0] — February 22, 2026

### Added
- SEO Score Calculator
- Article Brief Generator

---

## [3.5.0] — February 20, 2026

### Added
- Content Ideas Bank
- Writing Mood Tracker

---

## [3.3.0] — February 18, 2026

### Added
- Article Brief Generator (initial version)

---

## [3.2.0] — February 16, 2026

### Added
- CTA Templates
- Hook Tester

---

## [3.1.0] — February 14, 2026

### Added
- Headline Generator with 13 proven formulas

---

## [3.0.0] — February 12, 2026

### Added
- Focus Mode (full-screen distraction-free writing)
- Word Sprint (Pomodoro-style timed sessions)
- Research Queue
- Saved Hooks
- Writing Streak Calendar
- Core interface foundation

---

## [2.0.0] — Early February 2026

### Added
- Initial React/Vite setup
- Basic component architecture
- Local storage persistence

---

## [1.0.0] — Late January 2026

### Added
- Project initialization
- Basic file structure
