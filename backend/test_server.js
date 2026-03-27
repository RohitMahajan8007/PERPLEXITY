console.log("--- TEST SERVER ---");
import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

const PORT = 3001; // Different port for testing
const httpServer = http.createServer(app);

initSocket(httpServer);
console.log("DB URL (masked):", (process.env.MONGODB_URI || "MISSING").substring(0, 20) + "...");

const start = async () => {
    try {
        console.log("Connecting...");
        await connectDB();
        console.log("Starting...");
        httpServer.listen(PORT, () => console.log(`Test server on ${PORT}`));
    } catch (err) {
        console.error("FAIL:", err.message);
    }
};

start();
