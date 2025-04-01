const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all employees
// In your employee route
// In your employee route
router.get('/', async (req, res) => {
    try {
        const connection = await db.getConnection();
        try {
            const [employees] = await connection.query(`
          SELECT 
            e.*,
            h.HotelName,
            COALESCE(e.Salary, 0) AS Salary
          FROM employee e
          LEFT JOIN hotel h ON e.HotelID = h.HotelID
        `);

            // Ensure we always return an array, even if empty
            const responseData = Array.isArray(employees) ? employees : [];

            res.json({
                success: true,
                data: responseData  // Consistent response structure
            });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to fetch employees',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// GET single employee by SSN
router.get('/:ssn', async (req, res) => {
    try {
        const connection = await db.getConnection();

        try {
            const [rows] = await connection.query(`
                SELECT 
                    e.*,
                    h.HotelName
                FROM employee e
                LEFT JOIN hotel h ON e.HotelID = h.HotelID
                WHERE e.SSN = ?
            `, [req.params.ssn]);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Employee not found'
                });
            }

            res.json({
                success: true,
                data: rows[0]
            });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to fetch employee'
        });
    }
});

// POST create new employee
router.post('/', async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({
            success: false,
            error: 'Unsupported Media Type',
            message: 'Content-Type must be application/json'
        });
    }

    try {
        const {
            SSN,
            FirstName,
            LastName,
            Role,
            Salary,
            Street,
            City,
            State,
            ZipCode,
            HireDate,
            HotelID,
            MiddleName = null
        } = req.body;

        // Validation
        const requiredFields = {
            SSN: 'SSN is required',
            FirstName: 'First name is required',
            LastName: 'Last name is required',
            Role: 'Role is required',
            Salary: 'Salary is required',
            Street: 'Street address is required',
            City: 'City is required',
            State: 'State is required',
            ZipCode: 'Zip code is required',
            HireDate: 'Hire date is required'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([field]) => !req.body[field])
            .map(([_, message]) => message);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Missing required fields',
                details: missingFields
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                `INSERT INTO employee (
                    SSN, FirstName, MiddleName, LastName, Role, 
                    Salary, Street, City, State, ZipCode, 
                    HireDate, HotelID
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    SSN,
                    FirstName,
                    MiddleName,
                    LastName,
                    Role,
                    Salary,
                    Street,
                    City,
                    State,
                    ZipCode,
                    HireDate,
                    HotelID || null
                ]
            );

            await connection.commit();

            // Return the created employee
            const [newEmployee] = await connection.query(
                'SELECT * FROM employee WHERE SSN = ?',
                [SSN]
            );

            res.status(201).json({
                success: true,
                message: 'Employee created successfully',
                data: newEmployee[0]
            });

        } catch (err) {
            await connection.rollback();

            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    error: 'Duplicate entry',
                    message: 'Employee with this SSN already exists'
                });
            }

            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Employee creation failed:', err);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to create employee',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// PUT update employee
router.put('/:ssn', async (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({
            success: false,
            error: 'Unsupported Media Type',
            message: 'Content-Type must be application/json'
        });
    }

    try {
        const {
            FirstName,
            LastName,
            Role,
            Salary,
            Street,
            City,
            State,
            ZipCode,
            HireDate,
            HotelID,
            MiddleName = null
        } = req.body;

        // Validation
        const requiredFields = {
            FirstName: 'First name is required',
            LastName: 'Last name is required',
            Role: 'Role is required',
            Salary: 'Salary is required',
            Street: 'Street address is required',
            City: 'City is required',
            State: 'State is required',
            ZipCode: 'Zip code is required',
            HireDate: 'Hire date is required'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([field]) => !req.body[field])
            .map(([_, message]) => message);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Missing required fields',
                details: missingFields
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                `UPDATE employee SET
                    FirstName = ?,
                    MiddleName = ?,
                    LastName = ?,
                    Role = ?,
                    Salary = ?,
                    Street = ?,
                    City = ?,
                    State = ?,
                    ZipCode = ?,
                    HireDate = ?,
                    HotelID = ?,
                    UpdatedAt = CURRENT_TIMESTAMP
                WHERE SSN = ?`,
                [
                    FirstName,
                    MiddleName,
                    LastName,
                    Role,
                    Salary,
                    Street,
                    City,
                    State,
                    ZipCode,
                    HireDate,
                    HotelID || null,
                    req.params.ssn
                ]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Employee not found'
                });
            }

            await connection.commit();

            // Return the updated employee
            const [updatedEmployee] = await connection.query(
                'SELECT * FROM employee WHERE SSN = ?',
                [req.params.ssn]
            );

            res.json({
                success: true,
                message: 'Employee updated successfully',
                data: updatedEmployee[0]
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Employee update failed:', err);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to update employee',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// DELETE employee
router.delete('/:ssn', async (req, res) => {
    try {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                'DELETE FROM employee WHERE SSN = ?',
                [req.params.ssn]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Employee not found'
                });
            }

            await connection.commit();

            res.json({
                success: true,
                message: 'Employee deleted successfully'
            });
        } catch (err) {
            await connection.rollback();

            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({
                    success: false,
                    error: 'Conflict',
                    message: 'Cannot delete employee - referenced by other records'
                });
            }

            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to delete employee'
        });
    }
});

module.exports = router;