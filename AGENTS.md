# Project Rules & Design System

## Dark & Light Mode Legibility Directives (CRITICAL)

All text, icons, cards, modals, interactive controls, and visual elements must maintain strict WCAG AA contrast and high readability in both Light and Dark modes. This applies to every current and future feature.

### 1. Typography & Text Contrast
- **Light Mode**:
  - Headings: `text-neutral-950` or `text-neutral-900` (bold, crisp).
  - Body & Content Text: `text-neutral-800` or `text-neutral-700` (never washed-out light gray).
  - Secondary/Caption Text: `text-neutral-600` (maintaining at least 4.5:1 contrast against light backgrounds).
- **Dark Mode**:
  - Headings: `dark:text-white` or `dark:text-neutral-50` (high contrast, crisp).
  - Body & Content Text: `dark:text-neutral-200` or `dark:text-neutral-100` (sharp, bright, easily legible against dark cards and backdrops).
  - Secondary/Caption Text: `dark:text-neutral-300` or `dark:text-neutral-400` (never low-contrast dark grays like `text-neutral-600` on dark surfaces).
  - Links & Interactive Text: `text-indigo-600 dark:text-indigo-300` or `text-cyan-600 dark:text-cyan-400` with clear underline/hover cues.

### 2. Container Backgrounds & Borders
- **Cards & Modals**:
  - Light: `bg-white` or `bg-neutral-50` with `border-neutral-200` or `border-neutral-200/80`.
  - Dark: `dark:bg-neutral-900` or `dark:bg-neutral-800` with visible `dark:border-neutral-700`.
- **Inner Callout & Notice Boxes**:
  - Info: `bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-950 dark:text-indigo-100`.
  - Warning/Notice: `bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100`.
  - Danger/Disclaimer: `bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 text-rose-950 dark:text-rose-100`.
  - Success/Security: `bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/80 text-emerald-950 dark:text-emerald-100`.

### 3. Tailwind Class Discipline
- Avoid non-standard or arbitrary color steps (e.g. do not use `hover:bg-neutral-750`). Use valid Tailwind scale (`bg-neutral-700`, `bg-neutral-800`, `bg-neutral-900`, `bg-neutral-950`).
- Ensure all interactive buttons have accessible minimum heights (at least 36px/44px) and prominent focus/hover states.

## Responsive Web & Mobile Experience Parity (CRITICAL)

All features, UI modifications, modals, navigation flows, and components MUST apply seamlessly across both web (desktop/laptop/tablet) and mobile view experiences:
- **Responsive Layouts**: Use mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`). Design for seamless scaling down to 320px viewport widths with no horizontal overflow, clipping, or unscrollable elements.
- **Touch & Click Target Parity**: All interactive elements (buttons, links, badges, segmented controls, tabs, icons) must provide touch-friendly target areas (min 36px–44px tap targets on mobile) alongside clean desktop pointer interactions.
- **Modals, Drawers & Overlays**: Modals must be fully accessible and readable on mobile viewports (scrollable `max-h-[90vh]` or responsive sheet overlays with visible, accessible dismiss buttons) as well as spacious desktop views.
- **Cross-Platform PWA Parity**: Ensure headers, floating actions (e.g., Zena voice widget, PWA install banners, toast notifications), and footers accommodate mobile safe areas (`pb-safe`) and do not obscure core content or navigation on mobile devices.
