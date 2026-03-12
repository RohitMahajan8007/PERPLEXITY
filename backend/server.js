import "dotenv/config";
import app from "./Src/app.js";
import connectDB from "./Src/config/database.js";
// import { testAi } from "./Src/services/ai.service.js";


const PORT = process.env.PORT || 3000;

// testAi();
connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
