// routes/employees.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Route to fetch all employees
router.get('/employees', protect, adminOnly, async (req, res) => {
  try {
    // Find all employees
    const employees = await User.find({ role: 'Employee' }).select('-password'); // Exclude password field for security
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

module.exports = router;
