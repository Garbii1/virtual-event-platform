# backend/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS
from flask import jsonify, current_app

db = SQLAlchemy()
mail = Mail()
bcrypt = Bcrypt()
migrate = Migrate()
login_manager = LoginManager()
cors = CORS()

# --- Add this Unauthorized Handler ---
@login_manager.unauthorized_handler
def unauthorized():
    """Custom handler for unauthorized API requests."""
    # Log the attempt
    current_app.logger.warning("Unauthorized API access attempt detected.")
    # Return a standard 401 JSON response
    return jsonify(error="Unauthorized", message="Authentication required."), 401

# Configure Flask-Login
# login_manager.login_view = 'auth.login' # The endpoint name for the login route
login_manager.login_message_category = 'info'
login_manager.session_protection = "strong"

# User loader function required by Flask-Login
@login_manager.user_loader
def load_user(user_id):
    from models import User # Import here to avoid circular imports
    return User.query.get(int(user_id))