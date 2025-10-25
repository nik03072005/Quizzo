import mongoose from 'mongoose';
import { loggers } from '../utils/logger';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    
    loggers.system.dbConnect(conn.connection.host);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    loggers.system.dbError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

export default connectDB;