const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("CONNECTED TO DB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;
