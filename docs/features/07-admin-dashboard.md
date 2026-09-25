# F07 — Admin Dashboard

## Goal
Provide a protected internal dashboard for managing bookings, clients, schedules, services, payments, portfolio content, and contact messages.

## Architecture
The admin dashboard remains inside the same Next.js application.

```text
Public
/

Admin
/admin
/admin/bookings
/admin/clients
/admin/services
/admin/schedule
/admin/payments
/admin/portfolio
/admin/messages
```

Do not create a separate backend server unless a future requirement clearly justifies it.

## Authentication
- Admin authentication is required.
- Use Better Auth or the project's chosen auth system.
- Admin authorization must be enforced server-side.
- Never rely only on hidden UI links for access control.

## Dashboard Overview
Show useful operational information such as:
- Upcoming appointments
- Today's appointments
- Pending payments
- Recent bookings
- Recent contact messages
- Booking status summary

Do not overload the dashboard with unnecessary analytics.

## Booking Management
Admin should be able to:
- View bookings
- Search/filter bookings
- Open booking details
- View customer information
- View service/date/time
- View payment status
- Update permitted booking statuses
- Cancel bookings when appropriate

Confirmed booking history should not be hard-deleted.

## Security
- Protect `/admin` and nested routes.
- Check authorization on server actions/route handlers.
- Validate all admin input.
- Do not expose secrets to client components.
- Do not expose internal errors or stack traces.

## UI
Admin UI can be application-like and does not need to follow the public tattoo portfolio aesthetic.

Recommended:
- Sidebar/navigation
- Tables
- Detail panels
- Filters
- Status badges
- Confirmation dialogs for destructive actions

## Testing Checklist
- [ ] Unauthenticated user cannot access admin
- [ ] Non-admin user cannot access admin
- [ ] Admin can view dashboard
- [ ] Booking list works
- [ ] Booking detail works
- [ ] Server-side authorization works
- [ ] Errors are handled safely

## Definition of Done
- Protected admin area exists.
- Core operational information is visible.
- Authorization is enforced server-side.
- Admin can safely access booking information without affecting public UX.
## Relationship to the Public Figma

The Figma screenshots describe the **customer-facing public page**.

The admin dashboard does not need to visually reproduce this layout.

Use the Figma visual direction as a brand reference only:
- typography
- spacing
- neutral palette
- minimal visual language

The admin can use a practical application layout with navigation, tables, filters, and forms.

## Public/Admin Separation

```text
Public one-page website
        │
        ├── Gallery
        ├── Location
        ├── Available Slots
        └── Contact
        │
        ▼
     Same Next.js App
        │
        └── /admin
              ├── bookings
              ├── clients
              ├── schedule
              ├── services
              ├── payments
              └── portfolio
```

Do not expose admin controls or management UI inside the public Figma layout.
