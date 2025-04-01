const express = require('express');
const router = express.Router();
const pool = require('../db');
// Add this at the top of your routes/rooms.js
router.use((req, res, next) => {
    console.log(`Room route hit: ${req.method} ${req.path}`);
    next();
  });
  
  router.get('/', async (req, res) => {
    console.log('GET /api/rooms endpoint executing'); // Debug log
    try {
      const [rooms] = await pool.query(`
        SELECT r.*, h.HotelName 
        FROM room r
        JOIN hotel h ON r.HotelID = h.HotelID
      `);
      
      console.log(`Found ${rooms.length} rooms`); // Debug log
      
      // Explicitly set content-type
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, data: rooms });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

// Get ALL rooms (updated endpoint)
router.get('/', async (req, res) => {
    try {
        const [rooms] = await pool.query(`
            SELECT 
                r.*,
                h.HotelName,
                h.City,
                h.State,
                h.Rating as HotelRating,
                hc.ChainName
            FROM room r
            JOIN hotel h ON r.HotelID = h.HotelID
            LEFT JOIN hotelchain hc ON h.ChainID = hc.ChainID
            ORDER BY h.HotelName, r.Floor, r.RoomNumber
        `);
        res.json(rooms);
    } catch (error) {
        console.error("Error fetching all rooms:", error);
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch rooms",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Get single room by ID
router.get('/:id', async (req, res) => {
    try {
        const [room] = await pool.query(`
            SELECT 
                r.*,
                h.HotelName,
                hc.ChainName
            FROM room r
            JOIN hotel h ON r.HotelID = h.HotelID
            LEFT JOIN hotelchain hc ON h.ChainID = hc.ChainID
            WHERE r.RoomID = ?
        `, [req.params.id]);
        
        if (room.length === 0) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        res.json(room[0]);
    } catch (error) {
        console.error("Error fetching room:", error);
        res.status(500).json({ 
            error: "Failed to fetch room",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Create new room
router.post('/', async (req, res) => {
    try {
        const {
            HotelID,
            RoomNumber,
            Floor,
            Capacity,
            Price,
            ViewType,
            Extendable,
            Damaged,
            Amenities,
            Description,
            LastMaintenanceDate
        } = req.body;

        // Convert view type to boolean fields
        const SeaView = ViewType === 'Sea' ? 1 : 0;
        const MountainView = ViewType === 'Mountain' ? 1 : 0;

        const [result] = await pool.query(`
            INSERT INTO room 
            (HotelID, RoomNumber, Floor, Capacity, Price, 
             SeaView, MountainView, Extendable, Damaged, 
             Amenities, Description, LastMaintenanceDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            HotelID,
            RoomNumber,
            Floor,
            Capacity,
            Price,
            SeaView,
            MountainView,
            Extendable ? 1 : 0,
            Damaged ? 1 : 0,
            Amenities,
            Description,
            LastMaintenanceDate
        ]);
        
        // Get the newly created room with hotel info
        const [newRoom] = await pool.query(`
            SELECT 
                r.*,
                h.HotelName,
                hc.ChainName
            FROM room r
            JOIN hotel h ON r.HotelID = h.HotelID
            LEFT JOIN hotelchain hc ON h.ChainID = hc.ChainID
            WHERE r.RoomID = ?
        `, [result.insertId]);
        
        res.status(201).json(newRoom[0]);
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ 
            error: "Failed to create room",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Update room
router.put('/:id', async (req, res) => {
    try {
        const {
            HotelID,
            RoomNumber,
            Floor,
            Capacity,
            Price,
            ViewType,
            Extendable,
            Damaged,
            Amenities,
            Description,
            LastMaintenanceDate
        } = req.body;

        // Convert view type to boolean fields
        const SeaView = ViewType === 'Sea' ? 1 : 0;
        const MountainView = ViewType === 'Mountain' ? 1 : 0;

        const [result] = await pool.query(`
            UPDATE room SET
                RoomNumber = ?,
                Floor = ?,
                Capacity = ?,
                Price = ?,
                SeaView = ?,
                MountainView = ?,
                Extendable = ?,
                Damaged = ?,
                Amenities = ?,
                Description = ?,
                LastMaintenanceDate = ?
            WHERE RoomID = ?
        `, [
            RoomNumber,
            Floor,
            Capacity,
            Price,
            SeaView,
            MountainView,
            Extendable ? 1 : 0,
            Damaged ? 1 : 0,
            Amenities,
            Description,
            LastMaintenanceDate,
            req.params.id
        ]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        // Get the updated room with hotel info
        const [updatedRoom] = await pool.query(`
            SELECT 
                r.*,
                h.HotelName,
                hc.ChainName
            FROM room r
            JOIN hotel h ON r.HotelID = h.HotelID
            LEFT JOIN hotelchain hc ON h.ChainID = hc.ChainID
            WHERE r.RoomID = ?
        `, [req.params.id]);
        
        res.json(updatedRoom[0]);
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ 
            error: "Failed to update room",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Delete room
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM room WHERE RoomID = ?', 
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ 
            error: "Failed to delete room",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// routes/rooms.js - Add this new endpoint
router.get('/', async (req, res) => {
    try {
        const [rooms] = await pool.query(`
            SELECT 
                r.*,
                h.HotelName,
                h.City,
                h.State,
                h.Rating as HotelRating,
                hc.ChainName
            FROM room r
            JOIN hotel h ON r.HotelID = h.HotelID
            LEFT JOIN hotelchain hc ON h.ChainID = hc.ChainID
            ORDER BY h.HotelName, r.Floor, r.RoomNumber
        `);
        res.json(rooms);
    } catch (error) {
        console.error("Error fetching all rooms:", error);
        res.status(500).json({ 
            error: "Failed to fetch rooms",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

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
        maxPrice,
        view
    } = req.query;

    try {
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
            LEFT JOIN hotelchain hc ON h.ChainID = hc.ChainID
            WHERE r.Damaged = 0
        `;

        const params = [];

        // Date availability filter
        if (startDate && endDate) {
            query += buildAvailabilityQuery();
            params.push(endDate, startDate, endDate, startDate);
        }

        if (capacity) {
            query += ' AND r.Capacity = ?';
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

        if (view === 'sea') {
            query += ' AND r.SeaView = 1';
        } else if (view === 'mountain') {
            query += ' AND r.MountainView = 1';
        }

        const [rooms] = await pool.query(query, params);
        res.json({
            success: true,
            data: rooms,
            count: rooms.length
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available rooms',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Get room by ID
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
            LEFT JOIN hotelchain hc ON h.ChainID = hc.ChainID
            WHERE r.RoomID = ?
        `, [req.params.id]);

        if (room.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            data: room[0]
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch room details',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Create new room
router.post('/', async (req, res) => {
    const {
        HotelID,
        RoomNumber,
        Capacity,
        SeaView,
        MountainView,
        Extendable,
        Damaged,
        Price,
        Amenities,
        Floor,
        LastMaintenanceDate
    } = req.body;

    // Validate required fields
    if (!HotelID || !RoomNumber || !Price || !Capacity || !Floor) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            required: ['HotelID', 'RoomNumber', 'Price', 'Capacity', 'Floor']
        });
    }

    try {
        const [result] = await pool.query(`
            INSERT INTO room 
            (HotelID, RoomNumber, Capacity, SeaView, MountainView,
             Extendable, Damaged, Price, Amenities, Floor, LastMaintenanceDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            HotelID,
            RoomNumber,
            Capacity,
            SeaView || false,
            MountainView || false,
            Extendable || false,
            Damaged || false,
            Price,
            Amenities || null,
            Floor,
            LastMaintenanceDate || null
        ]);

        // Return the newly created room
        const [newRoom] = await pool.query(`
            SELECT * FROM room WHERE RoomID = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            data: newRoom[0],
            message: 'Room created successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Room number already exists for this hotel'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create room',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Update room
router.put('/:id', async (req, res) => {
    const roomId = req.params.id;
    const {
        HotelID,
        RoomNumber,
        Capacity,
        SeaView,
        MountainView,
        Extendable,
        Damaged,
        Price,
        Amenities,
        Floor,
        LastMaintenanceDate
    } = req.body;

    try {
        const [result] = await pool.query(`
            UPDATE room SET
                HotelID = ?,
                RoomNumber = ?,
                Capacity = ?,
                SeaView = ?,
                MountainView = ?,
                Extendable = ?,
                Damaged = ?,
                Price = ?,
                Amenities = ?,
                Floor = ?,
                LastMaintenanceDate = ?
            WHERE RoomID = ?
        `, [
            HotelID,
            RoomNumber,
            Capacity,
            SeaView,
            MountainView,
            Extendable,
            Damaged,
            Price,
            Amenities,
            Floor,
            LastMaintenanceDate,
            roomId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Return the updated room
        const [updatedRoom] = await pool.query(`
            SELECT * FROM room WHERE RoomID = ?
        `, [roomId]);

        res.json({
            success: true,
            data: updatedRoom[0],
            message: 'Room updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Room number already exists for this hotel'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update room',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Delete room
router.delete('/:id', async (req, res) => {
    try {
        // Check for active bookings/rentals
        const [activeBookings] = await pool.query(`
            SELECT 1 FROM booking 
            WHERE RoomID = ? AND Status = 'Confirmed'
            AND CheckOutDate > CURRENT_DATE
            LIMIT 1
        `, [req.params.id]);

        const [activeRentals] = await pool.query(`
            SELECT 1 FROM renting 
            WHERE RoomID = ? AND Status = 'Active'
            AND CheckOutDate > CURRENT_DATE
            LIMIT 1
        `, [req.params.id]);

        if (activeBookings.length > 0 || activeRentals.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete room with active bookings or rentals'
            });
        }

        const [result] = await pool.query(
            'DELETE FROM room WHERE RoomID = ?', 
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete room',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;