# F01 — One-page Website

## Goal
Build the public-facing `praew.tattoos` website as a single-page tattoo artist portfolio with a clear path from discovering the artist to checking availability and requesting an appointment.

## Scope
- One public page
- Responsive navigation
- Hero section
- Gallery section
- About section
- Services section
- Available Slots section
- Booking form section/state
- Footer/contact CTA
- Smooth navigation between sections

## UX Structure
```text
Hero
  ↓
Gallery
  ↓
About
  ↓
Services
  ↓
Available Slots
  ↓
Booking Form
  ↓
Footer
```

## Navigation
The navbar should contain links such as:
- Gallery
- About
- Services
- Available Slots

`Available Slots` must not navigate to a separate public page. It should scroll to or activate the availability section.

## Design Requirements
- Tattoo portfolio aesthetic
- Image-led visual hierarchy
- Strong typography
- Minimal UI chrome
- Mobile-first responsive layout
- Clear primary booking CTA
- Avoid generic SaaS/dashboard styling

## Accessibility
- Semantic HTML
- Keyboard-accessible navigation
- Visible focus states
- Sufficient color contrast
- Meaningful image alt text
- Form controls must have labels

## Technical Requirements
- Next.js App Router
- TypeScript
- Tailwind CSS
- Reuse shared components
- Avoid unnecessary dependencies
- Keep public UI separate from admin UI at the route/layout level

## States
The page must handle:
- Loading content
- Empty gallery
- No available slots
- Booking form loading/submitting
- API/server errors

## Testing Checklist
- [ ] Desktop layout works
- [ ] Mobile layout works
- [ ] Navbar links reach correct sections
- [ ] Available Slots CTA reaches availability
- [ ] Keyboard navigation works
- [ ] Images have alt text
- [ ] No horizontal overflow
- [ ] TypeScript passes
- [ ] Lint/format passes

## Definition of Done
- One complete responsive public page exists.
- Navigation works without unnecessary page changes.
- Available Slots can be reached directly from the navbar.
- Visual style matches a professional tattoo portfolio.
## Figma Reference — Single-page Layout

The provided Figma reference defines the public experience as **one continuous page**, not multiple public pages.

### Desktop Composition

```text
┌─────────────────────────────────────────────────────┐
│                         Navbar                      │
│ available slots | location | contact us | Instagram│
├─────────────────────────────────────────────────────┤
│                                                     │
│                 Gallery / Portfolio                │
│                                                     │
│   Featured work + category-based work collections   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│                    Location                         │
│                                                     │
│   Studio description       Address / transport      │
│                           Google Maps / CTA          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                   Available Slots                   │
│                                                     │
│ Calendar       Appointment form                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Navbar

The Figma reference uses a minimal text navigation:

- `available slots`
- `location`
- `contact us`
- `Instagram`

Do not introduce a large multi-level navigation or a hamburger menu on desktop unless the responsive design requires it.

### One-page Navigation Behavior

Navbar items should scroll to sections on the same page:

- `available slots` → Available Slots section
- `location` → Location section
- `contact us` → Contact section
- `Instagram` → external Instagram profile

The public website should not navigate to `/booking`, `/location`, or `/contact` for these primary interactions.

### Page Sections

The implementation should support the following order while remaining flexible enough to evolve with the final Figma:

1. Navigation
2. Gallery / Portfolio
3. Location
4. Available Slots / Booking
5. Contact
6. Footer

The exact vertical spacing should follow the design rather than using a generic website section template.

### Visual Direction

The reference intentionally uses:
- Large whitespace
- Thin borders
- Small/simple navigation text
- Minimal controls
- Editorial portfolio presentation
- Image-led content
- Neutral/off-white page surfaces
- Black/gray typography
- No heavy cards, gradients, or dashboard styling

Avoid automatically converting the Figma into a conventional SaaS landing page.

### Responsive Requirement

The screenshots show desktop compositions. Mobile implementation must preserve the same visual hierarchy rather than simply shrinking desktop elements.

On mobile:
- Navigation may collapse if necessary.
- Gallery images should remain visually strong.
- Gallery rows can become a vertical or horizontal responsive composition.
- Location content should stack naturally.
- Calendar and booking form should become a single-column flow.

## Figma Fidelity Rule

When implementing this feature, treat the supplied Figma/screenshots as the visual source of truth.

AI should:
- Reproduce spacing and hierarchy before adding abstractions.
- Avoid inventing sections that are not in the design.
- Reuse the same visual language across Gallery, Location, and Booking.
- Ask before changing the overall page structure.
