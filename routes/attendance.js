const express = require('express');
const {
    checkIn,
    checkOut,
    pauseAttendance,
    resumeAttendance,
    getAttendanceRecords,
    updateAttendanceRecord,
    getMonthlyAttendanceRecords,
    getAdminMonthlyAttendanceRecords
} = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for employee check-in
router.post('/checkin', protect, checkIn);

// Route for employee check-out
router.post('/checkout', protect, checkOut);

// Route to pause attendance
router.post('/pause', protect, pauseAttendance);

// Route to resume attendance
router.post('/resume', protect, resumeAttendance);

// Route to get all attendance records (Admin only)
router.get('/', protect, getAttendanceRecords);

// Route to update an attendance record (Admin only)
router.put('/:id', protect, updateAttendanceRecord);

router.get('/attendance', protect, getMonthlyAttendanceRecords);

router.get('/admin', protect, adminOnly, getAdminMonthlyAttendanceRecords);

module.exports = router;
