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

// Verify connection
db.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

// ========== API ROUTES ==========
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const roomRoutes = require('./routes/rooms');
const customerRoutes = require('./routes/customers');
const rentingRoutes = require('./routes/renting');
const employeeRouter = require('./routes/employee');

app.use('/api', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentings', rentingRoutes);
app.use('/api/employees', employeeRouter);

// ========== VIEW ENDPOINTS ==========
app.get('/api/views/available-rooms-by-area', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                h.State AS area,
                COUNT(r.RoomID) AS available_rooms
            FROM Hotel h
            JOIN Room r ON h.HotelID = r.HotelID
            WHERE r.RoomID NOT IN (
                SELECT DISTINCT RoomID FROM Renting WHERE CheckOutDate IS NULL
            )
            AND r.RoomID NOT IN (
                SELECT DISTINCT RoomID FROM Booking 
                WHERE CheckInDate <= CURRENT_DATE AND CheckOutDate >= CURRENT_DATE
            )
            GROUP BY h.State
            HAVING COUNT(r.RoomID) > 0
            ORDER BY available_rooms DESC
        `);

        res.json({
            success: true,
            data: results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch available rooms",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

app.get('/api/views/hotel-capacity-summary', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                hotel_name,
                aggregated_capacity AS total_capacity
            FROM vw_total_capacity_per_hotel
        `);
        res.json(results);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Static files (must come after API routes)
app.use(express.static(path.join(__dirname, '../public')));

// SPA catch-all (must come last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Employee login endpoint: http://localhost:${PORT}/api/employee/login`);
});