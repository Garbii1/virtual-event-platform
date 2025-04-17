# backend/models.py
from datetime import datetime, timedelta
from extensions import db, bcrypt
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_organizer = db.Column(db.Boolean, default=False) # Differentiates organizers
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    events_organized = db.relationship('Event', backref='organizer', lazy=True, foreign_keys='Event.organizer_id')
    registrations = db.relationship('Registration', backref='attendee', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_organizer': self.is_organizer,
            'created_at': self.created_at.isoformat()
        }


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    location = db.Column(db.String(200), nullable=True) # Could be URL for virtual events
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    registrations = db.relationship('Registration', backref='event', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Event {self.title}>'

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'location': self.location,
            'organizer_id': self.organizer_id,
            'organizer_username': self.organizer.username if self.organizer else 'N/A', # Include organizer username
            'created_at': self.created_at.isoformat(),
            'attendee_count': len(self.registrations) # Add attendee count
        }

    def is_upcoming(self):
        return self.start_time > datetime.utcnow()

    def needs_reminder(self):
        """Check if a reminder should be sent (e.g., 1 hour before)"""
        if not self.start_time:
            return False
        reminder_time = self.start_time - timedelta(hours=1)
        now = datetime.utcnow()
        # Check if current time is within a small window around the reminder time
        # to avoid issues with exact timing of cron jobs
        return reminder_time <= now < reminder_time + timedelta(minutes=5)


class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    reminder_sent = db.Column(db.Boolean, default=False) # Track if reminder was sent

    # Unique constraint to prevent double registration
    __table_args__ = (db.UniqueConstraint('user_id', 'event_id', name='_user_event_uc'),)

    def __repr__(self):
        return f'<Registration user={self.user_id} event={self.event_id}>'

    def serialize(self):
         return {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'attendee_username': self.attendee.username if self.attendee else 'N/A',
            'event_title': self.event.title if self.event else 'N/A',
            'registered_at': self.registered_at.isoformat(),
            'reminder_sent': self.reminder_sent
        }