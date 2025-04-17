# backend/routes.py
import logging
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User, Event, Registration
from extensions import bcrypt
from utils import (
    send_email,
    registration_confirmation_email_html, registration_confirmation_email_text,
    event_reminder_email_html, event_reminder_email_text
)
from datetime import datetime

# Setup Logger
logger = logging.getLogger(__name__)

# Create Blueprints
main_bp = Blueprint('main', __name__)
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
event_bp = Blueprint('event', __name__, url_prefix='/events')

# --- Auth Routes ---

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    is_organizer = data.get('is_organizer', False) # Optional flag

    if not username or not email or not password:
        return jsonify({"error": "Missing username, email, or password"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"error": "Username or email already exists"}), 409

    user = User(username=username, email=email, is_organizer=is_organizer)
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
        logger.info(f"User registered: {username} ({email})")
        # Optional: login user immediately after registration
        # login_user(user)
        return jsonify(user.serialize()), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registering user {username}: {e}")
        return jsonify({"error": "Registration failed"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier') # Can be username or email
    password = data.get('password')

    if not identifier or not password:
        return jsonify({"error": "Missing identifier or password"}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()

    if user and user.check_password(password):
        login_user(user, remember=True) # Remember session across browser restarts
        logger.info(f"User logged in: {user.username}")
        return jsonify({
             "message": "Login successful",
             "user": user.serialize()
        }), 200
    else:
        logger.warning(f"Failed login attempt for: {identifier}")
        return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/logout', methods=['POST'])
@login_required # Protect this route
def logout():
    logger.info(f"User logging out: {current_user.username}")
    logout_user()
    return jsonify({"message": "Logout successful"}), 200


@auth_bp.route('/status', methods=['GET'])
def session_status():
    if current_user.is_authenticated:
         return jsonify({
             "logged_in": True,
             "user": current_user.serialize()
         }), 200
    else:
         return jsonify({"logged_in": False}), 200


# --- Event Routes ---

@event_bp.route('', methods=['GET'])
def list_events():
    """List all upcoming events."""
    try:
        upcoming_events = Event.query.filter(Event.start_time > datetime.utcnow()).order_by(Event.start_time.asc()).all()
        return jsonify([e.serialize() for e in upcoming_events]), 200
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        return jsonify({"error": "Could not retrieve events"}), 500


@event_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get details for a specific event."""
    event = Event.query.get_or_404(event_id)
    return jsonify(event.serialize()), 200


@event_bp.route('', methods=['POST'])
@login_required # Only logged-in users can create events
def create_event():
    """Create a new event (only organizers should ideally do this)."""
    if not current_user.is_organizer:
         return jsonify({"error": "Only organizers can create events"}), 403

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    start_time_str = data.get('start_time') # Expect ISO format string e.g., "2023-10-27T10:00:00Z"
    end_time_str = data.get('end_time')   # Optional
    location = data.get('location')

    if not title or not start_time_str:
        return jsonify({"error": "Missing title or start time"}), 400

    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00')) # Parse ISO string
        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00')) if end_time_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)."}), 400

    event = Event(
        title=title,
        description=description,
        start_time=start_time,
        end_time=end_time,
        location=location,
        organizer_id=current_user.id
    )

    try:
        db.session.add(event)
        db.session.commit()
        logger.info(f"Event created: '{title}' by {current_user.username}")
        return jsonify(event.serialize()), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating event '{title}': {e}")
        return jsonify({"error": "Failed to create event"}), 500


@event_bp.route('/<int:event_id>', methods=['PUT'])
@login_required # Must be logged in
def update_event(event_id):
    """Update an existing event."""
    event = Event.query.get_or_404(event_id)

    # Check if the current user is the organizer of the event
    if event.organizer_id != current_user.id:
        return jsonify({"error": "Not authorized to update this event"}), 403

    data = request.get_json()

    # Update fields if they are provided in the request
    if 'title' in data: event.title = data['title']
    if 'description' in data: event.description = data['description']
    if 'location' in data: event.location = data['location']
    if 'start_time' in data:
        try:
            event.start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        except ValueError:
             return jsonify({"error": "Invalid start date format."}), 400
    if 'end_time' in data:
         try:
            event.end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00')) if data['end_time'] else None
         except ValueError:
             return jsonify({"error": "Invalid end date format."}), 400

    try:
        db.session.commit()
        logger.info(f"Event updated: ID {event_id} by {current_user.username}")
        return jsonify(event.serialize()), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating event ID {event_id}: {e}")
        return jsonify({"error": "Failed to update event"}), 500


@event_bp.route('/<int:event_id>', methods=['DELETE'])
@login_required # Must be logged in
def delete_event(event_id):
    """Delete an event."""
    event = Event.query.get_or_404(event_id)

    # Check if the current user is the organizer
    if event.organizer_id != current_user.id:
        return jsonify({"error": "Not authorized to delete this event"}), 403

    try:
        # Registrations are cascaded delete due to model definition
        db.session.delete(event)
        db.session.commit()
        logger.info(f"Event deleted: ID {event_id} by {current_user.username}")
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting event ID {event_id}: {e}")
        return jsonify({"error": "Failed to delete event"}), 500


# --- Registration Routes ---

@event_bp.route('/<int:event_id>/register', methods=['POST'])
@login_required # User must be logged in to register
def register_for_event(event_id):
    """Register the current user for an event."""
    event = Event.query.get_or_404(event_id)

    # Check if already registered
    existing_registration = Registration.query.filter_by(user_id=current_user.id, event_id=event_id).first()
    if existing_registration:
        return jsonify({"message": "Already registered for this event"}), 409 # Conflict

    registration = Registration(user_id=current_user.id, event_id=event_id)

    try:
        db.session.add(registration)
        db.session.commit()
        logger.info(f"User {current_user.username} registered for event ID {event_id}")

        # Send confirmation email
        send_email(
            subject=f"Registration Confirmed for {event.title}",
            recipients=[current_user.email],
            text_body=registration_confirmation_email_text(current_user, event),
            html_body=registration_confirmation_email_html(current_user, event)
        )

        return jsonify(registration.serialize()), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registering user {current_user.username} for event ID {event_id}: {e}")
        return jsonify({"error": "Registration failed"}), 500


@event_bp.route('/<int:event_id>/unregister', methods=['POST'])
@login_required
def unregister_from_event(event_id):
    """Unregister the current user from an event."""
    registration = Registration.query.filter_by(user_id=current_user.id, event_id=event_id).first()

    if not registration:
        return jsonify({"error": "Not registered for this event"}), 404

    try:
        db.session.delete(registration)
        db.session.commit()
        logger.info(f"User {current_user.username} unregistered from event ID {event_id}")
        return jsonify({"message": "Successfully unregistered"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error unregistering user {current_user.username} from event ID {event_id}: {e}")
        return jsonify({"error": "Unregistration failed"}), 500


@event_bp.route('/<int:event_id>/attendees', methods=['GET'])
@login_required
def get_event_attendees(event_id):
    """Get list of attendees for an event (only organizer)."""
    event = Event.query.get_or_404(event_id)

    # Only the organizer can see the attendee list
    if event.organizer_id != current_user.id:
         return jsonify({"error": "Not authorized to view attendees"}), 403

    registrations = Registration.query.filter_by(event_id=event_id).all()
    attendees = [reg.attendee.serialize() for reg in registrations if reg.attendee] # Ensure attendee exists
    return jsonify(attendees), 200


# --- Organizer Specific Routes ---

@main_bp.route('/my-events', methods=['GET'])
@login_required
def get_my_organized_events():
    """Get events organized by the current user."""
    if not current_user.is_organizer:
        return jsonify({"error": "User is not an organizer"}), 403

    organized_events = Event.query.filter_by(organizer_id=current_user.id).order_by(Event.start_time.desc()).all()
    return jsonify([e.serialize() for e in organized_events]), 200


@main_bp.route('/my-registrations', methods=['GET'])
@login_required
def get_my_registrations():
    """Get events the current user is registered for."""
    user_registrations = Registration.query.filter_by(user_id=current_user.id).join(Event).order_by(Event.start_time.asc()).all()
    registered_events = [reg.event.serialize() for reg in user_registrations if reg.event] # Get the event details
    return jsonify(registered_events), 200


# --- Reminder Task (Example - Trigger Manually or via Scheduler) ---
# This route can be called by a scheduled task (e.g., Cron, GitHub Actions)
@main_bp.route('/send-reminders', methods=['POST'])
def send_reminders():
    # Optional: Add a secret key check if calling externally
    # secret = request.headers.get('X-Scheduler-Secret')
    # if secret != current_app.config.get('SCHEDULER_SECRET'):
    #    logger.warning("Unauthorized attempt to send reminders.")
    #    return jsonify({"error": "Unauthorized"}), 403

    logger.info("Reminder task started.")
    now = datetime.utcnow()
    reminder_window_start = now - timedelta(minutes=5) # Start checking slightly before the hour
    reminder_window_end = now + timedelta(hours=1, minutes=5) # Check up to 1 hour 5 mins from now

    # Find events starting in ~1 hour
    events_needing_reminders = Event.query.filter(
        Event.start_time >= reminder_window_start,
        Event.start_time <= reminder_window_end
    ).all()

    sent_count = 0
    for event in events_needing_reminders:
        # Find registrations for this event where reminder hasn't been sent
        registrations_to_notify = Registration.query.filter_by(
            event_id=event.id,
            reminder_sent=False
        ).all()

        if not registrations_to_notify:
            continue

        logger.info(f"Sending reminders for event: {event.title} (ID: {event.id})")
        for reg in registrations_to_notify:
            if reg.attendee: # Make sure the attendee user still exists
                try:
                    send_email(
                        subject=f"Reminder: {event.title} is starting soon!",
                        recipients=[reg.attendee.email],
                        text_body=event_reminder_email_text(reg.attendee, event),
                        html_body=event_reminder_email_html(reg.attendee, event)
                    )
                    reg.reminder_sent = True # Mark as sent
                    db.session.add(reg) # Stage the change
                    sent_count += 1
                    logger.debug(f"Reminder email queued for {reg.attendee.email} for event {event.id}")
                except Exception as e:
                     logger.error(f"Failed sending reminder to {reg.attendee.email} for event {event.id}: {e}")

        # Commit changes for reminder_sent flags after processing each event's registrations
        try:
           db.session.commit()
           logger.info(f"Committed reminder status updates for event {event.id}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error committing reminder status for event {event.id}: {e}")


    logger.info(f"Reminder task finished. Sent {sent_count} reminders.")
    return jsonify({"message": f"Reminder task executed. Sent {sent_count} reminders."}), 200