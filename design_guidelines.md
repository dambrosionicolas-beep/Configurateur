# Design Guidelines: HubSpot AI Configuration Platform

## Design Approach

**Selected Approach:** Design System (Material Design + Modern SaaS Patterns)

**Justification:** This is a utility-focused B2B SaaS productivity tool where efficiency, data clarity, and professional polish are paramount. Drawing inspiration from Linear, Notion, and Material Design for enterprise-grade functionality with modern aesthetics.

**Key Principles:**
- Clarity over decoration - every element serves a functional purpose
- Progressive disclosure - reveal complexity as needed
- Real-time feedback - visual confirmation of all actions
- Trust through professionalism - clean, confident design

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for API keys, technical data)

**Hierarchy:**
- Page Titles: text-3xl font-semibold (Inter)
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels: text-sm font-medium uppercase tracking-wide
- Helper Text: text-sm font-normal
- Code/API Keys: text-sm font-mono

## Layout System

**Spacing Primitives:** Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-6 to p-8
- Section margins: mb-8 to mb-12
- Card gaps: gap-6
- Form field spacing: space-y-4
- Button padding: px-6 py-3

**Grid Structure:**
- Dashboard: Two-column layout (sidebar + main content)
- Sidebar: Fixed width 280px, dark treatment
- Main content: max-w-6xl with px-8 py-6
- Cards: Grid with gap-6, responsive (1 col mobile, 2-3 cols desktop)

## Component Library

### Navigation
**Sidebar Navigation:**
- Fixed left sidebar with logo, main nav items, user profile footer
- Nav items: Icon + label, hover state with subtle background
- Active state: Background accent with left border indicator
- Collapsible sections for organized hierarchy

**Top Bar:**
- Breadcrumb navigation showing current workflow step
- Real-time status indicator (API connected, processing, etc.)
- User account dropdown (top-right)

### Forms & Inputs

**Industry Selector:**
- Large card-based selection grid (3 columns desktop)
- Each card: Industry icon, name, brief description
- Selected state: Border accent, checkmark overlay
- Categories: Real Estate, E-commerce, Services, Healthcare, Finance, Manufacturing, etc.

**API Key Input:**
- Secure text field with password-style masking
- "Show/Hide" toggle icon
- "Test Connection" button with loading spinner
- Success/error feedback with icon and message
- Helper text: "Your API key is encrypted and never stored"

**Standard Form Elements:**
- Clean inputs with floating labels
- Focus state: Border accent
- Error state: Red border + error message below
- Success validation: Green checkmark icon

### Data Display

**Configuration Dashboard:**
- Multi-section layout showing created elements:
  - Properties/Fields section
  - Lists section  
  - Workflows section
  - Dashboards section
- Each section: Collapsible accordion with count badge
- Item cards showing: Name, type, status (created/pending/error)
- Real-time updates as AI creates configurations

**Status Cards:**
- Compact cards with icon, metric, label
- Examples: "12 Properties Created", "3 Workflows Active"
- Color-coded status indicators (processing, complete, error)

**Progress Indicators:**
- Multi-step wizard for configuration flow
- Step indicators: numbered circles with connecting lines
- Current step highlighted, completed steps with checkmarks
- Linear progress bar for AI processing phase

### Buttons & Actions

**Primary Actions:** 
- Solid background, medium border-radius (rounded-lg)
- States: default, hover (slightly darker), active (pressed effect), disabled (opacity-50)

**Secondary Actions:**
- Border style with transparent background
- Same state hierarchy as primary

**Danger Actions:**
- Red accent for destructive operations (disconnect, delete)

**Button Groups:**
- Inline groups for related actions (Cancel + Confirm)
- Proper spacing with gap-3

### Overlays

**Modal Dialogs:**
- Centered overlay with backdrop blur
- Max-width constraint (max-w-2xl)
- Header with title + close button
- Content area with generous padding
- Footer with action buttons (right-aligned)

**Toast Notifications:**
- Slide-in from top-right
- Auto-dismiss after 5 seconds
- Types: Success (checkmark), Error (alert), Info (info icon), Processing (spinner)
- Dismissible with X button

**Loading States:**
- Skeleton screens for initial load
- Inline spinners for button actions
- Full-page loader with logo + spinner for heavy processing

## Page-Specific Layouts

**Onboarding Flow:**
1. Welcome screen with value proposition
2. Industry selection (card grid)
3. API key connection (centered form)
4. AI configuration (full-screen processing with live log)
5. Success dashboard (completed configurations)

**Main Dashboard:**
- Sidebar navigation (always visible)
- Header with breadcrumb + quick actions
- Main content area with statistics cards at top
- Tabbed interface for different configuration types
- Each tab shows relevant table/grid of created items

**Configuration Detail View:**
- Split layout: Left (configuration tree), Right (details panel)
- Editable fields inline
- Save/Discard changes footer (sticky)

## Animations

**Minimal, Purpose-Driven:**
- Page transitions: Subtle fade (150ms)
- Card hover: Gentle lift with shadow (200ms ease)
- Button press: Quick scale effect (100ms)
- Modal entrance: Fade + scale from 95% to 100% (200ms)
- Progress bars: Smooth width transitions
- **No decorative animations** - all motion serves clarity

## Icons

**Library:** Heroicons (via CDN)
- Outline style for navigation and secondary actions
- Solid style for status indicators and filled states
- Consistent 24px size for primary UI, 20px for compact areas

## Images

**Minimal Image Usage:**
- Logo in sidebar navigation
- Industry icons (simple, consistent style) for sector selection cards
- Empty state illustrations (simple line art) when no configurations exist
- No hero images - this is a functional dashboard application

---

**Implementation Notes:**
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Dark sidebar with light main content area creates clear hierarchy
- Maintain consistent card elevation (shadow-sm for raised elements)
- Use alert banners for system-wide notifications
- Form validation should be immediate and helpful