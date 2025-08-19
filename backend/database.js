const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Create records table
            db.run(`CREATE TABLE IF NOT EXISTS records (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                middleName TEXT,
                surname TEXT NOT NULL,
                email TEXT NOT NULL,
                department TEXT NOT NULL,
                spNumber TEXT NOT NULL,
                rank TEXT NOT NULL,
                state TEXT NOT NULL,
                lg TEXT NOT NULL,
                marriedStatus TEXT NOT NULL,
                bloodGroup TEXT NOT NULL,
                phoneNumber TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                photo TEXT NOT NULL,
                createdBy TEXT NOT NULL
            )`, (err) => {
                if (err) console.error("Error creating records table", err.message);
                else console.log("Records table is ready.");
            });

            // Create users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('admin', 'user'))
            )`, (err) => {
                 if (err) console.error("Error creating users table", err.message);
                 else console.log("Users table is ready.");
            });

            // Add a default admin user if one doesn't exist
            const adminUsername = 'admin';
            const adminPassword = 'password123'; // In a real app, use env variables

            db.get("SELECT * FROM users WHERE username = ?", [adminUsername], (err, row) => {
                if (err) {
                    console.error("Error checking for admin user", err.message);
                    return;
                }
                if (!row) {
                    bcrypt.hash(adminPassword, 10, (err, hash) => {
                        if (err) {
                            console.error('Error hashing admin password', err);
                            return;
                        }
                        db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [adminUsername, hash, 'admin'], (err) => {
                            if (err) {
                                console.error('Error inserting admin user', err.message);
                            } else {
                                console.log('Default admin user created.');
                            }
                        });
                    });
                }
            });
        });
    }
});

module.exports = db;