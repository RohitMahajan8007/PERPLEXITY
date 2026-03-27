import { Server } from "socket.io";

let io;

export function initSocket(httpServer){
    io = new Server(httpServer, {
  cors: {
    origin: [
        'http://localhost:5173',
         "https://perplexity-jl3x.onrender.com"
    ],
    credentials: true   
  }
});

    console.log("socket io server is running..")

    io.on('connection', (socket) => {
        console.log('a user connected' + socket.id);
})
}

export function getIO(){
    if(!io){
        throw new Error('Socket.io not initialized');
    }
    return io;
}
