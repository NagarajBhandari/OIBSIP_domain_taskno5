from app import create_app, socketio  # reuse config/app context
from models import db

app = create_app()

with app.app_context():
    db.create_all()
    print("✅ Database initialized.")
