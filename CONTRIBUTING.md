# Contributing to CareRide AI

Thank you for considering a contribution to CareRide AI. This project aims to make transportation safer, more accessible, and more inclusive for elderly individuals, persons with disabilities, and patients. Every contribution, whether code, documentation, testing, design, or feedback, is greatly appreciated.

---

# Table of Contents

* Code of Conduct
* Getting Started
* Development Workflow
* Branch Naming
* Commit Message Guidelines
* Pull Request Process
* Reporting Bugs
* Creating Issues
* Suggesting Features
* Project Structure
* Style Guide
* Documentation Resources
* License

---

# Code of Conduct

Please be respectful, inclusive, and constructive in all interactions.

CareRide AI serves users who may depend on accessibility support and mobility assistance. Contributions should prioritize user safety, accessibility, reliability, and privacy.

---

# Getting Started

## 1. Fork the Repository

Fork the repository to your GitHub account.

## 2. Clone the Repository

```bash
git clone https://github.com/Nashap/CareRide-AI.git
cd CareRide-AI
```

## 3. Set Up the Project

Follow the Setup Guide in the README.md file.

## 4. Create a Feature Branch

Create a new branch before making changes.

Example:

```bash
git checkout -b feature/helper-matching-improvement
```

---

# Development Workflow

1. Check existing issues before starting work.
2. Create a dedicated branch from `main`.
3. Implement your changes.
4. Add tests where applicable.
5. Update documentation if necessary.
6. Run the test suite before committing.
7. Push your branch and create a Pull Request.

Run tests:

```bash
python manage.py test
```

Contributors should ensure:

* All existing tests pass.
* New features include appropriate tests.
* No critical warnings or errors are introduced.

---

# Branch Naming

Use descriptive branch names.

### Features

```text
feature/feature-name
```

Example:

```text
feature/ai-recommendation-improvement
```

### Bug Fixes

```text
fix/issue-description
```

Example:

```text
fix/jwt-authentication-error
```

### Documentation

```text
docs/documentation-update
```

Example:

```text
docs/readme-improvement
```

### Refactoring

```text
refactor/module-name
```

Example:

```text
refactor/helper-service
```

---

# Commit Message Guidelines

This project follows Conventional Commits.

Format:

```text
type(scope): short description
```

Examples:

```text
feat(ai): add Gemini recommendation endpoint

fix(auth): resolve JWT token validation issue

docs(readme): update setup instructions

refactor(api): simplify request handling
```

Common commit types:

* feat
* fix
* docs
* refactor
* test
* chore
* style

---

# Pull Request Process

Before submitting a Pull Request:

* Ensure code follows project standards.
* Run all tests successfully.
* Update documentation if required.
* Resolve merge conflicts.

Pull Request Checklist:

* Feature implemented
* Tests completed
* Documentation updated
* No unnecessary files included

Include screenshots when UI changes are involved.

---

# Reporting Bugs

When reporting a bug, please include:

* Steps to reproduce
* Expected behavior
* Actual behavior
* Error messages or logs
* Screenshots if applicable

Example:

```text
Issue:
AI recommendation endpoint returns 500 error.

Steps:
1. Submit recommendation request.
2. API returns server error.

Expected:
Recommendation response returned successfully.
```

---

# Creating Issues

Before creating a new issue:

* Search existing issues first.
* Use a clear and descriptive title.
* Provide sufficient details for reproduction.
* Label the issue appropriately (bug, enhancement, documentation, etc.).

---

# Suggesting Features

When proposing a new feature, please explain:

* The problem being solved
* Who benefits from the feature
* Expected functionality
* Any implementation ideas

Example:

```text
Feature:
Real-time helper tracking

Benefit:
Allows passengers to monitor helper location during travel.
```

---

# Project Structure

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
│
├── docs/
│
├── .github/
│
├── README.md
├── CONTRIBUTING.md
├── mkdocs.yml
└── prompts.md
```

---

# Style Guide

## Python

* Follow PEP 8 standards.
* Use meaningful variable names.
* Keep functions small and reusable.
* Add docstrings for models, serializers, and views.

Example:

```python
class RecommendHelperView(APIView):
    """
    Generates AI-powered helper recommendations.
    """
```

## React

* Use functional components.
* Keep components modular and reusable.
* Follow consistent naming conventions.

## Documentation

* Update README when features change.
* Document new API endpoints.
* Add request and response examples where applicable.

---

# Documentation Resources

Project documentation is available through:

* README.md
* CONTRIBUTING.md
* Swagger/OpenAPI Documentation
* MkDocs Documentation Site
* Postman API Collection

Swagger UI:

```text
/api/schema/swagger-ui/
```

---

# License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for helping improve CareRide AI and making mobility assistance more accessible for everyone.
