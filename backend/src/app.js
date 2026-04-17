import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.resolve(__dirname, "../public");

// 1. Enhanced Logger at the top to catch ALL requests
app.use(morgan("dev"));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('origin')}`);
    next();
});

// 2. Trust Proxy for Render
app.set('trust proxy', 1);

// 3. CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ];

      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        callback(null, true);
      } else {
        console.warn("CORS REJECTED for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

// 4. Debug Routes
app.get("/health", (req, res) => res.json({ message: "Server is running", time: new Date() }));
app.get("/api/ping", (req, res) => res.json({ status: "alive" }));

app.get("/ping", (req, res) => {
  res.send("Server is alive");
});

// 5. API Routers
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// 6. Static Serving (Moved after API to avoid conflicts)
app.use(express.static(publicPath));

// 7. SPA Catch-all
app.get(/^(?!\/api).*/, (req, res) => {
  const filePath = path.join(publicPath, "index.html");
  res.sendFile(filePath, (err) => {
      if (err) {
          console.error("Error sending index.html:", err.message);
          res.status(500).json({ error: "Could not load index.html" });
      }
  });
});

// 404 Handler for API routes specifically
app.use("/api", (req, res) => {
    console.warn(`API NOT FOUND: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: "API route not found", path: req.originalUrl });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    success: false
  });
});

export default app;
