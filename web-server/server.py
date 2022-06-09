import socket
from _thread import start_new_thread
from dataclasses import dataclass
from typing import Optional
import json
import threading

global rooms
rooms = {}
global room_lock
room_lock = threading.Lock()
global cnt
cnt = int(0)

@dataclass
class qnt_pkt_header:
    opcode: int
    length: int
    def __init__(self, opcode: int, length: int):
        self.opcode = opcode
        self.length = length

@dataclass
class qnt_pkt_generic:
    header: qnt_pkt_header
    payload: Optional[str] = None

class qnt_pkt_error:
    header: qnt_pkt_header
    error_code: int
    def __init__(self, header: qnt_pkt_header, error_code: int):
        self.header = header
        self.error_code = error_code
    def get_error(self):
        return str(err_codes[str(hex(self.error_code))]).encode()

class qnt_pkt_join_room:
    header: qnt_pkt_header
    room_name: str

    def __init__(self, header: qnt_pkt_header, room_name: str):
        self.header = header
        self.room_name = room_name
        if not (room_name in rooms):
            rooms[room_name] = set()

    def join(self, connection):
        with room_lock:
            rooms[self.room_name].add(connection)

class qnt_pkt_send_msg:
    header: qnt_pkt_header
    room_name: str
    msg: str
    def __init__(self, header: qnt_pkt_header, room_name: str, msg: str):
        self.header = header
        self.room_name = room_name
        self.msg = msg

    def send(self, connection):
        global cnt
        resp = '{"opcode": "QNT_OPCODE_TELL_CHAT", "user_name":"' + userInfo[connection]["user_name"] +'", "room_name":"' + self.room_name + '", "msg_num": "' + str(cnt) + '", "msg": "' + self.msg + '"}';
        cnt += 1;
        with room_lock:
            for c in rooms[self.room_name]:
                c.sendall(resp.encode())
        
class qnt_pkt_list_rooms_resp:
    header: qnt_pkt_header
    rooms: list

    def __init__(self, header: qnt_pkt_header):
        self.header = header
        self.rooms = []

    def getRooms(self):
        for key in list(rooms):
            self.rooms.append(key);
        return ", ".join(self.rooms)

class qnt_pkt_leave_room:
    header: qnt_pkt_header
    room_name: str

    def __init__(self, header: qnt_pkt_header, room_name: str):
        self.header = header
        self.room_name = room_name


    def leave(self, connection):
        was_found = False
        with room_lock:
            if not self.room_name in rooms:
                return
            if connection in rooms[self.room_name]:
                was_found = True
                rooms[self.room_name].remove(connection)
        if was_found and len(rooms[self.room_name]) == 0:
            del rooms[self.room_name]
        elif was_found:
            send = qnt_pkt_send_msg(qnt_pkt_header(int("0x10000007", 16), 20), self.room_name, "User has left the channel")
            send.send(connection);


@dataclass
class qnt_pkt_keepalive:
    header: qnt_pkt_header


opcodes = {
        "QNT_OPCODE_ERR": "0x10000001",
        "QNT_OPCODE_KEEPALIVE": "0x10000002",
        "QNT_OPCODE_HELLO": "0x10000003",
        "QNT_OPCODE_LIST_ROOMS": "0x10000004",
        "QNT_OPCODE_LIST_ROOMS_RESP": "0x10000005",
        "QNT_OPCODE_LIST_USERS": "0x10000006",
        "QNT_OPCODE_LIST_USERS_RESP": "0x10000007",
        "QNT_OPCODE_JOIN_ROOM": "0x10000008",
        "QNT_OPCODE_LEAVE_ROOM": "0x10000009",
        "QNT_OPCODE_AWAIT_MOVE": "0x100000010",
        "QNT_OPCODE_AWAIT_MOVE_RESP": "0x100000011",
        "QNT_OPCODE_UPDATE_BOARD": "0x100000012",
        "QNT_OPCODE_UPDATE_BOARD_RESP": "0x100000013",
        "QNT_OPCODE_SEND_CHAT": "0x100000014",
        "QNT_OPCODE_TELL_CHAT": "0x100000015"
}

err_codes = {
        "0x10000001": "QNT_ERR_UNKNOWN",
        "0x10000002": "QNT_ERR_ILLEGAL_OPCODE",
        "0x10000003": "QNT_ERR_ILLEGAL_LENGTH",
        "0x10000004": "QNT_ERR_NAME_EXISTS",
        "0x10000005": "QNT_ERR_ILLEGAL_NAME",
        "0x10000006": "QNT_ERR_ILLEGAL_MOVE",
        "0x10000007": "QNT_ERR_ILLEGAL_CHAT",
        "0x10000008": "QNT_ERR_TOO_MANY_PLAYERS",
        "0x10000009": "QNT_ERR_TOO_MANY_SPECTS",
        "0x10000010":"QNT_ERR_TOO_MANY_ROOMS",
        "0x10000011": "QNT_ERR_WRONG_VERSION"
}

clients = set()
global userInfo;
userInfo = {}
clients_lock = threading.Lock()
global num_users;
num_users = 0;

s = socket.socket()
host = '127.0.0.1'
port = 5432

try:
    s.bind((host, port))

except socket.error as e:
    print(str(e))

print('Waiting for a connection...')
s.listen(5)

def threaded_client(connection, address):
    global num_users
    print('Accepting connections from: ', address)
    #connection.send(str.encode('Connected to server\n'));
    with clients_lock:
        clients.add(connection)
        userInfo[connection] = {}
        userInfo[connection]["user_name"] = "User" + str(num_users);
        num_users += 1
    try:
        while True:
            data = connection.recv(2048)
            if not data:
                break
            else:
                print(data)
                try:
                    temp_data = data.decode('utf-8').strip()
                    temp_data = json.loads(temp_data)
                    print(temp_data["opcode"])
                except:
                    connection.send(err_codes["0x10000002"].encode());
                    break
                handle_message(connection, temp_data)
    finally:
        close_connection(connection)

def close_connection(connection):
    with clients_lock:
        for key in list(rooms):
            if connection in rooms[key]:
                rooms[key].remove(connection)
                if len(rooms[key]) == 0:
                    del rooms[key]
        clients.remove(connection)
        connection.close()

def handle_message(connection, message):
    reqd_ver = "0.1.0";
    if message["opcode"] == 'QNT_OPCODE_HELLO':
        if message["ver_magic"] != reqd_ver:
            resp = qnt_pkt_error(qnt_pkt_header(int(opcodes[message["opcode"]], 16), 4), int("0x10000011", 16))
            connection.send(resp.get_error());
            close_connection(connection);
        #else:
        #    connection.send(b'{"opcode": "QNT_OPCODE_KEEPALIVE", "length": 0}')
    elif message["opcode"] == 'QNT_OPCODE_JOIN_ROOM':
        join = qnt_pkt_join_room(qnt_pkt_header(int(opcodes[message["opcode"]], 16), 20), message["room_name"])
        join.join(connection)
    elif message["opcode"] == 'QNT_OPCODE_SEND_CHAT':
        send = qnt_pkt_send_msg(qnt_pkt_header(int(opcodes[message["opcode"]], 16), 0), message["room_name"], message["msg"]);
        send.send(connection);
    elif message["opcode"] == 'QNT_OPCODE_LIST_ROOMS':
        list_rooms = qnt_pkt_list_rooms_resp(qnt_pkt_header(int("0x10000005", 16), 0));
        connection.send(list_rooms.getRooms().encode());
    elif message["opcode"] == 'QNT_OPCODE_LEAVE_ROOM':
        leave = qnt_pkt_leave_room(qnt_pkt_header(int(opcodes[message["opcode"]], 16), 20), message["room_name"])
        leave.leave(connection)
    else:
        send_multi_client(message)

def send_multi_client(message):
    with clients_lock:
        for c in clients:
            c.sendall(message)

while True:
    Client, address = s.accept()
    print('Connected to: ' +address[0] + ":" + str(address[1]))
    start_new_thread(threaded_client, (Client, address))
