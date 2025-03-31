const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require("mysql2");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const roomRoutes = require('./routes/rooms');
const customerRoutes = require('./routes/customers');
const rentingRoutes = require('./routes/renting');

// Changed from '/api/auth' to '/api' for the auth routes
app.use('/api', authRoutes); // This is the critical change
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentings', rentingRoutes);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// SPA catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hoteldb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

db.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });


// ========================== VIEW ENDPOINTS ==========================
app.get('/api/views/available-rooms-by-area', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM vw_available_rooms_by_area");
        res.json(results);
    } catch (error) {
        console.error("Error fetching available rooms by area:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/views/hotel-capacity-summary', async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM vw_total_capacity_per_hotel");
        res.json(results);
    } catch (error) {
        console.error("Error fetching hotel capacity summary:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Employee login endpoint: http://localhost:${PORT}/api/employee/login`);
});