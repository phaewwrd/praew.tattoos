# F05 — Payment

## Status

```text
TODO
```

## Goal

Allow customers to pay the required tattoo booking deposit using a supported payment method.

Primary provider:

```text
Stripe
```

Potential payment methods:

* Credit Card
* Debit Card
* PromptPay where available

---

# 1. Payment Flow

```text
Booking Created
      ↓
PENDING_PAYMENT
      ↓
Create Stripe Payment
      ↓
Customer Pays
      ↓
Stripe
      ↓
Webhook
      ↓
Verify Webhook
      ↓
Payment = PAID
      ↓
Booking = CONFIRMED
```

---

# 2. Important Rule

The frontend must NOT decide whether a payment was successful.

Incorrect:

```text
Frontend
↓
Payment Success
↓
Booking = CONFIRMED
```

Correct:

```text
Stripe
↓
Webhook
↓
Server Verification
↓
Database Update
↓
Booking = CONFIRMED
```

---

# 3. Payment Status

```text
PENDING
PAID
FAILED
REFUNDED
```

---

# 4. Payment Data

Example:

```text
Payment
- id
- bookingId
- amount
- currency
- status
- provider
- providerPaymentId
- paidAt
- createdAt
- updatedAt
```

Never store:

* Card number
* CVV
* Card PIN
* Raw card information

---

# 5. Security

Required:

* Stripe secret key only on server
* Verify webhook signature
* Use HTTPS in production
* Validate payment amount
* Prevent duplicate payment processing
* Use idempotent webhook handling

---

# 6. Environment Variables

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Secret values must never be committed to Git.

---

# 7. Webhook

Webhook endpoint:

```text
/api/webhooks/stripe
```

Responsibilities:

1. Receive Stripe event
2. Verify Stripe signature
3. Identify payment
4. Check whether event was already processed
5. Update Payment
6. Update Booking
7. Trigger confirmation email

---

# 8. Booking Integration

Payment feature depends on:

```text
F04 Booking
```

After successful payment:

```text
Payment = PAID
Booking = CONFIRMED
```

Do not duplicate booking creation logic here.

---

# 9. Email Integration

After payment is confirmed:

```text
Payment
   ↓
Booking Confirmed
   ↓
F06 Email Notification
```

Email implementation belongs to F06.

---

# 10. Testing Checklist

* [ ] Payment session created
* [ ] Correct amount sent
* [ ] Failed payment handled
* [ ] Successful payment handled
* [ ] Webhook signature verified
* [ ] Duplicate webhook handled
* [ ] Payment status updated
* [ ] Booking status updated
* [ ] Secret keys not exposed
* [ ] Raw card information never stored

---

# 11. Definition of Done

* [ ] Stripe integration complete
* [ ] Payment flow complete
* [ ] Webhook complete
* [ ] Database update complete
* [ ] Error handling complete
* [ ] Security checked
* [ ] Test payment completed
* [ ] Documentation updated
