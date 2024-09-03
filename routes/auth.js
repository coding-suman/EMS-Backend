const express = require('express');
const { registerUser, loginUser, createAdminUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Example protected route (adjust or add more protected routes as needed)
router.get('/profile', protect, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Admin creation route (protected)
router.post('/admin/create', protect, adminOnly, createAdminUser);

module.exports = router;
