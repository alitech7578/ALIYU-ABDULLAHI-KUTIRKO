import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve("data.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    records: [],
    students: [],
    branding: {
      companyName: 'FEDERAL COLLEGE OF EDUCATION (TECHNICAL) BICHI',
      companyLogo: null,
      companyEmail: 'contact@fcetbichi.edu.ng',
      companyAddress: 'P.M.B 3473 KANO, KANO STATE',
      companyWebsite: 'www.fcetbichi.edu.ng',
      companyContent: 'Streamlining data management with intuitive solutions.',
      provostSignature: null,
      layoutSettings: null
    }
  }, null, 2));
}

function readData() {
  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return { records: [], students: [], branding: {} };
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get("/api/data", (req, res) => {
    res.json(readData());
  });

  app.post("/api/data", (req, res) => {
    writeData(req.body);
    res.json({ status: "ok" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
