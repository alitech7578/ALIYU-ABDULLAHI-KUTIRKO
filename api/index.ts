import express from 'express';
import mongoose from 'mongoose';
import connectDB from '../lib/db';

const app = express();
app.use(express.json({ limit: '50mb' }));

// MongoDB Schema (Re-defined for the API function)
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

// Check if model already exists to prevent OverwriteModelError
const AppData = mongoose.models.AppData || mongoose.model('AppData', AppDataSchema);

// API routes
app.get('/api/data', async (req, res) => {
  await connectDB();
  try {
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
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/data', async (req, res) => {
  await connectDB();
  try {
    const data = req.body;
    let existingData = await AppData.findOne();
    
    if (existingData) {
      await AppData.updateOne({}, data);
    } else {
      await AppData.create(data);
    }
    
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.get('/api/health', async (req, res) => {
  await connectDB();
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

export default app;
