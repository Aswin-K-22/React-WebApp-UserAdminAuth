import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Optional: Timeout for initial connection
        });

        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the application if connection fails
    }
};

export default connectDB;
