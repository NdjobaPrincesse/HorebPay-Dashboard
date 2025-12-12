HorebPay Admin Dashboard
Welcome to the HorebPay Financial Dashboard.
This project is built with React, TypeScript, Vite, and Tailwind CSS.

⚠️ ATTENTION Princesse :
Before writing a single line of code, read this document carefully.
We follow a strict Modular Architecture. Do not put logic in UI components. Do not put UI in Page files.
Understand the Data Flow before making changes.

src
├── api                 <-- 🧠 THE BRAIN (All external communication)
│   ├── auth.ts         <-- Login/Logout logic & Token management
│   └── axios.ts        <-- HTTP Client (Handles Proxy & Headers automatically)
│
├── components          <-- 🎨 THE UI (Dumb Components)
│   ├── dashboard       <-- Widgets specific to Dashboard Views
│   │   ├── ClientTable.tsx      <-- Pure UI for the client list
│   │   └── TransactionList.tsx  <-- Pure UI for transaction history
│   ├── layout          <-- Sidebar & Navigation elements
│   ├── ui              <-- Reusable atoms (Buttons, Inputs)
│   ├── Layout.tsx      <-- The "Shell" (Sidebar + Main Content Wrapper)
│   └── StatCard.tsx    <-- Metric Cards (supports Privacy Mode)
│
├── pages               <-- ⚙️ THE LOGIC (State & Data Fetching)
│   ├── ClientsPage.tsx      <-- Management Logic
│   ├── DashboardPage.tsx    <-- Overview Logic
│   ├── LoginPage.tsx        <-- Auth Logic
│   └── TransactionsPage.tsx <-- Financial Logic
│
├── types               <-- 🛡️ TYPESCRIPT DEFINITIONS
│   └── index.ts        <-- Central interfaces (ClientRow, Transaction)
│
├── App.tsx             <-- 🚦 ROUTING & AUTH GUARDS
└── main.tsx            <-- 🚪 ENTRY POINT


   How the App Works (Data Flow)
1. The Entry Point
src/main.tsx: This is where React mounts to the DOM.
src/App.tsx: This is the Router. It handles:
Public Routes: /login
Protected Routes: /dashboard, /clients, etc.
Guards: It checks isAuthenticated() before letting users see the dashboard.

2. The Logic Layer (src/pages/)
ALL data fetching (fetch), state management (useState), and calculations (reduce/filter) happen inside Pages.

Example: TransactionsPage.tsx fetches the data, calculates the "Total Revenue", and passes the clean numbers down to the UI components.

3. The UI Layer (src/components/)
Components are "dumb". They receive data via props and render it.

Rule: Never write a fetch call inside a component in src/components/.
Rule: Components should not know about API URLs.

4. The API Layer (src/api/)
We use a Vite Proxy to avoid CORS errors when talking to the Production API.

axios.ts: Automatically attaches the Auth Token to requests.
auth.ts: Handles Login and Logout (clearing LocalStorage).

5. install dependencies : npm i

6. npm run dev

Hope it helps 
Happy Coding!
