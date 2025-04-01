const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all hotel chains
router.get('/', async (req, res) => {
    try {
        const [chains] = await db.query(`
            SELECT * FROM HotelChain ORDER BY ChainName
        `);
        res.json(chains);
    } catch (error) {
        console.error("Error fetching chains:", error);
        res.status(500).json({ error: "Failed to fetch chains" });
    }
});

module.exports = router;