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

// Peer, call video
var localStream

function getLocalVideo() {
   var constraint = {
      audio: true,
      video: true
   }

   var mediaDevices = navigator.mediaDevices
   if (!mediaDevices || !mediaDevices.getUserMedia) {
      console.log("getUserMedia() not supported")
      return
   }

   mediaDevices.getUserMedia(constraint).then(function (stream) {
      var localVideo = document.getElementById("local-vid")
      localStream = stream

      if ("srcObject" in localVideo) {
         localVideo.srcObject = localStream
      } else {
         localVideo.src = window.URL.createObjectURL(localStream)
      }

      localVideo.onloadeddata = function (e) {
         localVideo.play()
      }
   }).catch(function (e) {
      console.log(e)
   })
}

getLocalVideo()