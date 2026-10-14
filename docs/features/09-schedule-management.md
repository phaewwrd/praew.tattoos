# F09 — Schedule Management

## Goal
Allow the admin to control which appointment dates and time slots are available for customers to book.

## Implementation Status
DONE. The admin schedule is available at `/admin/schedule`. Existing `slots` are reused; `schedule_date_blocks` stores full-day closures that cannot be represented by a slot row.

## Core Principle
The server is the source of truth for availability.

The frontend must never assume that a slot is available simply because it was displayed earlier.

## Scope
- Create available slots
- View schedule
- Edit/remove slots
- Block dates
- Mark slots unavailable
- Prevent double booking

## Schedule Data
Recommended fields:
- `id`
- `date`
- `startTime`
- `endTime`
- `isAvailable`
- `createdAt`
- `updatedAt`

Depending on implementation, blocked dates can be represented by a separate model or by schedule rules. Keep the model simple.

## Customer Flow
```text
Available Slots
  ↓
Select Date
  ↓
Server returns available slots
  ↓
Select Time
  ↓
Booking submission
  ↓
Server checks slot again
  ↓
Booking created
```

## Double-booking Protection
A slot must be checked again on the server when creating a booking.

The system should protect against:
- Two customers selecting the same slot
- Stale browser data
- Multiple submit clicks
- Concurrent requests

Use database constraints/transactions where appropriate.

## Admin Flow
```text
Admin Schedule
  ↓
Select Date
  ↓
Create / Edit / Block Slot
  ↓
Save
  ↓
Public availability updates
```

## Rules
- Past slots cannot be booked.
- Cancelled bookings may release a slot depending on business rules.
- Pending payment slots need a clearly defined reservation policy.
- The same slot must not be assigned to multiple confirmed bookings.
- Timezone must be consistent with the studio's operating timezone.

## Pending Payment
Pending appointments reserve their slot immediately and remain reserved until the appointment record is removed. Cancelled appointment records also continue to occupy their slot; cancellation does not automatically release availability. This matches the current booking repository, which treats any appointment attached to a slot as occupied. No payment timeout is implemented.

Schedule dates and times use the studio timezone, `Asia/Bangkok`. Admin slot changes reject past dates and overlapping time ranges. Full-day blocks hide all slots from public availability and are checked again during reservation.

## Testing Checklist
- [ ] Admin can create a slot
- [ ] Admin can block a date/slot
- [ ] Public user sees available slots only
- [ ] Past slots cannot be selected
- [ ] Server rechecks availability
- [ ] Concurrent booking attempts are handled
- [ ] Cancel/release behavior works as documented

## Definition of Done
- Admin controls availability.
- Public availability reflects the server state.
- Double booking is prevented.
- Timezone and pending-payment behavior are explicitly defined.
## Figma Reference — Available Slots

The second supplied Figma screenshot shows the Available Slots / Appointment area.

The key visual relationship is:

```text
┌──────────────────────┬─────────────────────────────┐
│                      │ Let's make an appointment   │
│      Calendar        │ Date        Time            │
│                      │ Full Name    Email          │
│                      │ Service / selection         │
│                      │                             │
│                      │ Cancel          Confirm     │
└──────────────────────┴─────────────────────────────┘
```

### Calendar

The calendar should:
- Show the current month
- Provide previous/next month controls
- Clearly indicate the selected date
- Visually distinguish unavailable dates
- Prevent selection of unavailable/past dates
- Keep the visual treatment minimal

The screenshot uses a compact calendar rather than a full-width calendar application.

### Selected Date

Once a date is selected:
- Available times should be loaded from the server.
- The selected date should remain visible in the booking form.
- The customer should not need to leave the page.

### Availability Source

The browser must request availability from the server.

```text
Calendar date
    ↓
GET/check available slots
    ↓
Display available times
    ↓
Customer selects time
    ↓
Booking submission
    ↓
Server checks availability again
```

### Location of the Booking UI

The booking interface should remain within the same one-page experience.

Do not navigate the customer to a separate public `/booking` page unless the product requirements change.

### Responsive Behavior

Desktop:
- Calendar and booking form can sit side-by-side.

Mobile:
- Calendar should appear first.
- Time selection/form should follow below.
- The flow should remain visually simple and easy to scan.

## Figma Fidelity Rule

Do not turn the availability section into a generic scheduling SaaS interface. The calendar is a focused interaction inside a tattoo portfolio website.
