import "dotenv/config";
import app from "./Src/app.js";
import connectDB from "./Src/config/database.js";


const PORT = process.env.PORT || 3000;

connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
