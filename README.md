# Virtual Event Platform 📅

A full-stack web application built with Flask (Python) and Angular (TypeScript) that allows users to host, manage, and join virtual events. Organizers can create events, manage attendees, and share event links, while attendees can browse upcoming events, register, and receive email confirmations and reminders.

## Overview

This platform provides a seamless experience for managing online gatherings. Organizers have the tools to set up event details, track registrations, and communicate with attendees. Attendees benefit from a clear event listing, simple registration, and timely notifications. The project utilizes a Python Flask REST API backend with a PostgreSQL database and an Angular SPA frontend.

## Screenshots 🖼️

| Page                  | Screenshot                                      |
| :-------------------- | :---------------------------------------------- |
| Homepage              | ![Homepage](/images/home.jpeg)   |
| Login Page            | ![Login](/images/login.jpeg)     |
| Register Page         | ![Register](/images/register.jpeg) |
| Events List           | ![Events List](/images/events.jpeg)|
| Organizer Dashboard   | ![Organizer Dashboard](/images/dashboard.jpeg) |
| Organizer Homepage    | ![Organizer Homepage](/images/organizer-home.jpeg) |
| Edit Event (Modal)    | ![Edit Event](/images/edit-event.jpeg) |
| Create Event (Modal)  | ![Create Event](/images/create-event.jpeg) |
| My Registered Events  | ![My Registrations](/images/registered-events.jpeg) |


## Features Implemented ✨

*   **User Authentication:** Secure registration and login for both organizers and attendees using Flask-Login and Bcrypt password hashing.
*   **Event Management (CRUD):** Organizers can Create, Read, Update, and Delete events via a dashboard interface.
*   **Event Discovery:** Attendees can browse a list of upcoming virtual events.
*   **Event Details:** View detailed information for each event.
*   **RSVP / Registration System:** Logged-in users can register/unregister for events.
*   **Organizer Dashboard:** Dedicated view for organizers to manage their created events, including viewing attendees.
*   **Attendee View ("My Registrations"):** Logged-in users can see a list of events they are registered for.
*   **Email Notifications (Flask-Mail):**
    *   Registration confirmation emails.
    *   Event reminder emails (requires a scheduler like GitHub Actions or similar to trigger the `/send-reminders` endpoint).
*   **RESTful API:** Flask backend providing API endpoints for frontend interaction.
*   **Responsive Design:** Basic responsiveness implemented for different screen sizes (desktop, tablet, mobile) using CSS media queries and flexible layouts.
*   **Standalone Component Architecture:** Angular frontend refactored to use modern Standalone Components.

## Tech Stack 💻

*   **Backend:**
    *   Python 3.10+
    *   Flask
    *   Flask-SQLAlchemy (ORM)
    *   Flask-Migrate (Database Migrations)
    *   Flask-Login (Session Management)
    *   Flask-Bcrypt (Password Hashing)
    *   Flask-Cors (Cross-Origin Resource Sharing)
    *   Flask-Mail (Email Sending)
    *   Psycopg2-binary (PostgreSQL Adapter)
    *   Gunicorn (WSGI Server for Deployment)
    *   Python-Dotenv (Environment Variables)
*   **Frontend:**
    *   Angular (~v19)
    *   TypeScript
    *   SCSS
    *   Angular HttpClient
    *   Angular Reactive Forms
*   **Database:**
    *   PostgreSQL (on Render)
    *   SQLite (for local development fallback)
*   **Deployment:**
    *   **Backend API:** Render (Free Tier Web Service)
    *   **(Frontend currently running locally)**

## Getting Started (Local Development) 🚀

Follow these instructions to set up the project locally.

**Prerequisites:**

*   Python 3.10 or higher installed.
*   Node.js LTS version (which includes npm) installed.
*   Angular CLI installed globally (`npm install -g @angular/cli`).
*   Git installed.
*   (Optional but Recommended) PostgreSQL installed locally if you don't want to use SQLite for backend development.

**Setup:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Garbii1/virtual-event-platform.git
    cd virtual-event-platform
    ```

2.  **Backend Setup:**
    ```bash
    cd backend

    # Create and activate a virtual environment
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate

    # Install backend dependencies
    pip install -r requirements.txt

    # Create a .env file (copy from .env.example if provided, or create manually)
    # Add the following variables (replace placeholders):
    # --- backend/.env ---
    # SECRET_KEY=your_super_secret_random_key_here # Generate one (see Flask docs or use python -c 'import secrets; print(secrets.token_hex(32))')
    # FLASK_ENV=development
    # DATABASE_URL=postgresql://user:password@host:port/database # Your local PostgreSQL URL OR comment out to use SQLite
    # MAIL_SERVER=smtp.example.com
    # MAIL_PORT=587
    # MAIL_USE_TLS=True
    # MAIL_USERNAME=your_email@example.com
    # MAIL_PASSWORD=your_email_app_password_or_apikey # Use Gmail App Password or SendGrid API Key etc.
    # MAIL_DEFAULT_SENDER="Your App Name <your_email@example.com>"
    # FRONTEND_URL=http://localhost:4200
    # --- end backend/.env ---

    # Create/Update the database schema (uses DATABASE_URL from .env or falls back to dev.db)
    flask db upgrade

    # Run the Flask development server
    python app.py
    # Backend should now be running on http://127.0.0.1:5000 or http://localhost:5000
    ```

3.  **Frontend Setup (in a new terminal):**
    ```bash
    cd frontend

    # Install frontend dependencies
    npm install

    # Run the Angular development server
    ng serve --open
    # Frontend should open automatically in your browser at http://localhost:4200
    ```

## API Endpoints Overview 🌐

The Flask backend provides the following key API endpoints:

**Authentication (`/auth`)**

*   `POST /auth/register`: Register a new user (attendee or organizer).
*   `POST /auth/login`: Log in a user, returns user info and sets session cookie.
*   `POST /auth/logout`: Log out the current user (requires authentication).
*   `GET /auth/status`: Check if a user session is currently active, returns user info if logged in.

**Events (`/events`)**

*   `GET /events`: List all upcoming events.
*   `POST /events`: Create a new event (requires organizer role).
*   `GET /events/<int:event_id>`: Get details for a specific event.
*   `PUT /events/<int:event_id>`: Update an existing event (requires organizer role, must be event owner).
*   `DELETE /events/<int:event_id>`: Delete an event (requires organizer role, must be event owner).
*   `POST /events/<int:event_id>/register`: Register the current logged-in user for an event.
*   `POST /events/<int:event_id>/unregister`: Unregister the current logged-in user from an event.
*   `GET /events/<int:event_id>/attendees`: Get the list of registered attendees for an event (requires organizer role, must be event owner).

**User Specific (`/`)**

*   `GET /my-events`: Get events organized by the current logged-in user (requires organizer role).
*   `GET /my-registrations`: Get events the current logged-in user is registered for.

**Utility (`/`)**

*   `POST /send-reminders`: (Internal/Scheduled Task) Endpoint to trigger sending email reminders for upcoming events.

## Deployment Notes ☁️

*   **Backend:** The Flask API is deployed on **Render** using their free tier Web Service.
*   **Database:** A free tier PostgreSQL instance hosted on Render is used for the production database.
*   **Migrations:** Database migrations (`flask db upgrade`) are run automatically as part of the Render build command (`pip install -r requirements.txt && flask db upgrade`).
*   **Environment Variables:** All sensitive keys (`SECRET_KEY`, `DATABASE_URL`, `MAIL_...`, `FRONTEND_URL`) are configured directly as environment variables in the Render service settings.
*   **(Frontend Deployment Skipped):** The app currently runs locally via `ng serve`.

## Challenges Faced & Solutions 🧠

1.  **Angular Standalone vs. NgModule:** Encountered persistent build errors (`TS-996008: Component X is standalone...`) even when component code seemed correct for NgModules. This indicated a possible Angular CLI v19 bug or deep cache/configuration issue.
    *   **Solution:** Refactored the entire Angular application to use the **Standalone Component API**. This involved adding `standalone: true` to components, managing dependencies via component `imports` arrays, using `bootstrapApplication`, and configuring providers in `app.config.ts`. This resolved the build errors.
2.  **CORS & Session Cookies:** After successful login, subsequent API requests to protected backend routes failed with 401 Unauthorized errors.
    *   **Solution:**
        *   Configured Flask-CORS correctly in `backend/app.py` to allow the specific frontend origin (`http://localhost:4200` for development, Production URL for deployment) using `origins=[app.config['FRONTEND_URL']]`.
        *   Ensured `supports_credentials=True` was set in Flask-CORS to allow session cookies to be sent and received.
        *   Ensured consistent use of `http://localhost` (not `127.0.0.1`) for both the frontend access URL and the backend `apiUrl` in Angular environments to avoid browser origin mismatch issues with cookies.
        *   Configured Flask-Login's `unauthorized_handler` in `backend/extensions.py` to return a JSON 401 response instead of redirecting, allowing Angular guards/interceptors to handle authentication failures appropriately for API calls.
        *   Ensured `withCredentials: true` was set in Angular's `HttpClient` options for all requests needing session cookies.
3.  **Database Migrations on Free Tier:** The Render free tier does not include an interactive shell to run `flask db upgrade` manually after deployment.
    *   **Solution:** Modified the Render **Build Command** to `pip install -r requirements.txt && flask db upgrade` to automatically run migrations during the build process.

## Future Improvements 💡

*   **Real-time Features:** Implement WebSockets (e.g., Flask-SocketIO) for features like live attendee counts or basic event chat.
*   **Video Integration:** Add dedicated fields for meeting links (Zoom, Jitsi Meet, etc.) and potentially embed video directly.
*   **Payment Integration:** Integrate Stripe (Test Mode initially) for handling payments for premium events.
*   **Enhanced Event Management:** Add features like event categorization/tags, search/filtering on the event list.
*   **Calendar Integration:** Allow users to add registered events to their Google Calendar/Outlook Calendar.
*   **Testing:** Add unit and integration tests for both backend and frontend.
*   **UI/UX Polish:** Refine styling, add more loading indicators, improve form validation feedback, potentially use a UI component library.
*   **Admin Panel:** Create a separate interface for superusers to manage all users and events globally.
*   **QR Codes:** Generate QR codes for event check-in (more relevant for hybrid/in-person aspects).

## Author & Contact 🧑‍💻

*   **Author:** Muhammed Babatunde Garuba
*   **GitHub:** [Garbii1](https://github.com/Garbii1)

## License 📜

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)