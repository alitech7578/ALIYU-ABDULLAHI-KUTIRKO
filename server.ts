import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/data-collector";
const PORT = Number(process.env.PORT) || 3000;

import connectDB from "./lib/db";

// MongoDB Schema (Re-defined for consistency)
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

const AppData = mongoose.models.AppData || mongoose.model("AppData", AppDataSchema);

async function startServer() {
  await connectDB();

  
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '50mb' }));
  
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API routes
  app.get("/api/data", async (req, res) => {
    try {
      let data = await AppData.findOne();
      if (!data) {
        // Initialize with default data if none exists
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
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });

  app.post("/api/data", async (req, res) => {
    try {
      const data = req.body;
      let existingData = await AppData.findOne();
      
      if (existingData) {
        await AppData.updateOne({}, data);
      } else {
        await AppData.create(data);
      }
      
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.resolve("dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

