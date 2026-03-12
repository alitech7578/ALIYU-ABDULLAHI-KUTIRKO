import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Only load dotenv if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is missing from environment variables');
    throw new Error('MONGODB_URI is not defined. Please add it to your Vercel Environment Variables.');
  }

  // Mask the URI for logging
  const maskedURI = MONGODB_URI.replace(/\/\/.*@/, '//****:****@');
  console.log(`Connecting to MongoDB (using ${maskedURI.length} chars string)...`);

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 20000, // Increased timeout for potentially slow serverless startup
      serverSelectionTimeoutMS: 5000,
    };

    console.log('Creating new Mongoose connection promise...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB Atlas');
      return mongoose;
    }).catch(err => {
      console.error('Mongoose connection promise rejected:', err.message);
      cached.promise = null; // Reset promise so we can retry
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('Database connection finalized.');
  } catch (e: any) {
    cached.promise = null;
    console.error('CRITICAL: Database connection failed during await:', e.message);
    throw new Error(`DB_CONNECTION_ERROR: ${e.message}`);
  }

  return cached.conn;
}


const AppDataSchema = new mongoose.Schema({
  records: { type: Array, default: [] },
  students: { type: Array, default: [] },
  branding: {
    companyName: { type: String, default: 'FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI' },
    companyLogo: { type: String, default: null },
    companyEmail: { type: String, default: 'contact@fcetbichi.edu.ng' },
    companyAddress: { type: String, default: 'P.M.B 3473 KANO, KANO STATE' },
    companyWebsite: { type: String, default: 'www.fcetbichi.edu.ng' },
    companyContent: { type: String, default: 'Streamlining data management with intuitive solutions.' },
    provostSignature: { type: String, default: null },
    layoutSettings: { type: mongoose.Schema.Types.Mixed, default: null }
  }
}, { timestamps: true });

export const AppData = mongoose.models.AppData || mongoose.model('AppData', AppDataSchema);
