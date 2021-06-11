const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 5000;
const router = require("./router");
const cors=require('cors');
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, newUser } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }
    socket.emit("message", {
      user: "admin",
      text: `welcome ${newUser.name} to the room ${newUser.room}`,
    });
    socket.broadcast
      .to(newUser.room)
      .emit("message", { user: "admin", text: `${newUser.name} has joined` });
    socket.join(newUser.room);
    io.to(newUser.room).emit("roomData", {
      room: newUser.room,
      users: getUsersInRoom(newUser.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

app.use(router);
app.use(cors());

server.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});
