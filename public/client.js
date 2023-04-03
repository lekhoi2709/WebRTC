// Web socket: Chat room
const socket = io();

// enter room with id and username
socket.emit("join-room", ROOM_ID, USER)

// Get element section
const message = document.getElementById("message")
const button = document.getElementById("button")
const output = document.getElementById("output-message")
const typing = document.getElementById("typing")

// add event on typing message
message.addEventListener("keypress", function (event) {
   socket.emit("user-typing", ROOM_ID, USER)
   if (event.key === "Enter") {
      event.preventDefault();
      button.click();
   }
});

// click send message event
button.addEventListener('click', () => {
   socket.emit("user-message", ROOM_ID, {
      user: USER,
      message: message.value
   })
   message.value = ""
})

// on event
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

// PeerJS: Video call
// Create the Peer object
var peer = new Peer(ROOM_ID)

// Peer(room) id
peer.on('open', function (id) {
   console.log("My peer id: " + id)
   output.innerHTML += "<p>Your room ID: <br>" + id + "<br>" + "Copy it and send to your friends to connect. </p>"
})

// Get local stream and attact it to video element
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