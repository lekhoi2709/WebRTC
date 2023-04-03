const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const ShortUniqueId = require("short-unique-id")
require("dotenv").config()

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
   return res.render("home");
});

app.post("/", (req, res) => {
   const { roomId, name } = req.body
   if (name && roomId) {
      return res.redirect(`/${roomId}?name=${name}`);
   } else if (roomId === "") {
      const suid = new ShortUniqueId({ length: 10 })
      const newid = suid()
      return res.redirect(`/${newid}?name=${name}`)
   }
   return res.redirect("/")
})

app.get("/:room", (req, res) => {
   res.render("room", { roomId: req.params.room, user: req.query.name });
})

io.on("connection", (socket) => {
   console.log("A client has connected: " + socket.id);

   socket.on("join-room", (roomId, user) => {
      socket.join(roomId)
      io.to(roomId).emit("user-connected", user)
   })

   socket.on("user-typing", (roomId, data) => {
      socket.join(roomId)
      socket.broadcast.to(roomId).emit("typing", data)
   })

   socket.on("user-message", (roomId, data) => {
      socket.join(roomId)
      io.to(roomId).emit("message", data)
   })

   // socket.on('disconnect', (roomId, user) => {
   //    console.log("A client has disconnected: " + socket.id)
   //    io.to(roomId).emit("leave-room", user)
   //    socket.leave(roomId)
   // })
});

app.use((_req, res) => {
   res.status(400).send("404 Not Found");
});

app.use((_err, _req, res, _next) => {
   res.status(500).send("500 Error");
});

if (process.env.NODE_ENV === "development") {
   httpServer.listen(process.env.PORT, () => console.log(`Server started at http://localhost:` + process.env.PORT));
}

else {
   httpServer.listen(process.env.PORT, () => console.log("Server started"));
}
