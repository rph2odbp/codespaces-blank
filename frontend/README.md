# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


✅ Camp Management System – Project Summary & Feature Requirements

Build a full-stack web application to manage a summer camp. It should support:

1. Camper Registration

    Parents sign up/log in securely (JWT + bcrypt)

    Register multiple campers

    Form includes: name, age, gender, t-shirt size, allergies, medical conditions, medications, roommate requests, file uploads (photo & insurance card)

    Camper linked to selected session and parent

2. Session Management

    Admin creates camp sessions (name, start/end dates, gender, capacity)

    Public session list viewable without login

    Camper registration is restricted to active sessions

3. Cabin Assignment

    Admin assigns campers to cabins for each session

    Cabins store list of camper IDs

    View campers by cabin and session

4. Parent Portal

    View/edit registered campers

    Send messages to campers (with optional paywall for unlimited messages)

5. Messaging System

    Parents send messages

    Admin views messages sorted by date (daily view)

6. Staff Application

    Public staff application form (name, contact, availability, experience)

    Admin views submitted applications

7. Admin Panel

    Login required (JWT auth)

    View all campers, sessions, cabins, messages, and staff apps

    Edit camper info and cabin assignments

8. Nurse Panel

    Admin-only access

    View medical info by camper

    Log medications given

9. File Uploads

    Camper form supports image upload and insurance card upload (via Multer)

    Stored and served statically from /uploads

🔐 Security

    Passwords hashed (bcrypt)

    Authentication via JWT for parents and admins

    Protected routes (requireParent, requireAdmin middleware)

📦 Tech Stack

    Frontend: React (with Router and Context)

    Backend: Node.js + Express

    Database: MongoDB (Mongoose)

    Auth: JWT (token-based auth for admin/parent roles)

    Hosting: GitHub Codespaces + GitHub Copilot for development