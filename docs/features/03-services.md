# F03 — Services

## Goal
Present the tattoo services clearly so customers understand the available service types and relevant pricing/deposit information before booking.

## Scope
- Services section on the public page
- Service cards/list
- Service description
- Starting price or pricing guidance
- Deposit information where applicable
- Active/inactive service handling

## Service Data
Recommended fields:
- `id`
- `name`
- `slug`
- `description`
- `priceFrom`
- `depositAmount`
- `durationMinutes` (optional)
- `isActive`
- `sortOrder`
- `createdAt`
- `updatedAt`

## UX
Each service should communicate:
- What the service is
- Who it is suitable for
- Starting price or pricing rule
- Estimated duration if known
- Deposit requirement if applicable
- CTA to check available slots

## Business Rules
- Only active services are shown publicly.
- A booking must reference a specific service.
- Deposit amount used by a booking must be stored with the booking/payment.
- Changing a service's current price must not alter historical booking/payment records.

## Pricing
Avoid calculating historical payment amounts from the current service record.

Example:
```text
Service price today: 4,000 THB
Deposit: 1,000 THB

Booking stores:
- agreed/service price
- deposit amount
- remaining amount
```

## Admin Consideration
Future admin functionality may include:
- Create service
- Edit service
- Activate/deactivate service
- Update pricing
- Update deposit
- Change display order

## Testing Checklist
- [ ] Active services appear
- [ ] Inactive services are hidden
- [ ] Service information is readable on mobile
- [ ] Booking CTA points to Available Slots
- [ ] Historical booking prices remain unchanged after service edits

## Definition of Done
- Customers can understand available services before booking.
- Active/inactive rules work.
- Service information integrates with booking selection.
## Relationship to the Figma

The current Figma reference does **not** show a large standalone Services section.

Therefore:
- Do not force a large service-card section into the page simply because a service entity exists in the backend.
- Service information should primarily support the booking flow.
- If service information is shown publicly, it should visually fit the minimal editorial style of the page.

A service selector can appear inside the appointment form rather than creating a separate SaaS-style pricing grid.

## Public Presentation

Prefer concise information such as:

```text
Service
Realistic Color Tattoo

Starting from
4,000 THB

Deposit
1,000 THB
```

The final presentation should follow the Figma style and avoid heavy cards.
