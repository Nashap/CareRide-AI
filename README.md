# CareRide AI ♿

> Connecting elderly individuals, persons with disabilities, and patients with verified helpers through a full-stack AI-powered mobility assistance and transportation platform.

![Django Tests](https://github.com/Nashap/CareRide-AI/actions/workflows/django.yml/badge.svg)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat&logo=google&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=flat&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Coverage](https://img.shields.io/badge/Coverage-99%25-brightgreen)
![Uptime](https://img.shields.io/badge/Uptime-100%25-brightgreen)
![License](https://img.shields.io/badge/License-Educational-blue.svg)

---

## Table of Contents

* [Problem Statement](#-problem-statement)
* [Project Overview](#-project-overview)
* [Live Deployment](#-live-deployment)
* [Project Status](#-project-status)
* [Features](#-features)
* [Tech Stack](#️-tech-stack)
* [Architecture](#️-architecture)
* [AI Recommendation Workflow](#-ai-recommendation-workflow)
* [Project Structure](#-project-structure)
* [Installation](#-installation)
* [Environment Variables](#-environment-variables)
* [API Documentation & Testing](#-api-documentation--testing)
* [Production Monitoring](#-production-monitoring)
* [Screenshots](#-screenshots)
* [Future Enhancements](#-future-enhancements)
* [Contributing](#-contributing)
* [Author](#-author)
* [License](#-license)

---

## 📖 Problem Statement

Elderly individuals, persons with disabilities, and patients often face challenges in accessing safe, reliable, and accessible transportation. Existing transportation services rarely provide specialized assistance or guarantee that helpers are trained to support users with mobility needs. CareRide AI addresses this problem by connecting passengers with verified helpers and using AI-powered recommendations to identify the most suitable helper based on travel requirements, skills, urgency, ratings, and availability.

## 📖 Project Overview

CareRide AI is a modern, complete Full-Stack AI application. It intelligently bridges the gap between passengers with specific mobility needs and verified, capable helpers. The React frontend is fully built out and deployed, alongside a Django REST backend, giving the platform an end-to-end working experience for both riders and helpers.

CareRide AI consists of:
* **React Frontend** — completed and deployed on Vercel
* **Django REST Backend** — deployed on Railway
* **Supabase PostgreSQL**
* **Gemini AI**

---

## 🚀 Live Deployment

| Service | URL |
| --- | --- |
| **Frontend** | [https://careride-six.vercel.app/](https://careride-six.vercel.app/) |
| **Backend** | [https://careride-ai-production.up.railway.app/](https://careride-ai-production.up.railway.app/) |
| **Swagger** | [https://careride-ai-production.up.railway.app/api/schema/swagger-ui/](https://careride-ai-production.up.railway.app/api/schema/swagger-ui/) |
| **Postman** | [https://documenter.getpostman.com/view/55567557/2sBXwvH81g](https://documenter.getpostman.com/view/55567557/2sBXwvH81g) |

---

## 📊 Project Status

**React Frontend Completed**

* ✅ User Authentication
* ✅ Helper Management
* ✅ Travel Request APIs
* ✅ Supabase Integration
* ✅ Gemini AI Integration
* ✅ AI Recommendation Engine & Storage
* ✅ AI Recommendation Workflow
* ✅ Rider Dashboard
* ✅ Helper Dashboard
* ✅ Ride Assignment Workflow
* ✅ Disability Certificate Upload
* ✅ Swagger Documentation
* ✅ MkDocs Documentation
* ✅ Automated Test Suite — 82% Code Coverage
* ✅ GitHub Actions CI Configured
* ✅ Railway Deployment (Backend)
* ✅ Vercel Deployment (Frontend)
* ✅ UptimeRobot Monitoring Configured

---

## ✨ Features

### 🧑‍🦽 Rider Features
* Register & Login
* Book Ride
* AI Helper Recommendation
* AI Assistant Chatbot
* Ride Status Tracking
* Ride History
* Disability Certificate Upload & Secure Viewing
* Profile Management

### 🤝 Helper Features
* Register & Login
* Browse Requests
* AI Priority Requests
* Accept Ride
* Assigned Ride Dashboard
* Complete Ride
* View Assigned Rider Contact
* Secure Disability Certificate Viewing (Assigned rides only)

### 🧠 AI Features
* Gemini AI Helper Recommendation — ranks the **Top 3** most suitable helpers per ride
* Exclusive Priority Window — ranked helpers get first right of acceptance before the ride opens up
* Open Dispatch Fallback — if the priority window times out, the ride opens to general Browse Requests on a first-accept basis
* Intelligent Helper Ranking based on skills, ratings, and availability
* AI Chat Assistant

### 🔒 Platform & Security
* Secure Authentication using JWT
* Rate Limiting with django-ratelimit
* Custom Serializer Validation
* CORS Security Configuration
* OWASP Security Review
* Performance Testing (50 Rapid API Requests)

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Django, Django REST Framework |
| **Database** | Supabase PostgreSQL |
| **Authentication** | JWT |
| **AI** | Google Gemini API |
| **API Documentation** | Swagger (drf-spectacular) |
| **Project Documentation** | MkDocs |
| **Testing** | Pytest, Pytest-Django, Pytest-Cov |
| **CI/CD** | GitHub Actions |
| **Deployment** | Railway (Backend), Vercel (Frontend) |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[React Frontend] --> B[Django REST API]
    B --> C[Gemini AI]
    B --> D[(Supabase PostgreSQL)]
    B --> E[JWT Authentication]
```

---

## 🤖 AI Recommendation Workflow

```mermaid
graph TD
    A[Book Ride] --> B[Gemini ranks Top 3 Helpers]
    B --> C[Exclusive AI Window]
    C -->|Accepted| D[Assigned]
    C -->|Timeout| E[Open Dispatch]
    E --> F[Priority + Browse Requests]
    F --> G[First Accept Wins]
    G --> H[Completed / Expired]
```

---

## 📂 Project Structure

```text
CareRide-AI/
├── backend/                  # Django REST API
│   ├── ai_services/          # Gemini AI integration and chat
│   ├── care_ride/            # Core project settings
│   ├── helpers/              # Helper management app
│   ├── rides/                # Ride booking and assignment logic
│   ├── users/                # User authentication and profiles
│   ├── requirements.txt      # Python dependencies
│   └── manage.py             # Django management script
├── frontend/                 # React application
│   ├── src/                  # React components, pages, and context
│   ├── public/                # Static assets
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind CSS configuration
├── docs/                      # Documentation images and resources
├── .github/workflows/         # GitHub Actions CI/CD pipelines
├── mkdocs.yml                 # MkDocs configuration
└── README.md                  # Project documentation
```

---

## 🚀 Installation

### Prerequisites
* Python 3.10+
* Node.js 18+
* Git
* Supabase Account
* Google Gemini API Key

### Clone Repository
```bash
git clone https://github.com/Nashap/CareRide-AI.git
cd CareRide-AI
```

### Backend Setup

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   ```
   *Windows:* `venv\Scripts\activate`
   *Linux / Mac:* `source venv/bin/activate`

2. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   Create a `.env` file inside the `backend` directory (see [Environment Variables](#-environment-variables) below).

4. **Run Database Migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start Backend Server**
   ```bash
   python manage.py runserver
   ```
   *Backend URL:* `http://127.0.0.1:8000/`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   npm run dev
   ```
   *Frontend URL:* `http://localhost:5173/`

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

| Variable | Description | Example |
| --- | --- | --- |
| `SECRET_KEY` | Django Secret Key | `your_secret_key` |
| `DEBUG` | Enable/Disable Debug Mode | `True` |
| `SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Supabase API Key | `your_supabase_key` |
| `GEMINI_API_KEY` | Google Gemini API Key | `your_gemini_api_key` |

---

## 📚 API Documentation & Testing

* **Swagger UI:** [View Swagger Docs](https://careride-ai-production.up.railway.app/api/schema/swagger-ui/)
* **OpenAPI Schema:** `http://127.0.0.1:8000/api/schema/`
* **Postman Collection:** [View API Collection](https://documenter.getpostman.com/view/55567557/2sBXwvH81g)
* **MkDocs Documentation:** Run `mkdocs serve` and visit `http://127.0.0.1:8001/`

### Available Postman Collections
* Authentication APIs
* Helper APIs
* Travel Request APIs
* AI Recommendation APIs

### Testing

CareRide AI uses **Pytest**, **Pytest-Django**, and **Pytest-Cov** for automated testing.

* Serializer Unit Tests
* View Unit Tests
* Authentication Flow Tests
* AI Recommendation Integration Test (Mocked Gemini API — external AI calls are fully mocked to prevent real network requests and ensure predictable test outcomes)
* GitHub Actions CI Testing

**Current coverage: 82%** — 11 tests passed, 0 failed.

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=. --cov-report=term

# Generate HTML coverage report
pytest --cov=. --cov-report=html
```

Generated report: `htmlcov/index.html`

<img width="1958" height="3134" alt="_C__Users_nasha_OneDrive_zlaqa_CareRide_backend_htmlcov_index html (1)" src="https://github.com/user-attachments/assets/fe65df98-e4aa-418d-b176-63c055a47453" />


---

## 📡 Production Monitoring

The CareRide AI production deployment is continuously monitored using **UptimeRobot** to ensure service availability and uptime tracking.

| Detail | Value |
| --- | --- |
| Monitoring Type | HTTP(s) |
| Monitoring Interval | 5 Minutes |
| Current Status | Operational |
| Uptime | 100% |

![UptimeRobot Status](docs/images/uptimerobot.png)

---

## 📸 Screenshots


### 🧑‍🦽 Rider Experience
| Screen | Preview |
| --- | --- |
| Login / Register | <img width="901" height="541" alt="image" src="https://github.com/user-attachments/assets/b19e96fb-0fb9-4cf6-9202-7a721fd532fa" /> |
| Book Ride | <img width="724" height="560" alt="image" src="https://github.com/user-attachments/assets/2ad47bea-345c-4e3b-a3a5-1351745154d9" /> |
| AI Helper Recommendation (Top 3 Ranking) | <img width="650" height="1351" alt="image" src="https://github.com/user-attachments/assets/f91a7760-3c59-4764-8ec7-f46caeaebe0c" /> |
| AI Chat Assistant | <img width="1077" height="560" alt="image" src="https://github.com/user-attachments/assets/3115125e-9348-453c-a61f-231c99fdb5a1" /> |
| Ride Status Tracking | <img width="1053" height="559" alt="image" src="https://github.com/user-attachments/assets/8415b2e0-c57b-4218-a652-1d8e61759378" /> |
| Ride History | <img width="1053" height="559" alt="image" src="https://github.com/user-attachments/assets/afbfbdf4-4d38-4ee9-af63-67b50829d266" /> |
| Disability Certificate Upload | <img width="940" height="425" alt="image" src="https://github.com/user-attachments/assets/c36bd3d3-ae33-4cf4-81a0-a2ee5e1fb8a5" /> |
| Rider Profile | <img width="665" height="1412" alt="image" src="https://github.com/user-attachments/assets/e4af1005-7169-478e-a33f-4da5f0f86ab0" /> |

### 🤝 Helper Experience
| Screen | Preview |
| --- | --- |
| Login / Register | <img width="953" height="560" alt="image" src="https://github.com/user-attachments/assets/ad7a9892-58ef-4b4d-b7aa-6dd470adbdad" /> |
| Browse Requests | <img width="1237" height="556" alt="image" src="https://github.com/user-attachments/assets/da5b4bdc-017f-4b65-954a-bedb90792b66" /> |
| AI Priority Requests | ![Priority Requests](docs/images/priority-requests.png) |
| Assigned Ride Dashboard | ![Helper Dashboard](docs/images/helper-dashboard.png) |
| View Assigned Rider Contact | ![Rider Contact](docs/images/rider-contact.png) |
| Secure Disability Certificate Viewing (Assigned only) | ![View Certificate](docs/images/view-certificate.png) |
| Complete Ride | ![Complete Ride](docs/images/complete-ride.png) |

### ⚙️ Platform & Ops
| Screen | Preview |
| --- | --- |
| Swagger Documentation | ![Swagger](docs/images/swagger.png) |
| MkDocs Documentation | ![MkDocs](docs/images/mkdocs.png) |
| Test Coverage Report | ![Coverage](docs/images/coverage-report.png) |
| UptimeRobot Monitoring | ![Uptime](docs/images/uptimerobot.png) |

### 📱 Mobile View
| Screen | Preview |
| --- | --- |
| Responsive Rider Dashboard | ![Mobile View](docs/images/mobile-view.png) |

---

## 🚀 Future Enhancements

* Live GPS Tracking
* AI Route Optimization
* OCR Processing for Disability Certificates
* Mobile App
* Push Notifications
* Voice Assistant

---

## 🤝 Contributing

Contributions are welcome and appreciated. Please read the `CONTRIBUTING.md` file before creating issues or submitting pull requests.

---

## 👨‍💻 Author

**Nasha P**
AI & Full-Stack Developer
* GitHub: [https://github.com/Nashap](https://github.com/Nashap)
* Project Repository: [https://github.com/Nashap/CareRide-AI](https://github.com/Nashap/CareRide-AI)

---

## 📄 License

This project is developed as part of an AI and Full-Stack Development Internship project.
For educational and demonstration purposes.
