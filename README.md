# CampusEcho - Anonymous University Complaint System

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Express](https://img.shields.io/badge/Express-5.x-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-black)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![License](https://img.shields.io/badge/License-MIT-success)

## 📌 Project Overview

CampusEcho is a secure, anonymous complaint management platform designed for universities.

Students can submit complaints without creating an account or revealing their identity. Every complaint receives a unique tracking ID, allowing students to monitor its progress later.

University administrators can securely manage complaints through a dedicated dashboard by reviewing, categorizing, updating statuses, and resolving issues while maintaining complete anonymity for students.

---

# 🚀 Live Demo

### Frontend

```
https://your-frontend-url.vercel.app
```

### Backend

```
https://your-api-url.vercel.app
```

---

# 📖 Features

## Student Features

* Submit complaints anonymously
* No registration required
* Upload evidence (JPG, PNG, PDF)
* Automatically generated Tracking ID
* Track complaint status anytime
* Timeline view of complaint progress
* Responsive UI

---

## Admin Features

* Secure Login
* JWT Authentication
* View all complaints
* Search complaints
* Filter complaints
* Update complaint status
* Add internal notes
* View uploaded evidence
* Dashboard statistics
* Change password
* Logout

---

## Security Features

* Password hashing using bcrypt
* JWT Authentication
* Protected Routes
* Express Rate Limiter
* Helmet Security
* CORS Protection
* Input Validation
* File Type Validation
* File Size Validation
* Environment Variables
* Secure PostgreSQL Credentials

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* React Router
* Tailwind CSS
* Redux Toolkit
* RTK Query
* React Hook Form
* Zod
* Axios
* Recharts

---

## Backend

* Express.js
* TypeScript
* PostgreSQL
* Prisma ORM
* JWT
* bcryptjs
* Helmet
* Morgan
* Express Rate Limit
* CORS
* Cloudinary

---

## Database

PostgreSQL

---

# 📂 Project Structure

## Backend

```
campusecho-backend
│
├── prisma
│   └── schema.prisma
│
├── src
│
├── config
├── middleware
├── modules
│
│   ├── admin
│   ├── complaint
│   ├── category
│   ├── auth
│   └── timeline
│
├── utils
├── types
│
├── app.ts
└── server.ts
```

---

# 🗄 Database Schema

## complaints

* id
* tracking_code
* title
* description
* category_id
* status
* incident_date
* location
* evidence_url
* created_at
* updated_at

---

## categories

* id
* name
* created_at

---

## admins

* id
* email
* password_hash
* role
* created_at

---

## complaint_notes

* id
* complaint_id
* admin_id
* note
* created_at

---

## complaint_status_history

* id
* complaint_id
* previous_status
* current_status
* updated_by
* created_at

---

# 🔐 Authentication

Admin authentication uses JWT.

```
Login
     ↓
Generate Access Token
     ↓
Protected Routes
     ↓
Dashboard
```

---

# Complaint Workflow

```
Student

Submit Complaint
        │
        ▼
Generate Tracking ID
        │
        ▼
Complaint Saved
        │
        ▼
Admin Review
        │
        ▼
Status Update
        │
        ▼
Student Tracks Progress
```

---

# Complaint Status

* Pending
* Under Review
* Investigating
* Resolved
* Rejected

---

# Search

Search by

* Tracking ID
* Complaint Title

---

# Filters

* Status
* Category
* Date Range

---

# Pagination

Server-side pagination implemented.

---

# Evidence Upload

Supported formats

* JPG
* PNG
* PDF

Maximum file size limit is configurable.

Files are uploaded to Cloudinary.

---

# API Endpoints

## Authentication

```
POST /api/auth/login
POST /api/auth/logout
```

---

## Complaints

```
POST   /api/complaints
GET    /api/complaints
GET    /api/complaints/:id
PATCH  /api/complaints/:id
GET    /api/track/:trackingCode
```

---

## Categories

```
GET
POST
PATCH
DELETE
```

---

## Dashboard

```
GET /dashboard/overview
GET /dashboard/statistics
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/campusecho-backend.git
```

---

## Install Dependencies

```bash
bun install
```

or

```bash
npm install
```

---

## Environment Variables

Create a `.env` file

```env
PORT=5000

DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=7d

ADMIN_EMAIL=

ADMIN_PASSWORD=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

## Generate Prisma Client

```bash
bun run prisma:generate
```

---

## Run Migration

```bash
bun run prisma:migrate
```

---

## Start Development Server

```bash
bun run dev
```

---

# Deployment Checklist

* Frontend deployed
* Backend deployed
* Environment Variables configured
* Database connected
* Cloudinary configured
* No CORS issues
* Protected APIs working
* Refresh routes working
* File upload working

---

# Future Improvements

* Dark Mode
* Multi Admin Support
* AI Spam Detection
* Email Notifications
* Complaint Analytics
* CSV Export
* Real-time Updates
* Audit Logs

---

# Screenshots

### Home

(Add Screenshot)

### Submit Complaint

(Add Screenshot)

### Track Complaint

(Add Screenshot)

### Dashboard

(Add Screenshot)

---

# Contributing

1. Fork the repository.

2. Create a feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit changes.

```bash
git commit -m "Add new feature"
```

4. Push changes.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

# License

This project is licensed under the MIT License.

---

# Author

**Abdullah**

Full Stack Developer

Bangladesh

---

## ⭐ If you like this project, don't forget to give it a Star!
