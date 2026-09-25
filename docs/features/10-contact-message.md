# F10 — Contact Message

## Goal
Allow visitors to contact the tattoo artist for questions that do not require immediate appointment booking.

## Scope
- Contact section/form
- Name
- Email
- Message
- Optional phone number
- Server-side validation
- Admin message inbox

## Customer Flow
```text
Contact
  ↓
Fill Form
  ↓
Validate
  ↓
Submit
  ↓
Create ContactMessage
  ↓
Show Success State
```

## ContactMessage Data
Recommended fields:
- `id`
- `name`
- `email`
- `phone` (optional)
- `message`
- `status`
- `createdAt`
- `updatedAt`

Possible status values:
```text
UNREAD
READ
REPLIED
ARCHIVED
```

## Validation
- Name required
- Valid email required
- Message required
- Reasonable maximum message length
- Optional phone must use an accepted format

Validation must run on the server even if client-side validation exists.

## Spam Protection
If spam becomes a real issue, consider:
- Rate limiting
- Honeypot field
- CAPTCHA/Turnstile

Do not add complex anti-spam infrastructure before it is needed.

## Admin
Admin should be able to:
- View messages
- Mark as read
- Mark as replied
- Archive
- Open message details

## Privacy
- Contact messages are private admin data.
- Do not expose messages through public APIs.
- Avoid logging complete message contents unnecessarily.

## Error States
Handle:
- Invalid input
- Network/server error
- Database failure
- Duplicate/rapid submission
- Successful submission

The success state should not imply that an appointment was created.

## Testing Checklist
- [ ] Required validation works
- [ ] Invalid email is rejected
- [ ] Server validation works
- [ ] Message is stored
- [ ] Success state appears
- [ ] Admin can view message
- [ ] Public cannot access messages
- [ ] Spam protection can be added later

## Definition of Done
- Visitors can send a message successfully.
- Messages are stored securely.
- Admin can manage message status.
- Contact submission remains separate from appointment booking.
## Figma Reference — Contact Us

The supplied Figma includes `contact us` in the main navbar.

This should behave as an anchor interaction within the same public page.

```text
Navbar
  ↓
contact us
  ↓
Contact section
```

Do not create a separate public contact page unless required later.

### Contact Section

The final section should follow the same minimal visual language:
- generous whitespace
- simple typography
- minimal form controls
- clear labels
- no heavy dashboard/card styling

### Relationship to Instagram

The navbar includes:
- `contact us`
- `Instagram`

`Instagram` is an external social link.

`contact us` is an internal one-page anchor.

These interactions must remain distinct.

### Contact Form

A minimal form is preferred:

```text
Name
Email
Message

[Send]
```

Optional phone number can be added if required by the final business flow.

The form should not visually compete with the appointment booking flow.

## Location Reference

The first supplied Figma screenshot also contains a Location section with:

```text
Location

Studio description        Address / transport
                          Google Maps
                          CTA buttons
```

Location content belongs to the public one-page experience and can be implemented alongside Contact.

Keep the location content concise and practical:
- Studio description
- Address
- Public transport guidance
- Google Maps link
- Optional navigation/contact CTA

Do not expose unnecessary private location information if the studio address is not intended to be public.
