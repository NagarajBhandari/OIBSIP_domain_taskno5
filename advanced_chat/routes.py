from flask import render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db, socketio, login_manager
from models import User, Message
from flask_socketio import send

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

from flask import render_template
from app import app

@app.route("/")
def home():
    return render_template("index.html")


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if User.query.filter_by(username=username).first():
            flash("Username already exists!", "danger")
            return redirect(url_for('register'))
        hashed_pw = generate_password_hash(password)
        user = User(username=username, password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        flash("Registration successful! Please log in.", "success")
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('chat'))
        else:
            flash("Invalid credentials", "danger")
    return render_template('login.html')

@app.route('/chat')
@login_required
def chat():
    messages = Message.query.all()
    return render_template('chat.html', messages=messages, username=current_user.username)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@socketio.on('message')
def handleMessage(msg):
    if current_user.is_authenticated:
        message = Message(content=msg, user_id=current_user.id)
        db.session.add(message)
        db.session.commit()
        send(f"{current_user.username}: {msg}", broadcast=True)
