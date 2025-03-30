const express = require('express');
const cors = require('cors'); // Add this line to import cors
const path = require('path');
const mysql = require("mysql2");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Now this will work since cors is imported

// API Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const roomRoutes = require('./routes/rooms');
const customerRoutes = require('./routes/customers');

console.log('Route types:', {
    auth: typeof authRoutes,
    booking: typeof bookingRoutes,
    rooms: typeof roomRoutes,
    customers: typeof customerRoutes
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/customers', customerRoutes);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// SPA catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Replace your current db connection with:
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Qwerty',
    database: process.env.DB_NAME || 'hoteldb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // This enables the promise API

// Remove the old connection handling code and replace with:
db.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

db.on('error', err => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        db.connect();
    } else {
        throw err;
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});