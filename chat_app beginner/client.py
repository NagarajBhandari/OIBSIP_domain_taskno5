import socket

# Server connection settings
HOST = '127.0.0.1'  # Server IP (change if on another machine)
PORT = 55555

# Create socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((HOST, PORT))

print("✅ Connected to server. Type messages below.\n")

while True:
    # Send message to server
    msg = input("You: ")
    client_socket.send(msg.encode())

    # Receive reply from server
    data = client_socket.recv(1024).decode()
    print(f"Server: {data}")

client_socket.close()
