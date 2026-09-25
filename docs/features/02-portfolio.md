# F02 — Gallery / Portfolio

## Goal
Display the tattoo artist's work in a visually strong portfolio gallery.

## Scope
- Portfolio image grid
- Image categories/tags if required
- Image detail/lightbox only if useful
- Responsive layout
- Loading and empty states
- Accessible image handling

## Portfolio Item
Recommended fields:
- `id`
- `title`
- `imageUrl`
- `altText`
- `category`
- `description` (optional)
- `isPublished`
- `sortOrder`
- `createdAt`
- `updatedAt`

## UX
```text
Gallery
  ↓
Browse tattoo work
  ↓
Optional category/filter
  ↓
Optional image detail
```

Do not make filtering more complex than the actual portfolio requires.

## Image Requirements
- Use optimized image delivery.
- Do not load unnecessarily large originals to the browser.
- Provide meaningful alt text.
- Keep image aspect ratios visually consistent where appropriate.
- Use Cloudinary if external image storage is required.

## Admin Consideration
The admin should eventually be able to:
- Add portfolio item
- Edit portfolio item
- Publish/unpublish
- Delete/archive item
- Change display order

Admin implementation belongs to the admin feature and should not be added prematurely to F02 unless required for the public gallery.

## Error / Empty States
- Gallery loading
- No published portfolio items
- Broken image
- Image service unavailable

## Testing Checklist
- [ ] Images load correctly
- [ ] Responsive grid works
- [ ] Mobile image sizing works
- [ ] Alt text exists
- [ ] Unpublished items are not shown publicly
- [ ] Empty state is handled
- [ ] No unnecessary image requests

## Definition of Done
- Published portfolio items display correctly.
- Gallery is responsive and visually consistent.
- Image loading is optimized.
- Accessibility requirements are met.
## Figma Reference — Gallery Layout

The supplied Figma shows the gallery as the main visual content of the page.

### Gallery Structure

The reference uses category-based groups rather than a generic masonry feed.

Example structure:

```text
Realistic Color Tattoos
[featured image]     [description / text]

Realistic Black & Gray Tattoos
[label]    [image] [image] [image] [image]

Realistic Color Tattoos
[label]    [image] [image] [image] [image]
```

The exact categories and images are content decisions, but the layout should preserve the editorial composition shown in Figma.

### Featured Gallery Block

The first gallery block contains:
- One larger featured tattoo image
- Supporting text beside the image
- Tattoo style/title
- Short description
- Optional CTA or supporting metadata

The text should not dominate the image.

### Category Rows

Additional categories can use:
- Category label on the left
- Multiple tattoo images arranged horizontally
- Consistent image sizing/aspect ratio
- Generous whitespace between groups

Do not automatically use a standard 3-column/4-column card grid if it conflicts with the Figma composition.

### Image Presentation

Images should feel like portfolio artwork rather than product cards:
- Minimal/no visible card chrome
- No unnecessary shadows
- No excessive rounded corners unless specified by final design
- Preserve image quality
- Consistent visual rhythm

### Content Rules

Only published portfolio items should appear on the public page.

Suggested category examples:
- Realistic Color Tattoos
- Realistic Black & Gray Tattoos

Categories should remain data-driven so the artist can add or change styles later.

### Interaction

The initial implementation can remain static/scroll-based.

Only add:
- Lightbox
- Hover effects
- Category filtering
- Image detail views

if they are part of the final design or provide a clear user benefit.

Do not turn the gallery into a complex media-management UI on the public page.

## Figma Fidelity Rule

The gallery is an editorial portfolio section. Match the reference composition first; component abstraction and advanced interactions come second.
