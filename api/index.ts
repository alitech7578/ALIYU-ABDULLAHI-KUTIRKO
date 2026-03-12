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
    const mongoose = await connectDB();
    res.json({ 
      status: 'ok', 
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      env: process.env.MONGODB_URI ? 'present' : 'missing'
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default app;
