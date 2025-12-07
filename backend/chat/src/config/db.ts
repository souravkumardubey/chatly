import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/userdb';
    await mongoose.connect(mongoURI, {
      dbName: 'chartly',
    });
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  } 
};

export default connectDB;