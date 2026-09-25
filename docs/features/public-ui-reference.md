# Public UI Reference — Figma

## Source

The supplied Figma screenshots define the intended public one-page composition for `praew.tattoos`.

The screenshots should be treated as the visual reference for implementation.

## Core Principle

This is a **single-page tattoo artist portfolio**, not a SaaS booking website.

The booking/calendar is one interaction inside the portfolio page.

## Public Navigation

```text
available slots
location
contact us
Instagram
```

Expected behavior:

| Item | Behavior |
|---|---|
| available slots | Scroll to Available Slots |
| location | Scroll to Location |
| contact us | Scroll to Contact |
| Instagram | External link |

## Main Page

```text
Navbar
  ↓
Gallery / Portfolio
  ↓
Location
  ↓
Available Slots
  ↓
Contact / Footer
```

## Gallery

The Figma uses an editorial gallery composition:
- Featured image + supporting text
- Category-based image groups
- Horizontal image rows
- Large whitespace
- Minimal image chrome

Do not replace it with a generic card grid without checking the design.

## Location

The Figma shows:
- Studio description on the left
- Address and transport information on the right
- Google Maps
- Navigation/contact CTA buttons

## Available Slots

The Figma shows a compact calendar on the left and appointment form on the right.

```text
Calendar | Appointment Form
```

Appointment form includes:
- Date
- Time
- Full Name
- Email
- Service
- Cancel
- Confirm

The final implementation may add tattoo-specific fields required by the booking specification.

## Visual Language

Use:
- generous whitespace
- thin borders
- small navigation text
- neutral/off-white surfaces
- black/gray typography
- editorial spacing
- minimal controls
- image-led composition

Avoid:
- SaaS dashboard cards
- excessive rounded cards
- gradients
- unnecessary shadows
- oversized UI controls
- excessive animations
- unnecessary sections

## Responsive

Desktop follows the supplied composition.

Mobile should preserve:
1. Gallery hierarchy
2. Location readability
3. Calendar → form flow
4. Clear booking CTA

Desktop two-column areas can stack vertically on mobile.

## Implementation Rule for AI

Before changing the public layout:

1. Read `PROJECT.md`.
2. Read the relevant feature `.md`.
3. Compare the current implementation with the Figma reference.
4. Modify only the relevant feature.
5. Do not invent new sections.
6. Do not replace the editorial layout with generic UI patterns.
7. Report visual/structural changes after implementation.
