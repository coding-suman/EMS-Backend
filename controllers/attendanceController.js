const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Employee Check-In
const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;   // Extract user ID from the JWT token

        // Check if user is already checked in
        const existingAttendance = await Attendance.findOne({ userId, checkOutTime: null });
        if (existingAttendance) {
            return res.status(400).json({ message: 'Already checked in' });
        }

        // Create a new attendance record
        const attendance = new Attendance({ userId, checkInTime: new Date(), status: 'Checked In' });
        await attendance.save();

        res.status(200).json({ message: 'Checked in successfully', attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Employee Check-Out
const checkOut = async (req, res) => {
    try {
        const userId = req.user.id; 

        // Find the active attendance record
        const attendance = await Attendance.findOne({ userId, checkOutTime: null });
        if (!attendance) {
            return res.status(400).json({ message: 'Not checked in' });
        }

        // Update attendance record with check-out time
        attendance.checkOutTime = new Date();
        attendance.status = 'Checked Out';

        // Calculate total work hours excluding pause times
        let totalPausedTime = 0;
        attendance.pauseTimes.forEach(pause => {
            if (pause.start && pause.end) {
                totalPausedTime += (new Date(pause.end) - new Date(pause.start));
            }
        });

        const totalWorkTime = new Date(attendance.checkOutTime) - new Date(attendance.checkInTime) - totalPausedTime;
        attendance.totalWorkHours = totalWorkTime / (1000 * 60 * 60); // Convert milliseconds to hours

        await attendance.save();

        res.status(200).json({ message: 'Checked out successfully', attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Pause Attendance
const pauseAttendance = async (req, res) => {
    try {
        const userId = req.user.id; 

        // Find the active attendance record
        const attendance = await Attendance.findOne({ userId, checkOutTime: null, status: 'Checked In' });
        if (!attendance) {
            return res.status(400).json({ message: 'Not checked in or already paused' });
        }

        // Add a new pause start time
        attendance.pauseTimes.push({ start: new Date(), end: null });
        attendance.status = 'Paused';
        await attendance.save();

        res.status(200).json({ message: 'Attendance paused successfully', attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Resume Attendance
const resumeAttendance = async (req, res) => {
    try {
        const userId = req.user.id; 

        // Find the active attendance record
        const attendance = await Attendance.findOne({ userId, checkOutTime: null, status: 'Paused' });
        if (!attendance) {
            return res.status(400).json({ message: 'Not paused or already resumed' });
        }

        // Update the last pause record with an end time
        const lastPause = attendance.pauseTimes[attendance.pauseTimes.length - 1];
        if (lastPause && !lastPause.end) {
            lastPause.end = new Date();
        }
        attendance.status = 'Checked In';
        await attendance.save();

        res.status(200).json({ message: 'Attendance resumed successfully', attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all attendance records (Admin only)
const getAttendanceRecords = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find().populate('userId', 'username email role');
        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update an attendance record (Admin only)
const updateAttendanceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkInTime, checkOutTime, status } = req.body;

        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Update attendance fields
        if (checkInTime) attendance.checkInTime = checkInTime;
        if (checkOutTime) attendance.checkOutTime = checkOutTime;
        if (status) attendance.status = status;

        await attendance.save();
        res.status(200).json({ message: 'Attendance record updated successfully', attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    checkIn,
    checkOut,
    pauseAttendance,
    resumeAttendance,
    getAttendanceRecords,
    updateAttendanceRecord
};
