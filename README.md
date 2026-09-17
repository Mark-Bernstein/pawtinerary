# Pawtinerary

A mobile-first work planner for a solo dog walker. Manage dog and client details, schedule individual services, mark visits complete, track Euro earnings, and export local reports.

## Run locally

```bash
npm install
npm run dev
```

Open the local address printed by Vite. To verify a production build and the data tests:

```bash
npm run build
npm test
```

For a browser smoke test, start the development server in one terminal and run `npm run test:e2e` in another. It uses an installed Google Chrome browser.

## Technology and structure

React, TypeScript, Vite, styled-components, React Router, date-fns, docx, and Vitest. The app has no backend or account system.

- `src/pages`: Schedule, Dogs, dog profile and form, and Earnings screens.
- `src/components`: service controls, dialogs, calculator, report export, and reusable cards.
- `src/context/AppContext.tsx`: domain actions and app state.
- `src/storage/data.ts`: versioned browser storage parsing and writing.
- `src/utils`: date, currency, earnings, and report logic.

## Data and calculations

The browser stores `{ version: 1, dogs, services }` under `pawtinerary.data.v1` in `localStorage`. Changes persist automatically after add, edit, completion, cancellation, or deletion. The schedule view selection uses `sessionStorage`.

Each service belongs to one dog, date, and group, with duration in minutes. Scheduled services count toward **potential** earnings. Completed services count toward **earned** earnings. Cancelled services count toward neither. On completion, the dog's hourly rate is copied to the service, keeping historical earned amounts stable when the dog's rate changes. Scheduled services use the current rate. Deleting a dog also deletes every associated service.

## Reports

Send Data creates a DOCX file in the browser for a selected day, week, month, or lifetime. It also offers plain text copy and file sharing when the device supports the Web Share API. Reports include dogs, client names when available, services, amounts, and totals. Entry and access instructions are never included. No email is sent by the app.

## MVP limits and backend migration

**Everything is stored locally in this browser. Clearing browser data removes all Pawtinerary records.** Data does not sync between devices, and there is no backup or login. Browser storage can also be disabled or exhausted.

For a future backend, keep the Dog and Service contracts, replace the storage adapter behind the app context with API calls, add account ownership and server validation, and plan a one-time import from the versioned local data. Add server-side backups before relying on it across devices.
