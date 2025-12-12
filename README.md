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

text

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
Bash

git clone https://github.com/YOUR-ORG/horebpay-dashboard.git
cd horebpay-dashboard
npm install
2. Run Development Server
Bash

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
