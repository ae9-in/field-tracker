---
name: FieldTrack Core
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#efecf9'
  surface-container-high: '#e9e6f3'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#454555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f2effc'
  outline: '#767587'
  outline-variant: '#c6c4d8'
  surface-tint: '#4547e1'
  primary: '#4244df'
  on-primary: '#ffffff'
  primary-container: '#5d61f9'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#4454bb'
  on-secondary: '#ffffff'
  secondary-container: '#8393fe'
  on-secondary-container: '#0f238e'
  tertiary: '#5d548d'
  on-tertiary: '#ffffff'
  tertiary-container: '#766da8'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#05006c'
  on-primary-fixed-variant: '#2928ca'
  secondary-fixed: '#dfe0ff'
  secondary-fixed-dim: '#bbc3ff'
  on-secondary-fixed: '#000e5f'
  on-secondary-fixed-variant: '#2a3ba2'
  tertiary-fixed: '#e6deff'
  tertiary-fixed-dim: '#c9beff'
  on-tertiary-fixed: '#1c1148'
  on-tertiary-fixed-variant: '#483f77'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin-mobile: 16px
  container-margin-desktop: 40px
  gutter: 16px
---

## Brand & Style

The design system for FieldTrack is engineered for reliability, speed, and high legibility in diverse environment settings. The brand personality is professional and systematic, prioritizing functional clarity for field workers while maintaining a modern, tech-forward aesthetic for administrative oversight.

The visual style blends **Modern Corporate** efficiency with **Subtle Playfulness**. It utilizes a clean, white-based interface punctuated by high-contrast primary accents to ensure critical information is glanceable even in high-glare outdoor conditions. A signature design element is the use of subtle diagonal stripe patterns in background containers, providing a sense of motion and "work-in-progress" energy without sacrificing content readability.

## Colors

The palette is anchored by a high-visibility violet-blue primary, specifically chosen for its digital vibrance and contrast against white surfaces.

- **Primary (#6367FF):** Used for "Action" elements—buttons, active navigation states, and status badges.
- **Secondary (#8494FF):** Reserved for interaction feedback (hovers) and illustrative data visualizations.
- **Soft Accent (#C9BEFF):** Functions as a structural color for borders, focus rings, and soft-tag backgrounds.
- **Background Tint (#FFDBFD):** A warm, soft highlight used sparingly for page backgrounds or alert containers to differentiate specialized zones.
- **Typography:** Headlines use the deep Dark Text (#1A1A2E) for maximum contrast, while secondary information utilizes Muted Text (#6B7280) to maintain a clear information hierarchy.

## Typography

This design system utilizes a dual-font strategy to balance character with utility. 

**Plus Jakarta Sans** is the display face, used for headings and prominent UI anchors. Its open counters and modern geometry provide an approachable yet professional tone.

**Inter** is the workhorse typeface for all body text, inputs, and data tables. It is chosen for its exceptional legibility at small sizes and high x-height, which is critical for field workers viewing data on mobile devices.

On mobile devices, headline sizes should scale down significantly to preserve screen real estate, while body text remains at a minimum of 16px to ensure accessibility.

## Layout & Spacing

The layout follows a **fluid-to-fixed** hybrid model. For mobile devices, a single-column fluid layout with 16px side margins is standard. For desktop views, the system transitions to a 12-column grid with a maximum content width of 1280px.

A strict 8px spacing rhythm (base 8) ensures vertical alignment and visual consistency. 

- **Internal Padding:** Use 16px (md) for standard card padding.
- **Section Spacing:** Use 32px (xl) to separate major content blocks.
- **Mobile Reflow:** For complex data tables, use a "card-stack" pattern where each row becomes an individual card when screen width falls below 768px.

## Elevation & Depth

This design system uses **Tonal Layering** supplemented by crisp outlines rather than heavy shadows.

- **Base Layer:** Page background in White or the Background Tint (#FFDBFD). 
- **Pattern Layer:** A subtle, low-opacity (5%) diagonal stripe pattern applied to section backgrounds or decorative sidebars.
- **Card Layer:** Pure White (#FFFFFF) with a 1px border using Soft Accent (#C9BEFF).
- **Interactive Elevation:** Elements do not "lift" with shadows on hover; instead, they utilize color shifts (Primary to Secondary) and subtle 2px inset focus rings in Soft Accent to indicate state.
- **Modals:** Use a heavy backdrop blur (12px) with a semi-transparent dark overlay to keep the focus strictly on the foreground task.

## Shapes

The design system employs a consistent **Rounded (Level 2)** shape language. This 8px (0.5rem) corner radius is applied to all primary containers, including buttons, input fields, and cards.

- **Standard (8px):** Buttons, Cards, Modals, Form Fields.
- **Small (4px):** Checkboxes and nested micro-elements.
- **Pill (Full Rounding):** Status badges and tags only, to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Background #6367FF, Text White, 8px radius. High contrast for key actions.
- **Secondary:** Background transparent, Border 2px #6367FF, Text #6367FF.
- **Hover States:** Primary shifts to #8494FF.

### Input Fields
- **Default:** White background, 1px border (#C9BEFF), 8px radius.
- **Focus:** 2px border #6367FF with a soft outer glow of #C9BEFF.
- **Labels:** Inter Bold (Label-md), color #1A1A2E.

### Cards & Lists
- Cards feature a 1px border (#C9BEFF) and no shadow.
- List items should have a minimum touch target height of 48px for mobile field use.
- Use the Background Tint (#FFDBFD) as a header background for specialized card types (e.g., "Urgent Tasks").

### Chips & Tags
- Used for status (e.g., "In Progress", "Completed").
- Background: #C9BEFF at 30% opacity.
- Text: #1A1A2E, 12px Medium.

### Navigation
- **Mobile:** Bottom navigation bar with 24px icons and 10px labels.
- **Desktop:** Left-hand sidebar using a condensed version of the Primary color for the active state indicator.