import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const DATA_FILE = path.resolve("data.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("admin123", salt);
  
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    records: [],
    students: [],
    auth: {
      username: "admin",
      password: hashedPassword
    },
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
    const data = JSON.parse(content);
    // Ensure auth exists for existing files
    if (!data.auth) {
      const salt = bcrypt.genSaltSync(10);
      data.auth = {
        username: "admin",
        password: bcrypt.hashSync("admin123", salt)
      };
      writeData(data);
    }
    return data;
  } catch (e) {
    const salt = bcrypt.genSaltSync(10);
    return { 
      records: [], 
      students: [], 
      auth: {
        username: "admin",
        password: bcrypt.hashSync("admin123", salt)
      },
      branding: {} 
    };
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());
  
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.use(session({
    secret: 'data-collector-secret-key-123',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: true, // Required for sameSite: 'none' in iframe
      sameSite: 'none',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.session.userId) {
      console.log(`Authenticated request from ${req.session.userId}`);
      next();
    } else {
      console.log(`Unauthorized request to ${req.url}`);
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Auth routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const data = readData();
    
    if (username === data.auth.username && bcrypt.compareSync(password, data.auth.password)) {
      req.session.userId = username;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session save failed" });
        }
        res.json({ status: "ok", username });
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Could not log out" });
      res.json({ status: "ok" });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    if (req.session.userId) {
      res.json({ authenticated: true, username: req.session.userId });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.post("/api/auth/update", isAuthenticated, async (req, res) => {
    const { username, password } = req.body;
    const data = readData();
    
    if (username) data.auth.username = username;
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      data.auth.password = bcrypt.hashSync(password, salt);
    }
    
    writeData(data);
    res.json({ status: "ok" });
  });

  // API routes
  app.get("/api/data", isAuthenticated, (req, res) => {
    const data = readData();
    // Don't send auth data to frontend
    const { auth, ...publicData } = data;
    res.json(publicData);
  });

  app.post("/api/data", isAuthenticated, (req, res) => {
    const data = readData();
    const newData = { ...data, ...req.body };
    // Preserve auth data
    newData.auth = data.auth;
    writeData(newData);
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
