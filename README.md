![Django Tests](https://github.com/Nashap/CareRide-AI/actions/workflows/django.yml/badge.svg)
![Django Tests](https://github.com/Nashap/CareRide-AI/actions/workflows/django.yml/badge.svg)

# CareRide AI ♿

## Smart Mobility Assistance Platform

CareRide AI is an AI-powered mobility assistance platform designed to help elderly individuals, persons with disabilities, and patients travel safely and independently. The platform connects users with verified helpers and uses AI-powered recommendations to identify the most suitable assistance for each travel request.

---

## Problem Statement

Many individuals requiring mobility assistance struggle to find reliable helpers, accessible transportation, and safe travel support. Traditional transportation services often do not adequately address accessibility requirements.

CareRide AI bridges this gap by combining helper matching, travel assistance, and AI-driven recommendations into a single platform.

---

## Key Features

### Authentication & Security

* User Registration and Login
* JWT Authentication
* Role-Based Access Control

### Helper Management

* Create, View, Update, and Delete Helpers
* Helper Skill Tracking
* Availability Management

### Travel Assistance

* Travel Request Booking
* Accessibility Support
* Mobility Assistance Planning

### AI Recommendation System

* Google Gemini AI Integration
* Intelligent Helper Matching
* Skill-Based Ranking
* Distance and Availability Analysis
* AI Recommendation Storage in Supabase

### API Documentation

* Swagger/OpenAPI Documentation
* Interactive API Testing Interface

---

## AI Recommendation Workflow

Travel Request
⬇
Gemini AI Analysis
⬇
Helper Ranking & Match Scoring
⬇
Recommendation Generation
⬇
Store Results in Supabase
⬇
Return API Response

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* ShadCN UI

### Backend

* Django
* Django REST Framework
* Simple JWT

### Database

* PostgreSQL
* Supabase

### AI

* Google Gemini API

### Documentation

* drf-spectacular (Swagger/OpenAPI)
* MkDocs

### DevOps

* GitHub Actions
* GitHub Pull Requests

---

## API Documentation

### Swagger UI

```text
/api/schema/swagger-ui/
```

### OpenAPI Schema

```text
/api/schema/
```

---

## Project Structure

```text
CareRide-AI/
│
├── backend/
│   ├── users/
│   ├── helpers/
│   ├── rides/
│   ├── ai_services/
│   └── care_ride/
│
├── frontend/
├── .github/
├── prompts.md
└── README.md
```

---

## Current Status

### Completed

* User Authentication
* JWT Integration
* Helper APIs
* Travel Request APIs
* Gemini AI Recommendation System
* Supabase Integration
* Swagger Documentation
* GitHub Actions CI/CD

### In Progress

* Frontend Development
* Accessibility Enhancements

### Future Enhancements

* Real-Time Chat
* Voice Assistant
* Live Location Tracking
* Accessible Vehicle Booking
* NGO & Volunteer Integration

---

## Author

**Nasha P**
