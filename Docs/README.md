# UpKeep LMS Prototype

This project builds **UpKeep LMS** — a compliance-focused learning management system integrated with EHS and CMMS.

It's designed as an **AI-first, modular web app** starting with:
- **Phase I:** Compliance Tracker MVP (training records, reminders, dashboards)
- **Phase II:** Course Management + AI Authoring (content creation, quizzes, certifications)

## Current Status: Phase I - Epic 1 Complete ✅

**Epic 1: App Shell + Permissions** has been implemented with:
- Next.js 14 + TypeScript + Tailwind CSS
- Role-based navigation (Admin, Manager, Learner)
- Permission enforcement with route guards
- Dynamic brand theming
- Seed data with 9 users, 2 sites, 6 departments
- All placeholder pages and components ready for Epic 2

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

Default role: **Admin** (Sarah Admin)

## Documentation

- `/Docs/UPKEEP_LMS_PLAN.md` → Product plan and features
- `/Docs/CURSOR_BRIEFING_ADDENDUM.md` → Implementation conventions and build rules
- `/EPIC1_TESTING.md` → Epic 1 acceptance criteria and testing guide

## Demo Path

1. **Switch Roles**: Use the dropdown in the top-right header to switch between Admin, Manager, and Learner roles
2. **Test Navigation**: Observe how the sidebar changes based on role permissions
3. **Brand Settings**: Go to Settings → Brand as Admin, change the primary color, and see the theme update in real-time
4. **Permission Guards**: Try accessing admin routes as a Learner to see the "Access Denied" page

Goal: Deliver a usable prototype showing Admin, Manager, and Learner experiences — powered by mocked data and AI-driven UX touches.
