# Smart Campus Room Availability Checker

A web app for checking whether campus study rooms are available for booking.

## Features

- Browse a catalog of 4 fictional campus rooms, each with its own capacity, equipment list, blocked status and bookings
- Filter the catalog by minimum attendees (capacity) and required equipment (must have ALL selected items)
- Clear empty state when no room satisfies the current filters
- Set a candidate booking time interval
- Check availability against the selected room's own bookings
- Visual day timeline showing booked slots and your candidate slot
- Validation for time conflicts, 120-minute max duration, blocked rooms, and past-time bookings

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Vitest + React Testing Library (unit + integration tests)

## Setup

```bash
npm install
```

## Run

```bash
npm run dev       # dev server at http://localhost:5173
npm run build     # production build
npm run preview   # preview the production build
```

## Test

```bash
npm test          # vitest run (35 tests)
npm run typecheck # tsc --noEmit
npm run lint      # eslint
npm run audit:prod # dependency vulnerability check for runtime packages
```

## Project structure

```
src/
  lib/
    types.ts         Room/Booking/Filters types + constants (MAX_DURATION, MINUTE_MAX)
    sampleData.ts     Fictional room catalog (4 rooms) + equipment options
    availability.ts   checkAvailability rules (AC1-AC6) — unchanged behavior
    filtering.ts      Room catalog filtering (F1 capacity, F2 equipment)
    time.ts           Time parsing/formatting (formatTime, timeToMinutes, defaults)
  components/
    RoomCard.tsx       Single room summary card
    RoomFilters.tsx     Attendee/equipment filter controls
    EmptyState.tsx      F4 empty-state message
    Timeline.tsx        Day timeline visualization
    RoomBookings.tsx    List of a room's existing bookings
    ResultBanner.tsx     Availability check result
  App.tsx             Orchestration: state + wiring only
```
