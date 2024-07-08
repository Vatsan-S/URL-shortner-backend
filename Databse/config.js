import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDB_URL = process.env.MONGODB_URL;

const connectDB = async (req, res) => {
  try {
    const connection = await mongoose.connect(mongoDB_URL);
    console.log("DB connected successfully");
    return connection
  } catch (error) {
    console.log("DB connection error",error)
  }
};


export default connectDB;