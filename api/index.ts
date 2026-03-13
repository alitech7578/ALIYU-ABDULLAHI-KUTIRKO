import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json({ limit: '50mb' }));

// Diagnostic middleware
app.use((req, res, next) => {
  res.setHeader('X-Deployment-Time', new Date().toISOString());
  res.setHeader('X-Debug-Runtime', 'Vercel-Serverless-SelfContained');
  next();
});

// Database Logic (Inlined for Vercel Stability)
const MONGODB_URI = process.env.MONGODB_URI;
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from Vercel environment variables.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('Connected to MongoDB Atlas');
      return m;
    }).catch(err => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e: any) {
    cached.promise = null;
    throw e;
  }
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

const AppData = mongoose.models.AppData || mongoose.model('AppData', AppDataSchema);

// API routes
app.get('/api/data', async (req, res) => {
  try {
    await connectDB();
    let data = await AppData.findOne();
    if (!data) {
      data = await AppData.create({
        records: [],
        students: [],
        branding: {
          companyName: 'FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI',
          companyEmail: 'contact@fcetbichi.edu.ng',
          companyAddress: 'P.M.B 3473 KANO, KANO STATE',
          companyWebsite: 'www.fcetbichi.edu.ng',
          companyContent: 'Streamlining data management with intuitive solutions.'
        }
      });
    }
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data', 
      message: error.message,
      uri_exists: !!process.env.MONGODB_URI
    });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    await connectDB();
    const data = req.body;
    let existingData = await AppData.findOne();
    
    if (existingData) {
      await AppData.updateOne({}, data);
    } else {
      await AppData.create(data);
    }
    
    res.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error saving data:', error);
    res.status(500).json({ 
      error: 'Failed to save data', 
      message: error.message 
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const conn = await connectDB();
    res.json({ 
      status: 'ok', 
      database: conn.connection.readyState === 1 ? 'connected' : 'disconnected',
      mongodb_uri_exists: !!process.env.MONGODB_URI,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Health check failed:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      uri_exists: !!process.env.MONGODB_URI
    });
  }
});

// Root API test
app.get('/api', (req, res) => {
  res.json({ message: 'API is testing!', version: '2.0.0' });
});

export default app;


