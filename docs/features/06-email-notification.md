# F06 — Email Notification

## Status

```text
TODO
```

## Goal

Send an automatic confirmation email after a booking's deposit payment has been successfully verified.

Email provider:

```text
Resend
```

---

# 1. Trigger

Email should NOT be triggered simply because the customer submits the booking form.

Correct trigger:

```text
Stripe Payment
      ↓
Webhook
      ↓
Payment Verified
      ↓
Payment = PAID
      ↓
Booking = CONFIRMED
      ↓
Send Confirmation Email
```

---

# 2. Confirmation Email

Recipient:

```text
Customer email
```

Subject:

```text
Booking Confirmation — Praew Tattoos
```

Content:

* Customer name
* Booking ID
* Tattoo service
* Appointment date
* Appointment time
* Deposit paid
* Remaining balance
* Studio information
* Contact information
* Cancellation policy

---

# 3. Email Failure

If email fails:

```text
Payment = PAID
Booking = CONFIRMED
Email = FAILED
```

Do NOT change the payment back to failed because the email failed.

Payment and email are separate concerns.

---

# 4. Prevent Duplicate Emails

The system should avoid sending multiple confirmation emails for the same booking.

Possible field:

```text
confirmationEmailSentAt
```

or an email notification log.

---

# 5. Security

Email sending must happen server-side.

Do not expose:

```text
RESEND_API_KEY
```

to the browser.

---

# 6. Testing

* [ ] Email sent after successful payment
* [ ] Email not sent before payment
* [ ] Correct recipient
* [ ] Correct booking information
* [ ] Failed email handled
* [ ] Duplicate email prevented
* [ ] Email template responsive

---

# 7. Definition of Done

* [ ] Resend configured
* [ ] Email template created
* [ ] Payment integration connected
* [ ] Email failure handled
* [ ] Duplicate sending prevented
* [ ] Test email verified
* [ ] Documentation updated
