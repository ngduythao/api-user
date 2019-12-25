const io = require('socket.io')();
const socketApi = {};

socketApi.io = io;

io.on('connection', (socket) => {
    console.log('A user connected');    
    /******************* ROOM *******************/
    /* Join room */
    socket.on('join-room', (roomId) => {
        console.log(`Has joined room ${roomId}`);
        socket.join(room.id)
        // socket.roomId = room.id;
    })
    /******************* CHAT *******************/
    socket.on('client-send-message', (roomId, message) => {
        socket.to(roomId).emit('guest-request-chat', message);
    })
});


module.exports = socketApi;