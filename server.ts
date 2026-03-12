import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { connectDB, AppData } from "./lib/db";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

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

  app.get("/api/health", async (req, res) => {
    try {
      const mongoose = await connectDB();
      res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
    } catch (error) {
      res.status(500).json({ status: "error" });
    }
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
