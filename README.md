# Haett Partner Portal

A partner management platform where affiliates, influencers, gyms, and businesses can apply, get approved, and receive discount codes.

---

## Setup

### Backend (Spring Boot)
```bash
cd partner-portal
mvnw.cmd spring-boot:run
```
Runs on http://localhost:8080  
Database is H2 in-memory and **seeded automatically** on startup — no setup needed.

### Frontend (React)
```bash
cd frontend
npm install
npm start
```
Runs on http://localhost:3000/partner

---

## Test Credentials

| Role  | Email           | Password |
|-------|-----------------|----------|
| Admin | admin@haett.com | admin123 |
| User  | user@haett.com  | user123  |

---

## Screenshots

See `/Screenshots` for all six states: visitor, application form, pending, rejected, approved dashboard, and admin panel.
