const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper function for date overlap calculation
const buildAvailabilityQuery = () => {
    return `
    AND r.RoomID NOT IN (
      SELECT RoomID FROM booking 
      WHERE Status = 'Confirmed'
      AND CheckInDate < ? AND CheckOutDate > ?
    )
    AND r.RoomID NOT IN (
      SELECT RoomID FROM renting 
      WHERE Status = 'Active'
      AND CheckInDate < ? AND CheckOutDate > ?
    )
  `;
};

// Get available rooms with filters
router.get('/available', async (req, res) => {
    const {
        startDate,
        endDate,
        capacity,
        area,
        chain,
        category,
        minPrice,
        maxPrice
    } = req.query;

    try {
        // Base query without amenities
        let query = `
      SELECT 
        r.*, 
        h.HotelName, 
        h.City, 
        h.State, 
        h.Rating, 
        hc.ChainName
      FROM room r
      JOIN hotel h ON r.HotelID = h.HotelID
      JOIN hotelchain hc ON h.ChainID = hc.ChainID
      WHERE r.Damaged = 0
    `;

        const params = [];

        // Date availability filter
        if (startDate && endDate) {
            query += buildAvailabilityQuery();
            params.push(endDate, startDate, endDate, startDate);
        }

        // Other filters
        if (capacity) {
            query += ' AND r.Capacity >= ?';
            params.push(capacity);
        }

        if (area) {
            query += ' AND (h.City = ? OR h.State = ?)';
            params.push(area, area);
        }

        if (chain) {
            query += ' AND hc.ChainName = ?';
            params.push(chain);
        }

        if (category) {
            query += ' AND h.Rating = ?';
            params.push(category);
        }

        if (minPrice) {
            query += ' AND r.Price >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND r.Price <= ?';
            params.push(maxPrice);
        }

        // Execute query
        const [rooms] = await pool.query(query, params);
        res.json(rooms);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            message: 'Failed to fetch rooms',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Get room by ID without amenities
router.get('/:id', async (req, res) => {
    try {
        const [room] = await pool.query(`
      SELECT 
        r.*, 
        h.HotelName, 
        h.City, 
        h.State, 
        h.Rating, 
        hc.ChainName
      FROM room r
      JOIN hotel h ON r.HotelID = h.HotelID
      JOIN hotelchain hc ON h.ChainID = hc.ChainID
      WHERE r.RoomID = ?
    `, [req.params.id]);

        if (room.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            message: 'Failed to fetch room details',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;