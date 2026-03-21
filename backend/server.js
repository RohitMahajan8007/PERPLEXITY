import "dotenv/config";
import app from "./Src/app.js";
import connectDB from "./Src/config/database.js";
import http from "http";
import { initSocket } from "./Src/Sockets/server.socket.js";


const PORT = process.env.PORT || 3000;


const httpServer = http.createServer(app);

initSocket(httpServer);
connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
