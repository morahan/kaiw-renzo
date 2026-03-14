## [6.2.0] — March 14, 2026 (9:54 AM) [TINKER SESSION]

### Added
- **New CSS Enhancements**
  - Streak Fire Animation (fireGlow, fireFlicker) — Enhanced visual for 7+ day streaks
  - Card Gradient Border on hover — Smooth gradient reveal effect
  - Enhanced Focus Mode with radial gradient background
  - Smooth page transitions (slideInUp, fade effects)
  - Keyboard Shortcut Hints (kbd-hint) — Better discoverability
  - Glassmorphism Cards (glass-card) — Modern translucent card styling
  - Improved Toast Notifications with success/error variants

### Changed
- Updated version badge to v6.2 in index.html

---

## [6.1.0] — March 14, 2026 (8:15 AM) [TINKER SESSION]

### Added
- **Mobile Responsiveness Improvements**
  - Better breakpoints for tablet (992px), mobile (768px), and small mobile (480px)
  - Hidden elements that don't fit on smaller screens
  - Improved touch targets and spacing
  - Collapsible pinned bar on mobile
  - Hidden footer shortcuts on mobile for cleaner view

- **Enhanced Card Styling**
  - New gradient top border on hover for all cards
  - Improved focus states for accessibility
  - Better visual hierarchy

- **UI Polish**
  - Badge variants (success, warning, error, info, purple)
  - Smooth scroll behavior
  - Improved scrollbar styling
  - Better toast positioning on mobile

### Changed
- Updated version badge to v6.1 in index.html

---

## [5.11.0] — March 14, 2026 (7:15 AM) [TINKER SESSION]

### Added
- **Writing Prompts Generator** (Keyboard: Shift+] or FAB)
  - 7 prompt categories: Myth-Bust, How-To, Comparison, Listicle, Hot-Take, Science, Longevity
  - Random prompt generation with one click
  - Copy prompt to clipboard
  - "Use This" to start writing with the prompt
  - Recent prompts history (last 5)
  - All prompts are fitness/content themed

- **NEW v5.11 UI Enhancements**
  - Added Writing Prompts to FAB menu
  - New keyboard shortcut (Shift+] for Prompts)
  - Footer updated to v5.11 with new feature callouts

---

## [5.10.0] — March 14, 2026 (6:00 AM) [TINKER SESSION]

### Added
- **Pomodoro Timer Modal** (Keyboard: Shift+; or FAB)
  - 25-min work sessions with customizable durations
  - 5-min short breaks and 15-min long breaks
  - Visual circular progress indicator
  - Session history tracking (up to 50 sessions)
  - Real-time WPM and total focus time calculations
  - Save settings to localStorage

- **Article Outline Generator** (Keyboard: Shift+[ or FAB)
  - 4 template types: Science-Backed, How-To, Myth Buster, Listicle
  - Auto-generates section structure with writing prompts
  - Editable content areas for each section
  - Target word count guidance per section
  - Copy as text or save outline for later
  - Total word count calculation

- **NEW v5.10 UI Enhancements**
  - Added Pomodoro and Outline Generator to FAB menu
  - New keyboard shortcuts (Shift+; for Pomodoro, Shift+[ for Outline)
  - Enhanced CSS with conic-gradient progress circles
  - Responsive design for modals on mobile

### Improved
- Footer updated to v5.10 with new feature callouts
- FAB menu expanded with new productivity tools
- Keyboard shortcuts now include Shift variants for new features

---

## [5.9.1] — March 14, 2026 (5:45 AM) [TINKER SESSION]

### Added
- **Enhanced Daily Goal Ring Widget** - Visual circular progress indicator in header
  - Ring fills based on daily word goal progress  
  - Color-coded: 🟠 <50%, 🔴 50-99%, 🟢 100%+ (complete)
  - Shows percentage in center of ring
  - Shows green checkmark when goal exceeded
- Updated version badge to v5.9.1 in index.html

### Improved
- CSS polish for modal backdrops (better blur effect)
- Added shortcut badge styling for consistent keyboard shortcut hints
- Added card glow hover effects
- Goal widget shows green "✓" when exceeded


## [5.9.0] — March 14, 2026 (4:45 AM)

### Added

#### Quote Collection (NEW - Keyboard: ] key)
- Save and organize notable quotes from research
- Categorize quotes by type (Science, Motivation, Technique, Nutrition, etc.)
- Quick copy-to-clipboard functionality
- Persistent storage (up to 100 quotes)
- Filter by category
- Added to pinned bar for quick access

#### Topic Frequency Analyzer (NEW - Keyboard: ' key)
- Visualize which topics appear most in your ideas and articles
- Bar chart showing top 20 topics with frequency counts
- Content Gap detection - identifies important fitness topics you haven't covered
- Shows total ideas, articles, and unique topic counts
- Helps identify content opportunities and gaps

### Changed
- Version bump to v5.9
- Added Quotes and Topics buttons to pinned bar
- Added Quotes and Topic Freq to feature buttons row

### Improved
- CSS styling for new Quote Collection modal
- CSS styling for Topic Frequency Analyzer with gradient bars
- Better visual hierarchy for new components

---

## [5.9.1] — March 14, 2026 (5:15 AM) [TINKER SESSION]

### Added
- **Daily Writing Score Widget** - Real-time productivity score (0-100) in header
  - Calculates based on: word goal progress (60%), ideas bonus (10%), hooks bonus (10%), streak bonus (max 20%)
  - Color-coded: 🔥 80+ (green), 💪 50-79 (orange), 🌱 <50 (red)
- Updated version badge to v5.9

### Improved
- Added CSS for new score widget with hover effects
- Mobile responsive styling

---

## [5.8.0] — March 14, 2026 (4:15 AM)

### Added

#### Quick Web Research Modal (NEW - Keyboard: Shift+R)
- Instantly search the web for research topics directly from the dashboard
- Results from trusted sources (PubMed, Science Daily, Examine.com, etc.)
- One-click save to research queue for later article writing
- Real-time search with loading animation
- Beautiful result cards with snippets and source information
- Added to pinned bar for quick access
- Added to feature buttons row

#### Performance Analytics Fix
- Fixed articles variable reference to use recentArticles
- Dashboard now properly displays performance analytics

### Changed
- Version bump to v5.8
- Added Web Search pinned item for quick access
- Added Web Search button to feature buttons row
- Updated footer and header version indicators

### Improved
- Enhanced keyboard shortcut system with Shift+R for research
- CSS styling for new web research modal
- Better visual hierarchy for search results
All notable changes to this project will be documented in this file.

## [5.7.0] — March 14, 2026 (1:59 AM)

### Added

#### Writing Time Insights Modal (NEW - Keyboard: +/= key)
- Analyze writing patterns to identify best days and times
- Shows activity breakdown by day of week with visual bar charts
- Identifies peak productivity hour for optimal writing sessions
- Displays weekly session counts and average words per session
- Smart recommendation system suggests best times to write
- Data-driven insights help optimize writing schedule
- Interactive visualization with hover effects on daily activity bars

#### Enhanced Export Drafts Panel (E key)
- **New Format: Notion** - Exports in Notion-compatible format with proper block structure
- **New Format: HTML** - Self-contained HTML page with professional styling
- **Improved Markdown** - Better formatting with metadata and structured sections
- **Format Selection UI** - Radio buttons with descriptions for each export format
- Visual indicators showing what each format is best for
- Enhanced download button with format name
- All formats include word count and metadata

#### Improved Keyboard Shortcut Handling
- Added +/= keyboard shortcut for Writing Time Insights
- Better keyboard event detection and handling
- More intuitive shortcut assignments

#### Enhanced CSS for New Components
- New `.writing-insights` component styling
- `.insights-highlights` grid layout for stat cards
- `.day-bars` visualization for daily activity
- `.time-recommendation` card with smart suggestions
- `.export-format-options` for better format selection UI
- Mobile-responsive design for all new components
- Smooth transitions and hover effects throughout

### Changed
- Version bump to v5.7.0
- Updated title in index.html to reflect v5.7
- Enhanced ExportDraftsModal with multi-format support
- Improved visual hierarchy of export options

### Improved
- Dashboard now includes more granular productivity insights
- Export functionality is more flexible with multiple format options
- CSS animations and transitions across new components
- Better color coding and visual feedback for interactive elements
- Mobile responsiveness for writing insights visualization

## [5.6.0] — March 14, 2026

### Added

#### Enhanced Study Spotlight Widget
- Now includes PubMed PMID references for direct access to studies
- Added "Open on PubMed" link for each study
- Added copy-to-clipboard button for easy study information sharing
- Expanded studies list with new research articles
- Improved visual feedback with hover states

#### Recent Ideas Widget (NEW)
- Quick access to top 3 recent content ideas
- Shows idea title and angle preview
- Category emoji indicators for quick scanning
- "View All Ideas" button to access complete ideas bank
- Empty state with helpful CTA if no ideas exist
- Hover effects for better interactivity

#### Quick Stat Generator Improvements
- Added copy-to-clipboard button for stats
- Visual feedback on copy action (checkmark animation)
- Better source link styling and accessibility
- Improved button layout with icon grouping
- Stat source toggles independently

### Changed
- Version bump to v5.6
- Enhanced CSS styling for dashboard widgets with better transitions
- Improved visual hierarchy for Recent Ideas widget
- Added 2 new studies to Study Spotlight list
- All buttons now have consistent hover states and transitions

### Improved
- Copy button visual feedback across widgets (Study Spotlight, Quick Stat, etc.)
- Dashboard widget spacing and alignment
- Accessibility of external links (PubMed, stat sources)
- CSS animations for stat generation
- Overall dashboard visual polish

## [5.5.0] — March 13, 2026

### Added

#### Content Overview Widget (NEW)
- At-a-glance stats showing total articles, drafts, published, and this week's count
- Shows in the new-features-row for quick reference
- Real-time updates as drafts are created/updated

#### Enhanced Keyboard Shortcuts Modal
- Added all missing keyboard shortcuts from v5.3 and v5.4
- Added Cmd/Ctrl+K for command palette
- Added number keys (0-9) for quick access
- Added special characters: `(`, `)`, `+`, `-`, `=`, `\`, `` ` ``

#### Enhanced Category Colors
- Added colors for additional categories: Longevity, Training, Recovery, Metrics, Nutrition
- Improved visual differentiation for content ideas

### Changed
- Version bump to v5.5
- Updated version badge in header and footer
- Updated index.html title to v5.5
- Updated package.json to 5.5.0

## [5.4.0] — March 13, 2026

### Added

#### Smart Draft Analyzer (Key: *)
- Analyze drafts for quality metrics
- Metrics: words, readability score, word variety, sentiment analysis
- Structure checks: hook, CTA, sources, power words
- Personalized recommendations based on analysis

#### Content Format Preview (Key: ()
- Preview content in different platform formats
- Supports: Notion, Twitter/X, LinkedIn, Newsletter, Blog
- Copy formatted content to clipboard

#### Pomodoro Timer (Key: ))
- Classic 25/5/15 Pomodoro technique
- Modes: Focus, Short Break, Long Break
- Session tracking and auto-transitions

#### Quick Share (Key: +)
- Export content in multiple formats
- Supports: Plain Text, Markdown, HTML, JSON
- One-click copy to clipboard

#### Enhanced Quick AI Prompt (Key: `)
- Now connects to local MiniMax API (port 8081)
- Falls back to smart templates for content generation
- Context-aware responses: hooks, headlines, articles, threads
- Supports custom prompts with intelligent routing
- Full prompt history with one-click re-run

### Changed
- Version bump to v5.4
- Added 4 new feature buttons to toolbar
- Improved Quick AI Prompt with real API integration
- Enhanced package.json version consistency (5.4.0)

## [5.3.0] — March 13, 2026

### Added

#### Performance Analytics (Key: !)
- New modal with comprehensive performance metrics
- Time range filtering: Week, Month, Year
- Key metrics displayed:
  - 📝 Total articles written
  - 💬 Average engagement score
  - 👁️ Total reads across content
  - 🔥 Top performing category
- Trend indicators showing up/down movement vs previous periods
- Key insights section with data-driven recommendations
- Responsive grid layout for metrics cards

#### Writing Goals Widget (Key: @)
- Goal creation and tracking system
- Support for multiple goal types: words, articles, threads, hours
- Visual progress bars with percentage indicators
- Quick progress increment buttons
- Persistent storage with localStorage
- Goal completion badges
- Delete goals functionality
- Deadline tracking for weekly goals

### Changed
- Version bump to v5.3
- Updated footer to reflect v5.3
- Added new keyboard shortcuts (! for Analytics, @ for Goals)
- Enhanced UI with gradient progress bars and improved visual feedback

## [5.2.0] — March 13, 2026

### Added

#### CLI Command Runner (Key: \)
- Run renzo CLI commands directly from the UI
- 7 available commands:
  - `brief` - Generate research brief for a topic
  - `quickbrief` - Instant 5-second writing plan (no API)
  - `status` - Show pipeline health dashboard
  - `thread` - Convert article to X thread
  - `check` - Run quality analysis on article
  - `sync` - Sync Notion ↔ X metrics
  - `tools` - List all available tools
- Command history with quick re-run
- Mock output for demonstration (would connect to real CLI in production)

### Changed
- Version bump to v5.2
- Updated keyboard shortcut documentation

## [5.0.0] — March 13, 2026

### Added

#### Daily Writing Challenge (Shift+1)
- Gamified daily writing prompts that change each day
- 7 rotating challenge types: hooks, headlines, myths, CTAs, threads, science, comparisons
- Streak tracking - build consecutive day streaks
- Header widget for quick access
- Mark complete/incomplete toggle
- Persistent storage with localStorage
- Challenge resets at midnight local time

#### Quick Access Header Widget
- Daily Challenge widget added to header
- One-click access to today's writing challenge

### Changed
- Version bump to v5.0
- Added Shift+1 keyboard shortcut for Daily Challenge

## [4.9.0] — March 13, 2026

### Added

#### Quick Export All (Key ])
- One-click full backup of all data
- Exports: drafts, ideas, hooks, headlines, references, notes, activities, research queue, series, pipeline, writing history, velocity history, inspiration board, reading list, clipboard history, and settings
- Downloads as timestamped JSON file
- Quick access button in header (📦)

#### Featured Article Section
- Highlights top-performing article on dashboard
- Shows engagement score, reads, shares
- Click to view full analytics
- Animated entrance

### Changed
- Updated version badge to v4.9 (was v4.7 in index.html)

### Improvements
- Added keyboard shortcut (]) for Quick Export All
- Enhanced header with export button
- Better visual hierarchy on dashboard

## [4.7.0] — March 13, 2026

### Added

#### Reading List (Key 0)
- Save URLs for research with optional titles
- Filter by read/unread status
- Mark items as read/unread
- One-click open in new tab
- Persistent storage with localStorage

#### Quick AI Prompt (Key `)
- Text input for custom prompts
- Simulated AI response generation
- Prompt history (last 10)
- Copy result to clipboard
- Quick access to recent prompts

### Improvements
- Updated version badge to v4.7
- Added new feature buttons in the feature row

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
