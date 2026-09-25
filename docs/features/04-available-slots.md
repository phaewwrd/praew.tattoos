# F04 — Booking

## Status

```text
TODO
```

## Goal

Allow customers to book a tattoo appointment by selecting a service, date, time, and providing their contact and tattoo information.

---

# 1. User Flow

```text
View Service
    ↓
Select Date
    ↓
Select Time
    ↓
Check Availability
    ↓
Booking Form
    ↓
Review Booking
    ↓
Confirm
    ↓
Payment
```

---

# 2. Customer Flow

Customer should be able to:

* Select tattoo service
* Select available date
* Select available time
* Enter personal information
* Enter tattoo information
* Review booking details
* Submit booking
* Continue to payment

---

# 3. Booking Form

## Customer Information

* Full Name
* Email
* Phone Number

## Tattoo Information

* Tattoo description
* Tattoo placement
* Approximate size
* Additional notes
* Reference image (optional)

## Appointment

* Service
* Date
* Time

---

# 4. Validation

Required:

```text
Full Name
Email
Phone
Service
Date
Time
Tattoo Description
```

Email must be valid.

Date must not be in the past.

Selected time must be available.

---

# 5. Booking Status

```text
PENDING_PAYMENT
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW
```

New booking:

```text
PENDING_PAYMENT
```

After successful verified payment:

```text
CONFIRMED
```

---

# 6. Availability

Before creating a booking:

```text
Customer selects time
        ↓
Server checks database
        ↓
Available?
   ┌────┴────┐
  Yes        No
   ↓          ↓
Continue    Show error
```

The server/database is the source of truth.

Frontend availability must not be trusted by itself.

---

# 7. Database

Expected relationship:

```text
Client
   │
   └──< Booking >── Service
            │
            └── Payment
```

Example fields:

```text
Booking
- id
- clientId
- serviceId
- appointmentDate
- appointmentTime
- tattooDescription
- tattooPlacement
- tattooSize
- notes
- status
- depositAmount
- createdAt
- updatedAt
```

Do not add fields unless there is a business requirement.

---

# 8. Server Logic

Booking creation must happen server-side.

The server should:

1. Validate input
2. Verify service
3. Verify date
4. Verify time availability
5. Prevent duplicate booking
6. Create booking
7. Set status to `PENDING_PAYMENT`
8. Return payment information

---

# 9. Payment Integration

Payment is handled by Feature F05.

This feature should NOT duplicate Stripe logic.

Booking should only initiate the payment flow.

```text
Booking
   ↓
PENDING_PAYMENT
   ↓
F05 Payment
```

---

# 10. Error Cases

Handle:

* Invalid form
* Service not found
* Date unavailable
* Time unavailable
* Duplicate booking
* Database error
* Payment initialization failure

---

# 11. UI Requirements

The booking page should:

* Clearly show selected service
* Clearly show date/time
* Show deposit amount
* Show customer information form
* Show validation errors
* Prevent duplicate submission
* Work on mobile
* Show loading state

---

# 12. Testing Checklist

### Form

* [ ] Required fields validated
* [ ] Invalid email rejected
* [ ] Invalid phone rejected
* [ ] Past date rejected
* [ ] Missing service rejected

### Availability

* [ ] Available slot can be selected
* [ ] Unavailable slot cannot be booked
* [ ] Concurrent booking is handled

### Database

* [ ] Booking created correctly
* [ ] Correct client linked
* [ ] Correct service linked
* [ ] Status is `PENDING_PAYMENT`

### UI

* [ ] Mobile layout works
* [ ] Loading state works
* [ ] Error state works
* [ ] Success state works

---

# 13. Definition of Done

* [ ] Booking UI complete
* [ ] Booking validation complete
* [ ] Availability check complete
* [ ] Server-side booking creation complete
* [ ] Database relationship complete
* [ ] Error handling complete
* [ ] Tests complete
* [ ] Existing features checked
* [ ] Documentation updated

---

# 14. Implementation Notes

Keep this feature independent from:

* Payment implementation
* Email implementation
* Admin dashboard implementation

These will be implemented in separate features.

When modifying this feature, do not modify unrelated features unless required by the integration.
