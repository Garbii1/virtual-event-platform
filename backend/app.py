# backend/app.py
import os
import logging
from flask import Flask, jsonify, request
from config import config_by_name, get_secret_key
from extensions import db, mail, bcrypt, migrate, login_manager, cors
from routes import main_bp, auth_bp, event_bp
from models import User # Make sure models are imported before db.create_all if used

def create_app(config_name=None):
    """Application Factory Function"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development').lower()

    app = Flask(__name__)
    try:
         app.config.from_object(config_by_name[config_name])
    except KeyError:
         # Fallback or raise a more specific error if the config name is invalid
         app.logger.error(f"Invalid configuration name: '{config_name}'. Falling back to development.")
         config_name = 'development'
         app.config.from_object(config_by_name[config_name])

    # Ensure SECRET_KEY is set
    app.config['SECRET_KEY'] = get_secret_key()

    # Setup logging
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
    app.logger.info(f"App created with config: {config_name}")
    app.logger.info(f"Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI')}") # Log DB URI (be careful in prod)
    app.logger.info(f"Frontend URL for CORS: {app.config.get('FRONTEND_URL')}")


    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Configure CORS more specifically
    cors.init_app(app,
              origins=[app.config.get('FRONTEND_URL', 'http://localhost:4200')], # Explicitly allow frontend origin
              supports_credentials=True) # Crucial for sending/receiving session cookies


    # Register Blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(event_bp)

    # Define a simple root route for health check or basic info
    @app.route('/')
    def index():
        return jsonify({"message": "Welcome to the Virtual Event Platform API!"})

    # Shell context for Flask CLI
    @app.shell_context_processor
    def make_shell_context():
        return {'db': db, 'User': User, 'Event': Event, 'Registration': Registration}

    # Global error handlers (optional but good practice)
    @app.errorhandler(404)
    def not_found_error(error):
        app.logger.warning(f"404 Not Found: {request.path}")
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"500 Internal Server Error: {error}", exc_info=True)
        db.session.rollback() # Rollback session in case of DB errors
        return jsonify({"error": "Internal Server Error"}), 500

    return app

# Create the app instance for Gunicorn/development server
# This is referenced by the `gunicorn app:app` command
app = create_app()

if __name__ == '__main__':
    # Run in debug mode for development
    # Note: Flask's built-in server is not for production!
    app.run(debug=True, port=5000) # Port 5000 is common for Flask dev