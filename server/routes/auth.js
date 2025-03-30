const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');
require('dotenv').config();

<<<<<<< HEAD
// Create new customer
router.post('/customers', async (req, res) => {
    try {
        const { firstName, middleName, lastName, street, city, state, zipCode, idType, idNumber, registrationDate } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !street || !city || !state || !zipCode || !idType || !idNumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Generate new customer ID
        const [maxId] = await pool.query('SELECT MAX(ID) as maxId FROM customer');
        const newId = (maxId[0].maxId || 1000) + 1;

        // Insert customer into database
        await pool.query(
            'INSERT INTO customer (ID, FirstName, MiddleName, LastName, State, City, Street, ZipCode, RegistrationDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newId, firstName, middleName, lastName, state, city, street, zipCode, registrationDate || new Date().toISOString().split('T')[0]]
        );

        // Create a JWT token for the new customer
        const token = jwt.sign(
            { id: newId, role: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            id: newId,
            token,
            message: 'Customer created successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
=======
// Customer login endpoint
router.post('/customer/login', async (req, res) => {
    const { id } = req.body;

    try {
        const [customer] = await pool.query('SELECT * FROM customer WHERE ID = ?', [id]);

        if (!customer.length) {
            return res.status(401).json({ error: 'Invalid customer ID' });
        }

        const token = jwt.sign(
            { id: customer[0].ID, role: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: customer[0]
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
    }
});

// Employee login endpoint
router.post('/employee/login', async (req, res) => {
<<<<<<< HEAD
    const { ssn, password } = req.body;

    try {
        // Validate input
        if (!ssn || !password) {
            return res.status(400).json({ error: 'SSN and password are required' });
        }

=======
    const { ssn } = req.body;

    try {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        const [employee] = await pool.query('SELECT * FROM employee WHERE SSN = ?', [ssn]);

        if (!employee.length) {
            return res.status(401).json({ error: 'Invalid employee SSN' });
        }

<<<<<<< HEAD
        // In a real app, you would verify the password here
        // For now we'll just check if it matches the SSN as a placeholder
        if (password !== employee[0].SSN) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: employee[0].SSN,
                role: employee[0].Role,
                hotelId: employee[0].HotelID
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
=======
        const token = jwt.sign(
            { id: employee[0].SSN, role: employee[0].Role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        );

        res.json({
            token,
<<<<<<< HEAD
            user: {
                id: employee[0].SSN,
                firstName: employee[0].FirstName,
                lastName: employee[0].LastName,
                role: employee[0].Role,
                hotelId: employee[0].HotelID
            }
        });
    } catch (err) {
        console.error(err);
=======
            user: employee[0],
            role: employee[0].Role
        });
    } catch (err) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        res.status(500).json({ error: 'Server error' });
    }
});

<<<<<<< HEAD
// Get customer by ID
router.get('/customers/:id', async (req, res) => {
    try {
        const [customer] = await pool.query('SELECT * FROM customer WHERE ID = ?', [req.params.id]);

        if (!customer.length) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(customer[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

=======
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
module.exports = router;