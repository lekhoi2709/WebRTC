const socket = io();
// const peerConnection = new Peer(undefined, {
//    host: "localhost",
//    port: "3001",
// });

socket.emit("join-room", ROOM_ID, USER)

const message = document.getElementById("message")
const button = document.getElementById("button")
const output = document.getElementById("output-message")
const typing = document.getElementById("typing")
// const home = document.getElementById("home")

message.addEventListener("keypress", function (event) {
   socket.emit("user-typing", ROOM_ID, USER)
   if (event.key === "Enter") {
      event.preventDefault();
      button.click();
   }
});



button.addEventListener('click', () => {
   socket.emit("user-message", ROOM_ID, {
      user: USER,
      message: message.value
   })
   message.value = ""
})

// home.addEventListener('click', () => {
//    socket.emit("disconnect", ROOM_ID, USER)
//    socket.on("leave-room", (username) => {
//       output.innerHTML += '<p><strong>' + username + ' has left this room' + '</strong></p>'
//    });
// })

// peerConnection.on("open", (userId) => {
//   socket.emit("join-room", ROOM_ID, userId);
// });

socket.on("user-connected", (username) => {
   output.innerHTML += '<p><strong>' + username + ' has joined this room' + '</strong></p>'
});

socket.on("message", (data) => {
   typing.innerHTML = ""
   output.innerHTML += '<p><strong>' + data.user + ': </strong>' + data.message + '</p>'
})

socket.on("typing", (data) => {
   typing.innerHTML = '<p><em>' + data + ' is typing ...' + "</em></p>"
})
