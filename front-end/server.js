const express = require("express");
const session = require("express-session")
const path = require("path");
const app = express();
const net = require('net');

app.set("view engine", "ejs");
const oneDay = 1000*60*60*24
app.use(express.json());
app.use(session({
  secret: "supersecretsessionkey",
  cookie: { maxAge: oneDay },
  resave: false
}))

app.use(express.static(path.join(__dirname, "public")));

let s;
let rooms = [];
let s_arr = {};
chat_str = {};

const setupSocket = (sessionID) => {
    s = new net.Socket();
    console.log('New socket created');
    s_arr[sessionID] = s;
    s_arr[sessionID].connect({port: 5432, host: '127.0.0.1' }, function() {
      console.log('TCP connection established with the server.');
      //s_arr[sessionID].write('{"opcode": "QNT_OPCODE_HELLO", "length": 24, "ver_magic": "0.1.0"}');
      s_arr[sessionID].write('{"opcode": "QNT_OPCODE_JOIN_ROOM", "room_name": "test"}');
    })

    s_arr[sessionID].on('data', function(chunk) {
      console.log(`Data received from the server: ${chunk.toString()}.`);
      if (chunk.toString().includes("QNT_OPCODE_TELL_CHAT")) {
        msg = JSON.parse(chunk.toString());
        message = msg.user_name + ": " + msg.msg;
        chat_str[msg.room_name][msg.msg_num] = message
        console.log(chat_str[msg.room_name])
      } else {
        rooms = chunk.toString().split(", ");
      }
    });

    s_arr[sessionID].on('end', function() {
      console.log("Connection to the server has been terminated.");
      delete s_arr[req.sessionID];
    });

    s_arr[sessionID].on('error', function(err) {
      console.log("An error has occured:", err.toString());
    });
}

app.get("/", (req, res) => {
  console.log(req.sessionID.toString());
  if (!(req.sessionID in s_arr)) {
    setupSocket(req.sessionID);
  }
  s_arr[req.sessionID].write('{"opcode": "QNT_OPCODE_LIST_ROOMS"}');
  res.render("index", {rooms: rooms});
});

app.post("/join", (req, _res) => {
  if (!(req.sessionID in s_arr)) {
    setupSocket(req.sessionID);
  }
  console.log(req.body);
  s_arr[req.sessionID].write(`{"opcode": "QNT_OPCODE_JOIN_ROOM", "room_name": "${req.body.room_name}"}`);
});

app.post("/messages", (req, res) => {
  console.log(req.body.room_name);
  res.send(chat_str[req.body.room_name]);
});

app.post("/message", (req, _res) => {
  if (!(req.sessionID in s_arr)) {
    setupSocket(req.sessionID);
  }
  s_arr[req.sessionID].write(`{"opcode": "QNT_OPCODE_SEND_CHAT", "room_name": "${req.body.room_name}", "msg": "${req.body.msg}"}`);
});

app.get("/list_rooms", (req, res) => {
  if (!(req.sessionID in s_arr)) {
    setupSocket(req.sessionID);
  }
  s_arr[req.sessionID].write(`{"opcode": "QNT_OPCODE_LIST_ROOMS"}`)
  rooms.forEach((item) => {
    if (!(item in chat_str)) {
      chat_str[item] = {};
    }
  });
  res.send(rooms);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

