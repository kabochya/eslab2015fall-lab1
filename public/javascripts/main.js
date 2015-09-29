var socket = io.connect('http://localhost:3000');
socket.on('connection',(data) => console.log(data))
socket.on('new post',(data) => console.log(data)
socket.on('hit',(data) => console.log(data))
socket.on('unhit',(data) => console.log(data))