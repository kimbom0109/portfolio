---
name: ui-ux-pro-max-skill
description: AI-powered design intelligence skill for building professional-grade UI/UX across multiple platforms. Provides 50+ UI styles, 160+ color palettes, 50+ font pairings, and 99+ UX guidelines.
source: nextlevelbuilder/ui-ux-pro-max-skill (github.com/nextlevelbuilder/ui-ux-pro-max-skill)
---

# UI/UX Pro Max Skill

An AI SKILL that provides design intelligence for building professional UI/UX across multiple platforms.

## Core Principles

### Aesthetic Direction
- Choose ONE deliberate aesthetic direction and commit: glassmorphism, claymorphism, bento grid, brutalist, luxury editorial, etc.
- Avoid generic AI-generated aesthetics (warm cream + terracotta, dark + acid green, broadsheet grid)
- Every visual choice must be justifiable against the brief

### Color Palettes
- Use HSL-based color tokens for precision control
- Maintain 3:1 minimum contrast for text (4.5:1 for body text)
- Build a proper 5-shade token scale (100–900) for each palette hue
- Rose/Pink luxury palettes: HSL(340–350, 30–40%, 80–95%) for light surface tones

### Typography Pairing
- Display font (headlines): Cormorant Garamond, Playfair Display, or high-contrast serifs for editorial luxury
- Body font: Inter, Outfit, or clean grotesques for readability
- Korean text: Noto Serif KR or Noto Sans KR
- Set intentional type scale: 0.72rem (label) → 0.88rem (caption) → 1rem (body) → 1.35rem (h3) → 2rem–6rem (display)

### Layout Systems
- Bento Grid: Non-uniform CSS grid for skill/feature showcases
- Card Grid: auto-fill minmax(300px, 1fr) for project galleries
- Two-column asymmetric: 280px–340px sidebar + 1fr content for About/Contact

### Micro-animations
- Reveal on scroll: opacity + translateY via IntersectionObserver
- Hover: translateY(-4px to -8px) + box-shadow intensification
- Stagger siblings with setTimeout increments (0, 80ms, 160ms...)
- No excessive animations — restraint signals premium quality

### UX Guidelines
- Navigation: Fixed, blur backdrop, transparent → bordered on scroll
- Mobile: Hamburger menu with animated X transform, stacked layout
- Accessibility: semantic HTML5, ARIA labels, focus-visible states
- Performance: Google Fonts preconnect, CSS custom properties, no render-blocking JS

### Portfolio-Specific Patterns
- Hero: Full-viewport, large Korean + romanized name, role title in accent color
- Projects: Filter tabs (All / Ongoing / Upcoming) + card grid with status badges
- Skills: Bento grid with icon + category + list items
- Contact: Split layout with info items + decorative identity card
