const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create renting from booking
router.post('/from-booking', async (req, res) => {
    const { bookingId, employeeId } = req.body;

    try {
        // Verify employee exists (using SSN)
        const [employee] = await pool.query('SELECT SSN FROM employee WHERE SSN = ?', [employeeId]);
        if (employee.length === 0) {
            return res.status(400).json({
                message: 'Employee not found',
                details: `No employee with SSN ${employeeId} exists`
            });
        }

        // Get complete booking details - UPDATED TO MATCH YOUR SCHEMA
        const [booking] = await pool.query(`
            SELECT b.*, r.HotelID 
            FROM booking b
            JOIN room r ON b.RoomID = r.RoomID
            WHERE b.BookingID = ?
        `, [bookingId]);

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking[0].Status !== 'Confirmed') {
            return res.status(400).json({ message: 'Booking is not confirmed' });
        }

        // Check all foreign key references exist
        const [customer] = await pool.query('SELECT 1 FROM customer WHERE ID = ?', [booking[0].CustomerID]);
        const [hotel] = await pool.query('SELECT 1 FROM hotel WHERE HotelID = ?', [booking[0].HotelID]);
        const [room] = await pool.query('SELECT 1 FROM room WHERE RoomID = ? AND HotelID = ?',
            [booking[0].RoomID, booking[0].HotelID]);

        if (customer.length === 0 || hotel.length === 0 || room.length === 0) {
            return res.status(400).json({
                message: 'Reference data not found',
                details: {
                    customerExists: customer.length > 0,
                    hotelExists: hotel.length > 0,
                    roomExists: room.length > 0
                }
            });
        }

        // Check room availability (including damaged status)
        const [availability] = await pool.query(`
            SELECT 1 FROM room 
            WHERE RoomID = ? 
            AND Damaged = 0
            AND NOT EXISTS (
                SELECT 1 FROM renting 
                WHERE RoomID = ?
                AND Status = 'Active'
                AND (
                    (CheckInDate <= ? AND CheckOutDate >= ?) OR
                    (CheckInDate BETWEEN ? AND ?) OR
                    (CheckOutDate BETWEEN ? AND ?)
                )
            )
        `, [
            booking[0].RoomID,
            booking[0].RoomID,
            booking[0].CheckOutDate, booking[0].CheckInDate,
            booking[0].CheckInDate, booking[0].CheckOutDate,
            booking[0].CheckInDate, booking[0].CheckOutDate
        ]);

        if (availability.length === 0) {
            return res.status(400).json({ message: 'Room not available for selected dates' });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Create renting with all required fields
            const [rentingResult] = await connection.query(`
                INSERT INTO renting (
                    CustomerID, 
                    HotelID, 
                    RoomID, 
                    CheckInDate, 
                    CheckOutDate, 
                    EmployeeID,
                    Status
                ) VALUES (?, ?, ?, ?, ?, ?, 'Active')
            `, [
                booking[0].CustomerID,
                booking[0].HotelID,
                booking[0].RoomID,
                booking[0].CheckInDate,
                booking[0].CheckOutDate,
                employeeId
            ]);

            // Update booking status
            await connection.query('UPDATE booking SET Status = "Completed" WHERE BookingID = ?', [bookingId]);

            // Record transformation
            await connection.query(`
                INSERT INTO transform (RentingID, BookingID, CheckInDate, EmployeeID)
                VALUES (?, ?, ?, ?)
            `, [rentingResult.insertId, bookingId, booking[0].CheckInDate, employeeId]);

            await connection.commit();
            connection.release();

            res.status(201).json({
                rentingId: rentingResult.insertId,
                message: 'Renting created successfully'
            });
        } catch (err) {
            await connection.rollback();
            connection.release();
            console.error('Transaction error:', err);
            res.status(500).json({
                message: 'Failed to create renting',
                error: err.message,
                code: err.code,
                sql: err.sql
            });
        }
    } catch (err) {
        console.error('Error in /from-booking:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

router.post('/direct', async (req, res) => {
    const {
        personalInfo,
        address,
        identification,
        payment,
        rentingDetails,
        employeeId
    } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Verify employee exists
        const [employee] = await connection.query('SELECT SSN FROM employee WHERE SSN = ?', [employeeId]);
        if (employee.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Employee not found',
                details: `No employee with SSN ${employeeId} exists`
            });
        }

        // 2. Check room availability and get hotel ID + price
        const [roomAvailability] = await connection.query(`
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
        `, [rentingDetails.roomId, ...Array(12).fill([rentingDetails.checkOutDate, rentingDetails.checkInDate]).flat()]);

        if (roomAvailability.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Room not available for selected dates',
                details: { roomAvailable: false }
            });
        }

        // Calculate total price
        const nights = Math.ceil(
            (new Date(rentingDetails.checkOutDate) - new Date(rentingDetails.checkInDate))
            / (1000 * 60 * 60 * 24)
        );
        const totalPrice = roomAvailability[0].Price * nights;

        // 3. Create customer record with payment information
        const [customerResult] = await connection.query(`
            INSERT INTO customer (
                FirstName, 
                MiddleName, 
                LastName, 
                State, 
                City, 
                Street, 
                ZipCode, 
                RegistrationDate, 
                IDType, 
                IDNumber, 
                CreditCardNumber, 
                CreditCardExpiration, 
                CreditCardCVC
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)
        `, [
            personalInfo.firstName,
            personalInfo.middleName || null,
            personalInfo.lastName,
            address.state,
            address.city,
            address.street,
            address.zipCode,
            identification.idType,
            identification.idNumber,
            payment.creditCardNumber,
            payment.creditCardExpiration,
            payment.creditCardCVC
        ]);

        const customerId = customerResult.insertId;

        // 4. Create renting record (using only existing columns)
        const [rentingResult] = await connection.query(`
            INSERT INTO renting (
                CustomerID, 
                HotelID, 
                RoomID, 
                CheckInDate, 
                CheckOutDate, 
                EmployeeID,
                Status,
                RentingDate,
                TotalPrice
            ) VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW(), ?)
        `, [
            customerId,
            roomAvailability[0].HotelID,
            rentingDetails.roomId,
            rentingDetails.checkInDate,
            rentingDetails.checkOutDate,
            employeeId,
            totalPrice
        ]);

        await connection.commit();
        connection.release();

        res.status(201).json({
            rentingId: rentingResult.insertId,
            customerId,
            message: 'Direct renting created successfully'
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error in direct renting:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message,
            code: err.code,
            sql: err.sql
        });
    }
});

// Complete renting
router.put('/:id/complete', async (req, res) => {
    try {
        await pool.query('UPDATE renting SET Status = "Completed" WHERE RentingID = ?', [req.params.id]);
        res.json({ message: 'Renting completed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// Add payment
router.post('/:id/payment', async (req, res) => {
    const { amount, method, employeeId, receiptNumber } = req.body;

    try {
        // Verify employee exists
        const [employee] = await pool.query('SELECT 1 FROM employee WHERE SSN = ?', [employeeId]);
        if (employee.length === 0) {
            return res.status(400).json({ message: 'Employee not found' });
        }

        const [result] = await pool.query(`
            INSERT INTO payment (RentingID, Amount, PaymentMethod, EmployeeID, ReceiptNumber)
            VALUES (?, ?, ?, ?, ?)
        `, [req.params.id, amount, method, employeeId, receiptNumber]);

        res.status(201).json({
            paymentId: result.insertId,
            message: 'Payment recorded successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
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
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

module.exports = router;