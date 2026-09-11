# BayesStack Wireframes ("Screens as Code")

This directory contains code-based UI wireframes structured as Next.js applications for **Learner**, **Faculty**, and **Admin** portals.

## Philosophy & Guiding Principle
> **"Optimize for speed of visual iteration, not maintainability."**

These wireframes utilize the shared UI component library `@bayesstack/ui` to quickly model dynamic, interactive UI mockups directly as code.

---

## Wireframe Applications

1. **Learner App Wireframes** (`docs/wireframes/learner/`)
2. **Faculty App Wireframes** (`docs/wireframes/faculty/`)
3. **Admin App Wireframes** (`docs/wireframes/admin/`)

---

## How to View Wireframes in Browser

Run any of the following commands from the project root:

### 1. Learner Wireframe App
```bash
pnpm dev:wireframe:learner
```
Open **`http://localhost:3010`**

### 2. Faculty Wireframe App
```bash
pnpm dev:wireframe:faculty
```
Open **`http://localhost:3011`**

### 3. Admin Wireframe App
```bash
pnpm dev:wireframe:admin
```
Open **`http://localhost:3012`**

---

## Technical Setup
Import components directly from `@bayesstack/ui` in your `app/page.tsx` files for rapid prototyping.
