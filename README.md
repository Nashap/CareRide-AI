# CareRide AI ♿

## Smart Mobility Assistance Platform

CareRide AI is an AI-powered mobility assistance platform designed to help people with disabilities, elderly citizens, and recovering patients travel safely and independently.

The platform connects users with verified helpers and provides AI-powered recommendations for accessible travel, helper matching, and emergency support.

---

## Problem Statement

Many individuals requiring mobility assistance face difficulties finding reliable support, accessible transportation, and safe travel routes. Existing ride-booking services focus primarily on transportation and often overlook accessibility requirements.

CareRide AI addresses this challenge by combining mobility assistance, accessibility-focused route recommendations, and AI-powered helper matching in a single platform.

---

## Key Features

### User Authentication

* Secure Registration and Login
* Role-based Access (Passenger, Helper, Admin)

### Travel Assistance Request

* Select Pickup Location
* Select Destination
* Choose Assistance Type
* Add Additional Notes

### AI Helper Matching

* Match passengers with suitable helpers
* Consider skills, availability, and assistance needs
* AI-generated recommendation reasoning

### Accessible Route Recommendation

* Wheelchair-friendly route suggestions
* Accessibility information and guidance

### Emergency SOS

* One-click emergency alert
* Notify administrators and emergency contacts

---

## Target Users

### Primary Users

* People with disabilities
* Elderly citizens
* Post-surgery patients

### Secondary Users

* Volunteers
* Caregivers
* Student helpers

### Administrators

* Platform administrators
* Verification managers

---

## Technology Stack

### Frontend

* React.js
* Tailwind CSS
* ShadCN UI

### Backend

* Django
* Django REST Framework

### Database

* PostgreSQL (Supabase)

### AI Integration

* Google Gemini API

### Maps & Navigation

* OpenStreetMap
* Leaflet.js

### Deployment

* Railway

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
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/
│   ├── project-spec.md
│   ├── database-design.md
│   └── api-documentation.md
│
├── tests/
│
├── README.md
└── LICENSE
```

---

## Database Entities

### User

* id
* name
* email
* password
* role

### Passenger

* user_id
* disability_type
* emergency_contact

### Helper

* user_id
* skills
* rating
* availability

### TravelRequest

* passenger_id
* pickup_location
* destination
* travel_date
* assistance_type
* additional_note
* status

### MatchRecommendation

* travel_request_id
* helper_id
* recommendation_reason

### SOSAlert

* travel_request_id
* message
* created_at

---

## Future Enhancements

* Real-time Chat
* Voice Assistant
* Live Location Tracking
* Accessible Vehicle Booking
* NGO Integration
* Volunteer Reward System
* AI Travel Companion Recommendation

---

## Expected Outcome

CareRide AI aims to improve mobility, accessibility, and independence for people who require travel assistance by leveraging artificial intelligence, accessibility-focused design, and community support.

---

## Author

**Nasha P**

---

## License

This project is developed for educational, internship, and social-impact purposes.
