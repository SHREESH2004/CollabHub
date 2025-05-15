import mongoose from "mongoose";
const uri = 'mongodb://localhost:27017/CollabHub';

async function connectToMongoDB() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB with Mongoose');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process if connection fails
    }
}

export {connectToMongoDB};
