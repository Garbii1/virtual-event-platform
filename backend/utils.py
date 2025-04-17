# backend/utils.py
from flask import current_app, render_template_string
from flask_mail import Message
from extensions import mail
from threading import Thread

# Function to send email asynchronously
def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            current_app.logger.info(f"Email sent successfully to {msg.recipients}")
        except Exception as e:
            current_app.logger.error(f"Failed to send email to {msg.recipients}: {e}")


def send_email(subject, recipients, text_body, html_body):
    """Helper function to send emails."""
    app = current_app._get_current_object() # Get the current app instance
    if not app.config.get('MAIL_USERNAME') or not app.config.get('MAIL_PASSWORD'):
         app.logger.warning("Mail credentials not configured. Skipping email.")
         return

    if not isinstance(recipients, list):
        recipients = [recipients]

    msg = Message(subject, recipients=recipients, sender=app.config['MAIL_DEFAULT_SENDER'])
    msg.body = text_body
    msg.html = html_body
    # Send email in a background thread to avoid blocking the request
    thread = Thread(target=send_async_email, args=[app, msg])
    thread.start()
    app.logger.info(f"Email sending initiated for subject: {subject} to {recipients}")


# --- Email Templates (can be moved to separate HTML files later) ---

def registration_confirmation_email_html(user, event):
    # Simple HTML template - Can be improved significantly
    return render_template_string("""
        <p>Hi {{ user.username }},</p>
        <p>You have successfully registered for the event: <strong>{{ event.title }}</strong>.</p>
        <p>Event Details:</p>
        <ul>
            <li><strong>Title:</strong> {{ event.title }}</li>
            <li><strong>Starts:</strong> {{ event.start_time.strftime('%Y-%m-%d %H:%M') }} UTC</li>
            {% if event.location %}<li><strong>Location/Link:</strong> {{ event.location }}</li>{% endif %}
        </ul>
        <p>We look forward to seeing you there!</p>
        <p>Best regards,<br>Your Virtual Event Platform</p>
    """, user=user, event=event)

def registration_confirmation_email_text(user, event):
    return render_template_string("""
        Hi {{ user.username }},

        You have successfully registered for the event: {{ event.title }}.

        Event Details:
        - Title: {{ event.title }}
        - Starts: {{ event.start_time.strftime('%Y-%m-%d %H:%M') }} UTC
        {% if event.location %}- Location/Link: {{ event.location }}{% endif %}

        We look forward to seeing you there!

        Best regards,
        Your Virtual Event Platform
    """, user=user, event=event)

def event_reminder_email_html(user, event):
    return render_template_string("""
        <p>Hi {{ user.username }},</p>
        <p>Just a friendly reminder that the event <strong>{{ event.title }}</strong> is starting soon!</p>
        <p>Event Details:</p>
        <ul>
            <li><strong>Title:</strong> {{ event.title }}</li>
            <li><strong>Starts:</strong> {{ event.start_time.strftime('%Y-%m-%d %H:%M') }} UTC</li>
            {% if event.location %}<li><strong>Location/Link:</strong> {{ event.location }}</li>{% endif %}
        </ul>
        <p>See you soon!</p>
        <p>Best regards,<br>Your Virtual Event Platform</p>
    """, user=user, event=event)

def event_reminder_email_text(user, event):
    return render_template_string("""
        Hi {{ user.username }},

        Just a friendly reminder that the event {{ event.title }} is starting soon!

        Event Details:
        - Title: {{ event.title }}
        - Starts: {{ event.start_time.strftime('%Y-%m-%d %H:%M') }} UTC
        {% if event.location %}- Location/Link: {{ event.location }}{% endif %}

        See you soon!

        Best regards,
        Your Virtual Event Platform
    """, user=user, event=event)