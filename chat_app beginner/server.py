import socket

# Server configuration
HOST = '127.0.0.1'  # Localhost
PORT = 55555        # Port to listen on

# Create socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((HOST, PORT))
server_socket.listen()

print(f"📡 Server started on {HOST}:{PORT}. Waiting for connection...")

conn, addr = server_socket.accept()
print(f"✅ Connected by {addr}")

while True:
    # Receive message from client
    data = conn.recv(1024).decode()
    if not data:
        break
    print(f"Client: {data}")

    # Send reply to client
    msg = input("You: ")
    conn.send(msg.encode())

conn.close()
