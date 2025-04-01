const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all hotels with chain information
router.get('/', async (req, res) => {
    try {
        const [hotels] = await db.query(`
            SELECT 
                h.HotelID, h.HotelName, h.HotelEmail, h.HotelPhoneNo,
                h.Rating, h.NumberOfRooms, h.State, h.City, h.Street, h.ZipCode,
                h.ChainID, c.ChainName
            FROM Hotel h
            LEFT JOIN HotelChain c ON h.ChainID = c.ChainID
            ORDER BY h.HotelName
        `);
        res.json(hotels);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        res.status(500).json({ error: "Failed to fetch hotels" });
    }
});

// Get single hotel by ID
router.get('/:id', async (req, res) => {
    try {
        const [hotel] = await db.query(`
            SELECT 
                h.HotelID, h.HotelName, h.HotelEmail, h.HotelPhoneNo,
                h.Rating, h.NumberOfRooms, h.State, h.City, h.Street, h.ZipCode,
                h.ChainID, c.ChainName
            FROM Hotel h
            LEFT JOIN HotelChain c ON h.ChainID = c.ChainID
            WHERE h.HotelID = ?
        `, [req.params.id]);
        
        if (hotel.length === 0) {
            return res.status(404).json({ error: "Hotel not found" });
        }
        
        res.json(hotel[0]);
    } catch (error) {
        console.error("Error fetching hotel:", error);
        res.status(500).json({ error: "Failed to fetch hotel" });
    }
});

// Create new hotel
router.post('/', async (req, res) => {
    try {
        const { 
            HotelName, ChainID, Rating, 
            NumberOfRooms, HotelEmail, 
            HotelPhoneNo, Street, City, 
            State, ZipCode 
        } = req.body;
        
        // Validate rating
        if (Rating < 1 || Rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const [result] = await db.query(`
            INSERT INTO Hotel 
            (HotelName, ChainID, Rating, NumberOfRooms, 
             HotelEmail, HotelPhoneNo, Street, City, State, ZipCode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            HotelName, ChainID || null, Rating, NumberOfRooms, 
            HotelEmail, HotelPhoneNo, Street, City, State, ZipCode
        ]);
        
        // Get the newly created hotel with chain info
        const [newHotel] = await db.query(`
            SELECT 
                h.HotelID, h.HotelName, h.HotelEmail, h.HotelPhoneNo,
                h.Rating, h.NumberOfRooms, h.State, h.City, h.Street, h.ZipCode,
                h.ChainID, c.ChainName
            FROM Hotel h
            LEFT JOIN HotelChain c ON h.ChainID = c.ChainID
            WHERE h.HotelID = ?
        `, [result.insertId]);
        
        res.status(201).json(newHotel[0]);
    } catch (error) {
        console.error("Error creating hotel:", error);
        res.status(500).json({ 
            error: "Failed to create hotel",
            details: error.message
        });
    }
});

// Update hotel
router.put('/:id', async (req, res) => {
    try {
        const { 
            HotelName, ChainID, Rating, 
            NumberOfRooms, HotelEmail, 
            HotelPhoneNo, Street, City, 
            State, ZipCode 
        } = req.body;
        
        // Validate rating
        if (Rating < 1 || Rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const [result] = await db.query(`
            UPDATE Hotel SET
                HotelName = ?,
                ChainID = ?,
                Rating = ?,
                NumberOfRooms = ?,
                HotelEmail = ?,
                HotelPhoneNo = ?,
                Street = ?,
                City = ?,
                State = ?,
                ZipCode = ?
            WHERE HotelID = ?
        `, [
            HotelName, ChainID || null, Rating, NumberOfRooms, 
            HotelEmail, HotelPhoneNo, Street, City, State, ZipCode,
            req.params.id
        ]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Hotel not found" });
        }
        
        // Get the updated hotel with chain info
        const [updatedHotel] = await db.query(`
            SELECT 
                h.HotelID, h.HotelName, h.HotelEmail, h.HotelPhoneNo,
                h.Rating, h.NumberOfRooms, h.State, h.City, h.Street, h.ZipCode,
                h.ChainID, c.ChainName
            FROM Hotel h
            LEFT JOIN HotelChain c ON h.ChainID = c.ChainID
            WHERE h.HotelID = ?
        `, [req.params.id]);
        
        res.json(updatedHotel[0]);
    } catch (error) {
        console.error("Error updating hotel:", error);
        res.status(500).json({ 
            error: "Failed to update hotel",
            details: error.message
        });
    }
});

// Delete hotel
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM Hotel WHERE HotelID = ?', 
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Hotel not found" });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting hotel:", error);
        res.status(500).json({ 
            error: "Failed to delete hotel",
            details: error.message
        });
    }
});

module.exports = router;