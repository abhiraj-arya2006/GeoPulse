const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

const users = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    users[socket.id] = socket;

    socket.on("send-location", ({ latitude, longitude }) => {
        io.emit("receive-location", {
            id: socket.id,
            latitude,
            longitude,
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        io.emit("user-disconnected", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});