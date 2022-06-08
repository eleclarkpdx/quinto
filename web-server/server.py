import socket
from _thread import start_new_thread
from dataclasses import dataclass
from typing import Optional
import json
import threading

@dataclass
class qnt_pkt_header:
    opcode: int
    length: int

@dataclass
class qnt_pkt_generic:
    header: qnt_pkt_header
    payload: Optional[str] = None

opcodes = {
        "0x10000001": "QNT_OPCODE_ERR"
}

clients = set()
clients_lock = threading.Lock()

s = socket.socket()
host = '127.0.0.1'
port = 5432
ThreadCount = 0

try:
    s.bind((host, port))

except socket.error as e:
    print(str(e))

print('Waiting for a connection...')
s.listen(5)

def threaded_client(connection, address):
    print('Accepting connections from: ', address)
    connection.send(str.encode('Connected to server\n'));
    with clients_lock:
        clients.add(connection)
        print("lock")
    try:
        while True:
            data = connection.recv(2048)
            if not data:
                print("break")
                break
            else:
                print(data)
                temp_data = data.decode('utf-8').strip()
                temp_data = json.loads(temp_data)
                print(temp_data["opcode"])
                if temp_data["opcode"] in opcodes:
                    handle_message(json.dumps(temp_data).encode())
                else:
                    handle_message(b'Invalid Opcode')
    finally:
        print("finally")
        with clients_lock:
            clients.remove(connection)
            connection.close()

def handle_message(message):
    with clients_lock:
        for c in clients:
            c.sendall(message)

while True:
    Client, address = s.accept()
    print('Connected to: ' +address[0] + ":" + str(address[1]))
    start_new_thread(threaded_client, (Client, address))
    ThreadCount += 1
    print('\tThread Number: ' + str(ThreadCount))
