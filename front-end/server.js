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
let rooms;
let s_arr = {}

const setupSocket = (sessionID) => {
    s = new net.Socket();
    console.log('New socket created');
    s_arr[sessionID] = s;
    s_arr[sessionID].connect({port: 5432, host: '127.0.0.1' }, function() {
      console.log('TCP connection established with the server.');
    })

    s_arr[sessionID].on('data', function(chunk) {
      console.log(`Data received from the server: ${chunk.toString()}.`);
      rooms = chunk.toString();
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
  res.render("index");
  console.log(req.sessionID.toString());
  if (!(req.sessionID in s_arr)) {
    setupSocket(req.sessionID);
  }
  s_arr[req.sessionID].write('{"opcode": "QNT_OPCODE_HELLO", "length": 24, "ver_magic": "0.1.0"}');
});

app.post("/join", (req, _res) => {
  if (!(req.sessionID in s_arr)) {
    setupSocket(req.sessionID);
  }
  console.log(req.body);
  s_arr[req.sessionID].write(`{"opcode": "QNT_OPCODE_JOIN_ROOM", "room_name": "${req.body.room_name}"}`);
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
  console.log(rooms)
  res.send(rooms);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

