const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create renting (from booking)
router.post('/from-booking', async (req, res) => {
    const { bookingId, employeeId } = req.body;

    try {
        // Get booking details
        const [booking] = await pool.query('SELECT * FROM booking WHERE BookingID = ?', [bookingId]);

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking[0].Status !== 'Confirmed') {
            return res.status(400).json({ message: 'Booking is not confirmed' });
        }

        // Check room availability
        const [availability] = await pool.query(`
      SELECT 1 FROM room r
      WHERE r.RoomID = ? 
      AND r.Damaged = 0
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
    `, [booking[0].RoomID, ...Array(6).fill([booking[0].CheckOutDate, booking[0].CheckInDate]).flat()]);

        if (availability.length === 0) {
            return res.status(400).json({ message: 'Room not available for selected dates' });
        }

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
            // Create renting
            const [rentingResult] = await pool.query(`
        INSERT INTO renting (CustomerID, HotelID, RoomID, CheckInDate, CheckOutDate, EmployeeID)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
                booking[0].CustomerID,
                booking[0].HotelID,
                booking[0].RoomID,
                booking[0].CheckInDate,
                booking[0].CheckOutDate,
                employeeId
            ]);

            // Update booking status
            await pool.query('UPDATE booking SET Status = "Completed" WHERE BookingID = ?', [bookingId]);

            // Record transformation
            await pool.query(`
        INSERT INTO transform (RentingID, BookingID, CheckInDate, EmployeeID)
        VALUES (?, ?, ?, ?)
      `, [rentingResult.insertId, bookingId, booking[0].CheckInDate, employeeId]);

            await pool.query('COMMIT');

            res.status(201).json({ rentingId: rentingResult.insertId });
        } catch (err) {
            await pool.query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create direct renting (without booking)
router.post('/', async (req, res) => {
    const { customerId, roomId, checkInDate, checkOutDate, employeeId } = req.body;

    try {
        // Check room availability
        const [availability] = await pool.query(`
      SELECT r.*, h.HotelID FROM room r
      JOIN hotel h ON r.HotelID = h.HotelID
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

        // Create renting
        const [result] = await pool.query(`
      INSERT INTO renting (CustomerID, HotelID, RoomID, CheckInDate, CheckOutDate, EmployeeID)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [customerId, availability[0].HotelID, roomId, checkInDate, checkOutDate, employeeId]);

        res.status(201).json({ rentingId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get rentings by customer
router.get('/customer/:id', async (req, res) => {
    try {
        const [rentings] = await pool.query(`
      SELECT r.*, rm.RoomNumber, h.HotelName, h.City, h.State,
             (SELECT SUM(Amount) FROM payment p WHERE p.RentingID = r.RentingID) AS AmountPaid
      FROM renting r
      JOIN room rm ON r.RoomID = rm.RoomID
      JOIN hotel h ON r.HotelID = h.HotelID
      WHERE r.CustomerID = ?
      ORDER BY r.CheckInDate DESC
    `, [req.params.id]);

        res.json(rentings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Complete renting
router.put('/:id/complete', async (req, res) => {
    try {
        await pool.query('UPDATE renting SET Status = "Completed" WHERE RentingID = ?', [req.params.id]);
        res.json({ message: 'Renting completed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add payment
router.post('/:id/payment', async (req, res) => {
    const { amount, method, employeeId, receiptNumber } = req.body;

    try {
        const [result] = await pool.query(`
      INSERT INTO payment (RentingID, Amount, PaymentMethod, EmployeeID, ReceiptNumber)
      VALUES (?, ?, ?, ?, ?)
    `, [req.params.id, amount, method, employeeId, receiptNumber]);

        res.status(201).json({ paymentId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get renting payments
router.get('/:id/payments', async (req, res) => {
    try {
        const [payments] = await pool.query(`
      SELECT p.*, CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName
      FROM payment p
      JOIN employee e ON p.EmployeeID = e.SSN
      WHERE p.RentingID = ?
      ORDER BY p.PaymentDate DESC
    `, [req.params.id]);

        res.json(payments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;