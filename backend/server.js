console.log("--- STARTING SERVER.JS ---");
import "dotenv/config";
import app from "./src/app.js"
import connectDB from "./src/config/database.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";


const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

initSocket(httpServer);
console.log("DB URL (masked):", (process.env.MONGODB_URI || "MISSING").substring(0, 20) + "...");

const startServer = async () => {
    try {
        await connectDB();
        console.log("Database connected, starting server...");
        
        httpServer.listen(PORT, () => {
            console.log(`Server is now running on http://127.0.0.1:${PORT}`);
        });
    } catch (err) {
        console.error("FAILED TO START SERVER:", err.message);
        process.exit(1);
    }
};

startServer();
 
