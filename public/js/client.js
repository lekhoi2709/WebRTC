// Web socket: Chat room
const socket = io();

// enter room with id and username
socket.emit("join-room", ROOM_ID, USER)

// Get element section
const message = document.getElementById("message")
const button = document.getElementById("button")
const output = document.getElementById("output-message")
const typing = document.getElementById("typing")

output.innerHTML += '<p><strong>' + "Room ID: " + ROOM_ID + '</strong></p>'

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
var peer = new Peer()
var peerConnection
var peer_id

// Peer id
peer.on('open', function (id) {
   console.log(id)
   output.innerHTML += "<p>Your connection ID: <br>" + id + "</p>"
})

peer.on("connection", function (conn) {
   peerConnection = conn
   peer_id = conn.peer

   document.getElementById("connId").value = peer_id
})

peer.on("error", function (err) {
   console.log(err)
})

// start connection
document.getElementById("connect").addEventListener('click', function () {
   peer_id = document.getElementById("connId").value

   if (peer_id) {
      peerConnection = peer.connect(peer_id)
   } else {
      alert("You must connect with another user id to start a call.")
      return false
   }
})

// Get local stream and attact it to video element
var localStream
var remoteStream
var constraint = {
   audio: true,
   video: true
}

function getVideo(stream, element) {
   var vidEle = document.getElementById(element)

   if ("srcObject" in vidEle) {
      vidEle.srcObject = stream
   } else {
      vidEle.src = window.URL.createObjectURL(stream)
   }

   vidEle.onloadeddata = function (e) {
      vidEle.play()
   }
}

var mediaDevices = navigator.mediaDevices
if (!mediaDevices || !mediaDevices.getUserMedia) {
   output.innerHTML += "<p>Your device is not supported</p>"
}

mediaDevices.getUserMedia(constraint).then(function (stream) {
   localStream = stream
   getVideo(localStream, "local-vid")
}).catch(function (e) {
   console.log(e)
})

// received Call
peer.on("call", function (call) {
   const r = confirm('Do you want to accept this call?')
   if (r) {
      call.answer(localStream)

      call.on("stream", function (rStream) {
         remoteStream = rStream
         getVideo(remoteStream, "remote-vid")
      })

      call.on("close", function () {
         alert("The call has ended!")
      })
   } else {
      alert("Call denied")
   }
})

// start a call
document.getElementById("call").addEventListener("click", function () {
   console.log(peer_id)
   console.log(peer)

   var call = peer.call(peer_id, localStream)

   call.on("stream", function (stream) {
      remoteStream = stream
      getVideo(remoteStream, "remote-vid")
   })
})