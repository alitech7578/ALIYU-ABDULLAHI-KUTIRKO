const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database.js');
const crypto = require('crypto');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your_super_secret_key_change_this';

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- File Upload Setup (Multer) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// --- Authentication Middleware ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }
    next();
};

// --- API Routes ---

// 1. User & Admin Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

        bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
            if (bcryptErr) return res.status(500).json({ error: "Server error during authentication." });
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
            
            const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
            res.json({ token, user: { username: user.username, role: user.role } });
        });
    });
});

// 2. Register a new user (Admin only)
app.post('/api/users/register', verifyToken, verifyAdmin, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error hashing password' });
        db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, 'user')`, [username, hash], function(err) {
            if (err) return res.status(400).json({ error: 'Username already exists.' });
            res.status(201).json({ message: 'User created successfully', userId: this.lastID });
        });
    });
});

// 3. Get all records (Admin only)
app.get('/api/records', verifyToken, verifyAdmin, (req, res) => {
    db.all("SELECT * FROM records ORDER BY createdAt DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. Get records for the logged-in user (User only)
app.get('/api/user/records', verifyToken, (req, res) => {
    db.all("SELECT * FROM records WHERE createdBy = ? ORDER BY createdAt DESC", [req.user.username], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// 5. Create a new record (Any logged-in user)
app.post('/api/records', [verifyToken, upload.single('photo')], (req, res) => {
    const { name, middleName, surname, email, department, spNumber, rank, state, lg, phoneNumber, marriedStatus, bloodGroup } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Photo is required.' });

    const newRecord = {
        id: crypto.randomUUID(),
        name,
        middleName: middleName || '',
        surname, email, department, spNumber, rank, state, lg, marriedStatus, bloodGroup, phoneNumber,
        createdAt: new Date().toISOString(),
        photo: path.join('uploads', req.file.filename).replace(/\\/g, "/"),
        createdBy: req.user.username // Set creator from verified token
    };

    const sql = `INSERT INTO records (id, name, middleName, surname, email, department, spNumber, rank, state, lg, marriedStatus, bloodGroup, phoneNumber, createdAt, photo, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [newRecord.id, newRecord.name, newRecord.middleName, newRecord.surname, newRecord.email, newRecord.department, newRecord.spNumber, newRecord.rank, newRecord.state, newRecord.lg, newRecord.marriedStatus, newRecord.bloodGroup, newRecord.phoneNumber, newRecord.createdAt, newRecord.photo, newRecord.createdBy];
    
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(newRecord);
    });
});

// 6. Delete a record (Admin can delete any, User can delete their own)
app.delete('/api/records/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { username, role } = req.user;

    db.get("SELECT photo, createdBy FROM records WHERE id = ?", [id], (err, record) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!record) return res.status(404).json({ message: "Record not found" });

        if (role !== 'admin' && record.createdBy !== username) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own records." });
        }
        
        if (record.photo) {
            fs.unlink(path.join(__dirname, record.photo), (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting photo file:", unlinkErr);
            });
        }

        db.run("DELETE FROM records WHERE id = ?", id, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Record deleted successfully' });
        });
    });
});

// 7. Get a single public record (for client page)
app.get('/api/public/records/:id', (req, res) => {
    db.get("SELECT * FROM records WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) res.json(row);
        else res.status(404).json({ message: "Record not found" });
    });
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});