# Praew Tattoos — Project

## 1. Project Overview

**Project:** Praew Tattoos
**Website:** `praew.tattoos`
**Type:** Tattoo Artist Portfolio & Appointment Booking Website
one single page website seperate between tattoo website and admin management website

The website provides:

* Tattoo artist portfolio
* Tattoo services
* Appointment booking
* Deposit payment
* Customer management
* Contact messages
* Email notifications
* Admin dashboard

---

## 2. Development Approach

This project is developed incrementally by:

* Human developer
* AI coding assistant

Development must be **feature-based**.

Each feature should be:

1. Planned
2. Implemented
3. Tested
4. Reviewed
5. Completed
6. Committed

Do not implement multiple unrelated features at the same time.

---

## 3. Architecture

Use a single Next.js full-stack application.

```text
Next.js
├── Public Website
├── Booking
├── Admin Dashboard
├── Server Actions / Route Handlers
├── Authentication
└── Webhooks

        ↓

PostgreSQL
```

Do NOT create a separate backend server unless there is a clear technical requirement.

---

## 4. Technology

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Hook Form
* Zod

### Backend

* Next.js Server Actions
* Next.js Route Handlers

### Database

* PostgreSQL
* Prisma or Drizzle

### Authentication

* Better Auth

### Payment

* Stripe

### Email

* Resend

### Image Storage

* Cloudinary

### Deployment

* Vercel
* Neon PostgreSQL

---

## 5. Core Business Flow

```text
Portfolio
    ↓
Service
    ↓
Schedule
    ↓
Booking
    ↓
Booking Form
    ↓
Deposit Payment
    ↓
Payment Verification
    ↓
Booking Confirmation
    ↓
Email Notification
    ↓
Admin Management
```

---

## 6. Main Features

| ID  | Feature             | Status |
| --- | ------------------- | ------ |
| F01 | Public Website      | DONE   |
| F02 | Portfolio           | DONE   |
| F03 | Tattoo Services     | TODO   |
| F04 | Booking             | TODO   |
| F05 | Payment             | TODO   |
| F06 | Email Notification  | TODO   |
| F07 | Admin Dashboard     | TODO   |
| F08 | Client Management   | TODO   |
| F09 | Schedule Management | TODO   |
| F10 | Contact Message     | TODO   |

Status values:

```text
TODO
IN_PROGRESS
TESTING
DONE
BLOCKED
```

---

## 7. AI Development Rules

Before changing code:

1. Read this file.
2. Read the relevant feature document.
3. Inspect the current implementation.
4. Check existing components and utilities.
5. Check database schema if relevant.
6. Do not rewrite unrelated code.

During implementation:

* Reuse existing code where possible.
* Avoid unnecessary dependencies.
* Keep changes focused on the current feature.
* Do not modify unrelated features.
* Keep business logic on the server.
* Validate user input.
* Follow existing project conventions.

After implementation:

* Run TypeScript checks.
* Run lint/format.
* Test the feature.
* Check affected existing features.
* Update the feature document status.

---

## 8. Security

Never:

* Expose secret keys
* Store raw card information
* Trust client-side authorization
* Trust client-side payment status
* Expose database credentials

Always:

* Validate server-side input
* Verify authentication
* Verify authorization
* Verify payment webhooks
* Use environment variables for secrets

---

## 9. Development Principle

Prefer simple architecture.

```text
One Next.js App
+
One PostgreSQL Database
+
Stripe
+
Resend
+
Cloudinary
```

Do not introduce microservices, separate backend servers, Redis, queues, or complex infrastructure unless the project actually requires them.

---

## 10. Feature Completion

A feature is complete when:

* [ ] UI implemented
* [ ] Server logic implemented
* [ ] Database implemented if required
* [ ] Validation implemented
* [ ] Error handling implemented
* [ ] Loading states implemented
* [ ] Authentication/authorization checked
* [ ] Responsive behavior checked
* [ ] TypeScript passes
* [ ] Lint/format passes
* [ ] Existing features still work
* [ ] Documentation updated
* [ ] Git commit created
