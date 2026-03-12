import express from 'express';
import { connectDB, AppData } from '../lib/db';

const app = express();
app.use(express.json({ limit: '50mb' }));

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
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
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
      mongodb_uri_start: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + '...' : 'none',
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
  res.json({ message: 'API is running', version: '1.0.1' });
});

export default app;

