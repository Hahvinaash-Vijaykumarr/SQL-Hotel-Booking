const express = require('express');
<<<<<<< HEAD
const cors = require('cors'); // Add this line to import cors
const path = require('path');
const mysql = require("mysql2");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
=======
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require("mysql2");
require('dotenv').config();
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb

const app = express();

// Middleware
<<<<<<< HEAD
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Now this will work since cors is imported
=======
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb

// API Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const roomRoutes = require('./routes/rooms');
<<<<<<< HEAD
const customerRoutes = require('./routes/customers');
=======
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb

console.log('Route types:', {
    auth: typeof authRoutes,
    booking: typeof bookingRoutes,
<<<<<<< HEAD
    rooms: typeof roomRoutes,
    customers: typeof customerRoutes
=======
    rooms: typeof roomRoutes
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
<<<<<<< HEAD
app.use('/api/customers', customerRoutes);
=======
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// SPA catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

<<<<<<< HEAD
// Replace your current db connection with:
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
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
=======
// Improved MySQL connection with error handling
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_db',
    insecureAuth: true // Add this if using older MySQL auth
});

// Connect with retry logic
function handleDisconnect() {
    db.connect(err => {
        if (err) {
            console.error('Database connection failed:', err.message);
            console.log('Retrying connection in 5 seconds...');
            setTimeout(handleDisconnect, 5000);
            return;
        }
        console.log('Successfully connected to MySQL database');
    });

    db.on('error', err => {
        console.error('Database error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});