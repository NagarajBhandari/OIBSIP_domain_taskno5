# 💬 Advanced Chat (Flask + Socket.IO)

Real-time chat with authentication, multiple rooms, media sharing, message history, emojis, and desktop notifications.

## Features
- User registration & login (hashed passwords)
- Multiple chat rooms
- Real-time messaging via Socket.IO
- Message history (DB)
- Upload images/videos with preview
- Emoji picker (Unicode)
- Browser notifications for new messages
- Secure uploads (allow-list + size cap)
- Production-ready structure

## Quickstart
```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python db.py
python app.py
