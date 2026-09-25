# F08 — Client Management

## Goal
Allow the admin to view customers and their appointment history without requiring customers to create accounts.

## Scope
- Client list
- Client detail
- Booking history
- Search/filter
- Basic customer information

## Client Data
Recommended fields:
- `id`
- `fullName`
- `email`
- `phone`
- `createdAt`
- `updatedAt`

Do not store unnecessary personal information.

## Relationships
```text
Client
  └──< Booking
```

A client can have multiple bookings.

## Client List
Useful columns:
- Name
- Email
- Phone
- Number of bookings
- Latest booking
- Created date

## Client Detail
Show:
- Basic customer information
- Booking history
- Current/upcoming appointment
- Payment-related information only when necessary for operations

## Privacy
- Client information is private admin data.
- Never expose the client list publicly.
- Avoid logging sensitive customer data unnecessarily.
- Do not expose personal data in client-side error messages.

## Booking History
History should distinguish:
- Pending payment
- Confirmed
- Completed
- Cancelled
- No-show

Do not delete historical records simply because a customer is no longer active.

## Testing Checklist
- [ ] Admin-only access
- [ ] Client list loads
- [ ] Client detail loads
- [ ] Booking history is correct
- [ ] Search works
- [ ] No client data leaks to public routes

## Definition of Done
- Admin can find a customer.
- Admin can view the customer's booking history.
- Access is restricted to authorized admin users.
## Relationship to the Figma

Client Management is an internal feature and should not alter the visual simplicity of the public one-page design.

Customer information collected from the public booking/contact forms is managed here.

The public site should only collect information necessary for the booking/contact use case and should not expose client-management controls.
