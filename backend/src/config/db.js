import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let memoryServer = null;

/**
 * Connects to MongoDB.
 * - If MONGO_URI is provided (Atlas / local mongod), connect to it.
 * - Otherwise spin up a persistent local in-memory MongoDB so the app runs
 *   with zero external setup. Data is stored on disk in backend/.mongo-data,
 *   so it survives restarts (your manually-toggled DB keys persist).
 */
export const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.join(__dirname, '../../.mongo-data');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    memoryServer = await MongoMemoryServer.create({
      instance: {
        port: 27018,
        dbName: 'venturly',
        dbPath,
        storageEngine: 'wiredTiger',
      },
    });
    uri = memoryServer.getUri('venturly');
    console.log('🗄️  Using persistent local MongoDB (mongodb-memory-server)');
    console.log(`    Data dir: ${dbPath}`);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
};

export const getMongoUri = () => (memoryServer ? memoryServer.getUri('venturly') : process.env.MONGO_URI);

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};
