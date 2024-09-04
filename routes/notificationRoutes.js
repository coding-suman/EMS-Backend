// routes/notificationRoutes.js
const express = require('express');
const { createNotification, getNotificationsForUser, markNotificationAsRead } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createNotification);
router.get('/', protect, getNotificationsForUser);
router.put('/:id/read', protect, markNotificationAsRead);

module.exports = router;

