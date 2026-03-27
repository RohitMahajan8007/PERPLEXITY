import { io } from "socket.io-client";


export const initializeSocketConnection = () => {

    const socketURL = window.location.hostname === "localhost" ? "http://localhost:3000" : window.location.origin;
    const socket = io(socketURL, {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server")
    })

}