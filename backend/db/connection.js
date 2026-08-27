import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is required. Set it in server/.env, e.g. ' +
    'mongodb://127.0.0.1:27017/kas or a MongoDB Atlas SRV connection string.'
  );
}

mongoose.set('strictQuery', true);

let connectionPromise = null;

export function connectToDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || undefined,
        maxPoolSize: Number(process.env.DB_POOL_SIZE || 10),
        serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS || 15000)
      })
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

export async function disconnectFromDatabase() {
  connectionPromise = null;
  await mongoose.disconnect();
}

export { mongoose };
