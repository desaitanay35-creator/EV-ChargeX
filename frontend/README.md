# EV-ChargeX (React)

React + Vite conversion of the EV-ChargeX product, preserving the original layout,
navigation, color palette, and page hierarchy. Maps use Leaflet + OpenStreetMap
(no Google Maps dependency).

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your Django backend
npm run dev
```

Runs at http://localhost:5173. Every API call gracefully falls back to bundled
dummy JSON data (`src/data/*.json`) when the Django backend isn't reachable, so
the whole app is fully demoable standalone.

## Folder structure

```
src/
├── components/
│   ├── layout/        Sidebar, Header, AppLayout (page shell)
│   ├── map/            StationsMap (Leaflet), StationPopup, StationFilters, mapIcons
│   └── common/          StatCard and other shared UI primitives
├── pages/               One component per route (Dashboard, StationsPage, etc.)
├── services/            axios API clients — one file per backend resource
├── context/              AuthContext (login state), UserDataContext (dashboard/notifications)
├── hooks/                useGeolocation, etc.
├── routes/               AppRoutes.jsx (route table), ProtectedRoute.jsx
├── data/                 Dummy JSON used as API fallback/demo data
├── styles/               theme.css — global CSS variables (colors, spacing, radii)
├── App.jsx
└── main.jsx
```

## Pages implemented

| Page                    | Route                     | File                                   |
|-------------------------|----------------------------|-----------------------------------------|
| Home / landing          | `/`                         | `pages/HomePage.jsx`                    |
| Login / Register        | `/login`                    | `pages/LoginPage.jsx`                   |
| Dashboard               | `/dashboard`                 | `pages/Dashboard.jsx`                   |
| Charging Stations (map) | `/stations`                  | `pages/StationsPage.jsx`                |
| Station Details          | `/stations/:id`              | `pages/StationDetailsPage.jsx`          |
| Booking                  | `/stations/:id/book`         | `pages/BookingPage.jsx`                 |
| My Vehicles              | `/vehicles`                  | `pages/VehiclesPage.jsx`                |
| Route Planner            | `/route-planner`             | `pages/RoutePlannerPage.jsx`            |
| Payments & Invoices      | `/payments`                  | `pages/PaymentsPage.jsx`                |
| Notifications            | `/notifications`             | `pages/NotificationsPage.jsx`           |
| Reports                  | `/reports`                   | `pages/ReportsPage.jsx`                 |

## Backend endpoints expected (Django REST)

```
GET  /api/stations/
GET  /api/stations/:id
POST /api/bookings/
GET  /api/user/dashboard/
GET  /api/user/vehicles/
POST /api/user/vehicles/
GET  /api/user/notifications/
GET  /api/user/reports/
POST /api/auth/login/
POST /api/auth/register/
```

Each is wired in `src/services/*.js`. Swap the fallback logic for real error
handling once your Django API is live — the fallback branches are clearly
commented (`console.warn('[...] Falling back to...')`) so they're easy to find
and remove.

## Map (Leaflet + OpenStreetMap)

`src/components/map/StationsMap.jsx` renders an OpenStreetMap tile layer via
`react-leaflet`, with:
- Custom SVG divIcon markers (no broken default-icon asset paths after bundling)
- Marker popups showing name, charger type, available slots, pricing, and a
  **Book Now** button (`StationPopup.jsx`)
- Bottom-right zoom controls
- A blue dot marker for the user's current location (`useGeolocation` hook,
  wired to the **Use my location** button on the Stations page)
- Filtering by availability, charger type (fast/normal), and max price
  (`StationFilters.jsx`)
