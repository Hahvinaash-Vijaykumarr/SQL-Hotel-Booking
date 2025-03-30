const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({
            error: 'Unsupported Media Type',
            message: 'Content-Type must be application/json'
        });
    }

    try {
        const { firstName, middleName, lastName, state, city, street, zipCode, idType, idNumber } = req.body;

        const requiredFields = {
            firstName: 'First name is required',
            lastName: 'Last name is required',
            street: 'Street address is required',
            city: 'City is required',
            state: 'State is required',
            zipCode: 'Zip code is required',
            idType: 'ID type is required',
            idNumber: 'ID number is required'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([field]) => !req.body[field])
            .map(([_, message]) => message);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: missingFields
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                `INSERT INTO customer 
                (FirstName, MiddleName, LastName, State, City, Street, ZipCode, RegistrationDate, IDType, IDNumber) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    firstName,
                    middleName || null,
                    lastName,
                    state,
                    city,
                    street,
                    zipCode,
                    new Date().toISOString().split('T')[0],
                    idType,
                    idNumber
                ]
            );

            await connection.commit();

            return res.status(201).json({
                success: true,
                idNumber: idNumber, // Return the ID number for booking creation
                customerId: result.insertId,
                message: 'Customer created successfully'
            });

        } catch (err) {
            await connection.rollback();

            if (err.code === 'ER_BAD_FIELD_ERROR') {
                return res.status(500).json({
                    error: 'Database configuration error',
                    message: 'Required database columns are missing',
                    details: process.env.NODE_ENV === 'development' ? {
                        missingColumn: err.sqlMessage.match(/Unknown column '(.+?)'/)[1],
                        sqlState: err.sqlState
                    } : undefined
                });
            }

            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'Duplicate entry',
                    message: 'This ID number already exists in our system'
                });
            }

            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error('Customer creation failed:', {
            error: err.message,
            code: err.code,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });

        return res.status(500).json({
            error: 'Customer creation failed',
            message: 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? {
                message: err.message,
                code: err.code
            } : undefined
        });
    }
});

// Add endpoint to get customer by ID number
router.get('/:idNumber', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM customer WHERE IDNumber = ?',
            [req.params.idNumber]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;