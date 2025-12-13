 HorebPay Admin Dashboard
React
TypeScript
TailwindCSS
Vite

The official internal dashboard for HorebPay Financial Operations.
Designed for scalability, security, and real-time financial monitoring.

⚠️ ATTENTION PRINCESSE 
READ BEFORE CODING:
This project follows a Senior/Modular Architecture. We have moved away from monolithic components.
Please review the Project Structure and Developer Rules below before making changes.

🏗️ Project Structure
We strictly separate Logic (State, API, Calculations) from UI (Visuals, Tables, Cards).

src
├── api                 <-- 🧠 THE BRAIN (Network Layer)
│   ├── auth.ts         <-- Login/Logout logic & Token management
│   └── axios.ts        <-- Axios instance (Auto-injects Bearer Token)
│
├── components          <-- 🎨 THE UI (Pure/Dumb Components)
│   ├── dashboard       <-- Widgets specific to Dashboard views
│   │   ├── ClientTable.tsx
│   │   └── TransactionList.tsx
│   ├── layout          <-- Sidebar, Header, and Shell wrappers
│   └── ui              <-- Reusable atoms (Buttons, Inputs)
│
├── pages               <-- ⚙️ THE LOGIC (Smart Components)
│   ├── DashboardPage.tsx    <-- Overview Logic
│   ├── ClientsPage.tsx      <-- Client Management Logic
│   ├── TransactionsPage.tsx <-- Financial Logic
│   └── LoginPage.tsx        <-- Auth Logic
│
├── types               <-- 🛡️ TYPESCRIPT DEFINITIONS
│   └── index.ts        <-- Central interfaces (ClientRow, Transaction)
│
├── App.tsx             <-- 🚦 ROUTING & AUTH GUARDS
└── main.tsx            <-- 🚪 ENTRY POINT

🚀 Getting Started
1. Clone & Install

git clone https://github.com/YOUR-ORG/horebpay-dashboard.git
cd horebpay-dashboard
npm install

2. Run Development Server

npm run dev

The app will run at http://localhost:5173

3. API & Proxy
This dashboard connects to the Production API via a Vite Proxy to avoid CORS errors.

Local Request: /api/clients
Proxied To: https://prod.horebpay.com/horeb/api/clients
Configuration is located in vite.config.ts.

📐 Architecture Concepts
1. Separation of Concerns
Pages (src/pages): Use useEffect to fetch data. They hold the useState. They pass data down to components via props.
Components (src/components): They never fetch data. They only render what they are given.

2. Authentication Flow
Login is handled in LoginPage.tsx -> calls api/auth.ts.
The Token is stored in localStorage.
App.tsx checks isAuthenticated() before rendering the PrivateLayout.
If the token is missing, the user is redirected to /login.

3. Privacy Mode (The Eye Toggle 👁️)
Financial data is sensitive.

By default, all monetary values and sensitive client info (Names, Phones) are Masked (****).
The user must click the Eye Toggle in the header to reveal actual numbers.

📝 Developer Guidelines
✅ DO
Import Types: Always use import type { ClientRow } from '../types' when importing interfaces.
Use the Layout: Create new routes inside App.tsx wrapped in <Route element={<PrivateLayout />}>.
Handle Nulls: APIs are unpredictable. Always handle null values (e.g., client?.name || 'Unknown').

❌ DO NOT
No Direct Fetching in UI: Do not write fetch() inside ClientTable.tsx. Pass the data as a prop.
No Hardcoded Secrets: Do not commit API Keys or real passwords.
No any: Use TypeScript interfaces defined in src/types/index.ts.

📦 Current Features
 Secure Login (with Token Management)
 Client Directory (Searchable, Filterable)
 Transaction History (Global financial view)
 Receipt Generation (Printable Modal)
 Privacy Mode (One-click data masking)
 Responsive Sidebar (Collapsible on mobile)

---

**Detailed Explanation for Junior Dev "Princesse"**

Princesse,

This is the HorebPay Admin Dashboard, a React-based web app for managing financial operations. It's built with TypeScript for type safety, TailwindCSS for styling, and Vite for fast development. The goal is scalability, security, and real-time monitoring. I'll walk you through the structure, code flow, and key concepts so you understand what's happening at each layer. Pay close attention to the separation of concerns—logic (data fetching, state) stays in pages, while UI (rendering) stays in components. This keeps things modular and maintainable.

### 1. **Overall Project Structure**
The codebase is organized into folders that enforce separation:
- **`src/api/`**: The "brain" (network layer). Handles all API calls, auth, and data fetching. No UI here—just logic for talking to the backend.
  - `auth.ts`: Manages login/logout, token storage in localStorage, and checks if the user is authenticated.
  - `axios.ts`: Sets up an Axios instance that auto-injects the Bearer token into requests.
- **`src/components/`**: Pure UI components. They receive data via props and render it. Never fetch data or manage state directly.
  - `dashboard/`: Widgets for dashboard views (e.g., `ClientTable.tsx` for displaying client lists).
  - `layout/`: Shell components like `Sidebar.tsx` for navigation.
  - `ui/`: Reusable atoms (buttons, inputs).
- **`src/pages/`**: Smart components with logic. They use `useState` and `useEffect` to fetch data, calculate stats, and pass everything down to components as props.
  - `Dashboard.tsx`: Overview logic (stats, charts).
  - `ClientsPage.tsx`: Client management (fetching, filtering).
  - `TransactionsPage.tsx`: Financial history.
  - `LoginPage.tsx`: Auth flow.
- **`src/types/`**: TypeScript definitions. Central place for interfaces like `ClientRow` or `Transaction` to ensure type safety across the app.
- **`App.tsx`**: Routing and auth guards. Uses React Router to handle pages, checks auth before showing private routes, and wraps them in a layout.
- **`main.tsx`**: Entry point. Renders the app into the DOM.

No monolithic files—everything is split to avoid mixing concerns. For example, a page fetches data but doesn't render tables; components render but don't fetch.

### 2. **How the App Flows (Code Execution)**
- **Startup**: `main.tsx` boots the app. `App.tsx` sets up routing with `BrowserRouter`.
- **Auth Check**: Before any private page loads, `PrivateLayout` in `App.tsx` calls `isAuthenticated()` from `api/auth.ts`. If no token, redirect to `/login`. If yes, wrap the page in `Layout` (sidebar, etc.).
- **Page Load**: Take `ClientsPage.tsx` as an example:
  - It initializes state: `clients` array, `loading` flag, `filterText`, etc.
  - `useEffect` runs on mount, calling `fetchClients()` which hits `/api/clients` (proxied via Vite to the real API).
  - Data is mapped to `ClientRow` objects, with privacy masking (e.g., names shown as "J***" by default).
  - Stats are calculated (total clients, active vs. guest).
  - The page renders components like `ClientTable`, passing data as props (e.g., `clients`, `isPrivacyMode`).
- **Component Rendering**: `ClientTable.tsx` is dumb—it filters the `clients` prop based on `filterText`, maps over them to render table rows, and handles clicks (e.g., select a client or print). No API calls here.
- **Privacy Mode**: Controlled by a toggle in the header. When on, sensitive data (names, phones, balances) is masked. The state is passed down from pages to components.
- **API Proxy**: In `vite.config.ts`, `/api` requests are proxied to `https://prod.horebpay.com/horeb/api` to bypass CORS. So, `fetch('/api/clients')` actually hits the production server.

### 3. **Key Architecture Concepts**
- **Separation of Concerns**: Pages handle "what" (data, logic), components handle "how" (rendering). This makes testing and changes easier—edit a component without touching API logic.
- **Authentication Flow**: Login happens in `LoginPage.tsx`, which calls `api/auth.ts` to store the token. `App.tsx` guards routes. If token expires, redirect to login.
- **Privacy Mode**: Financial data is masked by default. Toggle reveals it. Implemented by storing raw vs. display values in data objects (e.g., `_rawClient` vs. `displayClient`).
- **Type Safety**: Everything uses interfaces from `types/index.ts`. No `any`—helps catch bugs early.
- **Responsiveness**: TailwindCSS classes make it mobile-friendly (e.g., collapsible sidebar).

### 4. **Developer Rules to Follow**
- **Do**: Import types properly (`import type { ClientRow } from '../types'`). Handle nulls (e.g., `client?.name || 'Unknown'`). Use the layout for new routes.
- **Don't**: Fetch data in components. Hardcode secrets. Use `any`.

### 5. **Current Features**
- Secure login with token management.
- Client directory (searchable, filterable table).
- Transaction history.
- Printable receipts via modals.
- Privacy toggle.
- Responsive design.

To get started: Run `npm install` then `npm run dev`. The app runs at `http://localhost:5173`. Explore the code by reading a page first (e.g., `ClientsPage.tsx`), then its components. If you change something, test it—pages should fetch, components should render. Let me know if you need help with a specific part!
