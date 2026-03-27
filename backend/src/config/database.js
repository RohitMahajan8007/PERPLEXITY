import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
        });
        console.log('MongoDB is connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
};

export default connectDB;