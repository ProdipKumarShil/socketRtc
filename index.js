const express = require('express')
const http = require('http');
const Server = require('socket.io').Server
const app = express()
const port = process.env.PORT || 5000;

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

// for test server
app.get('/', (req, res) => {
  res.send('Hello')
})

app.get("/hello", (req, res) => {
  res.send("Hello World, 11");
});
// for test server



io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

server.listen(port, () => console.log(`listening on port ${port}`))