# Contributing to Feastify

Thank you for contributing to Feastify.

This document defines the development workflow and coding standards for all contributors. Please follow these guidelines to keep the project consistent and avoid merge conflicts.

---

# Project Architecture

The common workflow has already been completed.

The following should NOT be restructured unless the entire team agrees.

Frontend

- Authentication
- Routing
- Protected Routes
- Layout
- Navbar
- Footer
- API Service

Backend

- MVC Structure
- Authentication
- JWT
- Database Configuration

Only extend the project.

Do not redesign the architecture.

---

# Git Workflow

Never work directly on the `main` branch.

Always create your own branch.

Example

```bash
git checkout -b feature/payment
```

or

```bash
git checkout -b feature/bookings
```

Good branch names

```
feature/payment
feature/bookings
feature/customer-feed
feature/seller-dashboard
feature/reviews
```

Avoid names like

```
new
temp
final
testing
```

---

# Before Starting Work

Always pull the latest changes.

```bash
git checkout main

git pull origin main
```

Then create your feature branch.

---

# Commit Messages

Write meaningful commit messages.

Good

```
Add customer booking page

Implement payment gateway integration

Create seller booking controller

Fix login validation
```

Bad

```
update

fixed

new

done

final
```

---

# Pull Requests

Before creating a Pull Request:

- Ensure the project runs successfully.
- Resolve merge conflicts.
- Remove debugging code.
- Test your feature.

Every Pull Request should include

- What was added
- What files changed
- Screenshots (if UI changes)
- Any known limitations

---

# Frontend Guidelines

Use

- React Functional Components
- React Hooks
- Bootstrap
- Axios through `services/api.js`

Do NOT

- Hardcode backend URLs
- Duplicate components
- Store sensitive information in localStorage (except JWT currently used by the project)

---

# Backend Guidelines

Follow MVC.

Routes

Only define endpoints.

Controllers

Contain business logic.

Models

Interact with MongoDB.

Do not place business logic inside routes.

---

# File Organization

New pages

```
src/pages/
```

Reusable components

```
src/components/
```

API calls

```
src/services/
```

Backend controllers

```
backend/controllers/
```

Backend routes

```
backend/routes/
```

Backend models

```
backend/models/
```

---

# Naming Convention

Components

```
CustomerDashboard.jsx

BookingCard.jsx

PaymentHistory.jsx
```

Variables

```
customerName

bookingDate

paymentStatus
```

Functions

```
createBooking()

calculateTotal()

handleSubmit()
```

---

# Styling

Current Theme

Primary

```
#FF7034
```

Use Bootstrap whenever possible.

Avoid inline styles unless necessary.

Create reusable CSS classes instead of repeating styles.

---

# Authentication

Authentication is already implemented.

Reuse

- JWT
- ProtectedRoute
- API interceptor

Do not create another authentication system.

---

# User Roles

Current Roles

```
customer

seller
```

Always check user roles before rendering role-specific pages or features.

---

# Future Features

Examples

- Payment Module
- Booking System
- Caterer Listings
- Customer Requests
- Reviews
- Notifications
- Search & Filters

Implement these inside your own feature branch.

---

# Code Quality

Before pushing code

- Remove unused imports.
- Remove console.log() statements.
- Remove commented-out code.
- Format code consistently.
- Ensure there are no build errors.

---

# Testing Checklist

Frontend

- Responsive layout
- Navigation works
- Forms validate correctly
- API requests succeed

Backend

- Routes tested
- Controllers return correct responses
- Database operations succeed
- Proper error handling

---

# Communication

If a feature requires changing an existing shared component, discuss it with the team before making the change.

Avoid changing common files unless absolutely necessary.

---

# AI Assistance

Contributors may use AI coding assistants.

When using AI:

- Keep the existing architecture.
- Follow the MVC pattern.
- Do not regenerate unrelated files.
- Keep changes limited to the assigned feature.
- Review generated code before committing.

AI should assist development, not replace code review.

---

Happy Coding!