const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create booking
router.post('/', async (req, res) => {
  const { customerId, roomId, hotelId, checkInDate, checkOutDate } = req.body;

  try {
    // First get hotel ID if not provided (based on roomId)
    let effectiveHotelId = hotelId;
    if (!effectiveHotelId) {
      const [room] = await pool.query(
        'SELECT HotelID FROM room WHERE RoomID = ?',
        [roomId]
      );
      if (room.length === 0) {
        return res.status(400).json({ message: 'Invalid room ID' });
      }
      effectiveHotelId = room[0].HotelID;
    }

    // Check room availability
    const [availability] = await pool.query(`
            SELECT 1 FROM room r
            WHERE r.RoomID = ? 
            AND r.Damaged = 0
            AND NOT EXISTS (
                SELECT 1 FROM booking b 
                WHERE b.RoomID = r.RoomID 
                AND b.Status = 'Confirmed'
                AND (
                    (b.CheckInDate <= ? AND b.CheckOutDate >= ?) OR
                    (b.CheckInDate BETWEEN ? AND ?) OR
                    (b.CheckOutDate BETWEEN ? AND ?)
                )
            )
            AND NOT EXISTS (
                SELECT 1 FROM renting rg 
                WHERE rg.RoomID = r.RoomID
                AND rg.Status = 'Active'
                AND (
                    (rg.CheckInDate <= ? AND rg.CheckOutDate >= ?) OR
                    (rg.CheckInDate BETWEEN ? AND ?) OR
                    (rg.CheckOutDate BETWEEN ? AND ?)
                )
            )
        `, [roomId, ...Array(12).fill([checkOutDate, checkInDate]).flat()]);

    if (availability.length === 0) {
      return res.status(400).json({ message: 'Room not available for selected dates' });
    }

    // Create booking with all required fields
    const [result] = await pool.query(`
            INSERT INTO booking 
            (CustomerID, HotelID, RoomID, CheckInDate, CheckOutDate, BookingDate, Status)
            VALUES (?, ?, ?, ?, ?, NOW(), 'Confirmed')
        `, [customerId, effectiveHotelId, roomId, checkInDate, checkOutDate]);

    res.status(201).json({
      bookingId: result.insertId,
      hotelId: effectiveHotelId,
      roomId,
      checkInDate,
      checkOutDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer bookings
router.get('/customer/:id', async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.*, r.RoomNumber, h.HotelName, h.City, h.State
      FROM booking b
      JOIN room r ON b.RoomID = r.RoomID
      JOIN hotel h ON r.HotelID = h.HotelID
      WHERE b.CustomerID = ?
      ORDER BY b.CheckInDate DESC
    `, [req.params.id]);

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
  try {
    await pool.query('UPDATE booking SET Status = "Cancelled" WHERE BookingID = ?', [req.params.id]);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;