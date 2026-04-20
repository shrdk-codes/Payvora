

# Payvora
![Alt](https://github.com/shrdk-codes/Payvora/blob/97c2b5dce4e152f1000f72281803cb2ed0ade038/Payvora.png)
A lightweight web app built with **HTML, CSS, and Vanilla JavaScript** using **Firebase (CDN)** for **Authentication** and **Database**.

> **Stack (current):** Vanilla JS + Firebase CDN + Firebase Auth + Firebase Database  
> **Payments:** None (no payment integration)


## Objectives

- Build a clean, beginner-friendly UI (Landing → Login → Dashboard).
- Provide secure sign-in and session handling via Firebase Authentication.
- Store and fetch app data using Firebase Database.
- Keep the stack minimal (no framework) for fast iteration and easy onboarding.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend (BaaS):** Firebase (CDN)
- **Auth:** Firebase Authentication
- **Database:** Firebase Database (Realtime Database or Firestore — depending on your setup)
- **Payments:** Not implemented

## Key Features

- Landing page + basic navigation
- User authentication (sign up / sign in / sign out)
- Dashboard UI
- Database read/write (based on configured Firebase DB)

## Workflow

### 1) Plan
- Sketch screens (Landing → Login → Dashboard)
- Define minimum usable flows (auth + basic data)

### 2) Build UI First
- Create static pages and styles
- Ensure responsive layout + clear UX

### 3) Integrate Firebase
- Add Firebase via CDN
- Configure Firebase project keys
- Implement:
  - Authentication flows
  - Auth state persistence
  - Database reads/writes

### 4) Iterate
- Improve dashboard UX
- Add validations + better error states
- Refine data structure and security rules

## Getting Started (Local)

Since this is plain HTML/JS + Firebase CDN, run it with any static server.

## Live at 
[Link Text](payvora-sigma.vercel.app). 


## Firebase Setup

1. Create a Firebase project in the Firebase Console
2. Enable **Authentication** (choose providers you use, e.g., Email/Password)
3. Create your **Database** (Realtime Database or Firestore)
4. Add Firebase config into your JS initialization file

### Firebase Config Example

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  databaseURL: "...", // only for Realtime Database
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

> Even though Firebase client config is typically public, you must protect your data using **Firebase Security Rules**.

## Suggested Folder Structure (optional)

```text
.
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  ├─ firebase-init.js
│  ├─ auth.js
│  └─ dashboard.js
└─ assets/
   └─ Payvora.png
```

## Progress / Milestones

- **Week 1:** Created basic pages (landing, login, dashboard)
- **Week 2:** Added Firebase Authentication + improved dashboard UI

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-change`
3. Commit: `git commit -m "Add my change"`
4. Push: `git push origin feature/my-change`
5. Open a Pull Request

## License

Add a license if you plan to open-source this project (e.g., MIT).
