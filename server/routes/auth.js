const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../db');
require('dotenv').config();

// Debug: Verify environment variables on startup
console.log('Environment Variables:', {
  DB_HOST: process.env.DB_HOST ? 'Set' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'MISSING - THIS WILL CAUSE ERRORS'
});

router.post('/employee/login', async (req, res) => {
    console.log('Login request received for SSN:', req.body.ssn);
    
    try {
        // Validate JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const { ssn } = req.body;
        const cleanSSN = ssn.replace(/\D/g, '');

        // Validate SSN
        if (cleanSSN.length !== 9) {
            return res.status(400).json({ 
                success: false,
                message: 'SSN must be 9 digits' 
            });
        }

        // Database query with error handling
        const [employee] = await pool.query('SELECT * FROM employee WHERE SSN = ?', [cleanSSN]);
        
        if (!employee.length) {
            return res.status(401).json({ 
                success: false,
                message: 'Employee not found' 
            });
        }

        // Create token
        const token = jwt.sign(
            {
                id: employee[0].SSN,
                role: employee[0].Role,
                hotelId: employee[0].HotelID
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: employee[0].SSN,
                firstName: employee[0].FirstName,
                lastName: employee[0].LastName,
                role: employee[0].Role,
                hotelId: employee[0].HotelID
            }
        });
        
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Login failed',
            error: err.message  // Send error details for debugging
        });
    }
});

module.exports = router;