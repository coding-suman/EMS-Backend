const Attendance = require('../models/Attendance');
const User = require('../models/User');
const mongoose = require('mongoose');

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

const getMonthlyAttendanceRecords = async (req, res) => {
    const { month } = req.query; // 'current' or 'YYYY-MM' format

    let startDate, endDate;

    if (month === 'current') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Correctly sets to the current year and month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Sets to the end of the current month
    } else if (month && /^\d{4}-\d{2}$/.test(month)) {
        const [year, monthIndex] = month.split('-');
        console.log(year, monthIndex);

        startDate = new Date(parseInt(year), parseInt(monthIndex) - 1, 1); // Sets to the first day of the specified month and year
        endDate = new Date(parseInt(year), parseInt(monthIndex), 0, 23, 59, 59, 999); // Sets to the last day of the specified month and year
    } else {
        return res.status(400).json({ message: 'Invalid or missing month parameter' });
    }

    try {
        const attendanceRecords = await Attendance.aggregate([
            {
                '$match': {
                    'userId': new mongoose.Types.ObjectId(req.user.id),
                    'createdAt': {
                        '$gte': startDate,
                        '$lte': endDate
                    }
                }
            },
            {
                '$addFields': {
                    'totalPauseTime': {
                        '$sum': {
                            '$map': {
                                'input': '$pauseTimes',
                                'as': 'pause',
                                'in': {
                                    '$divide': [
                                        {
                                            '$subtract': ['$$pause.end', '$$pause.start']
                                        },
                                        1000 * 60 * 60 // Convert milliseconds to hours
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ]);

        res.json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ message: 'Error fetching attendance data' });
    }
};

const getAdminMonthlyAttendanceRecords = async (req, res) => {
    const { userId, month } = req.query; // userId and month ('YYYY-MM' format)

    if (!userId || !month) {
        return res.status(400).json({ message: 'User ID and month are required' });
    }

    let startDate, endDate;

    if (month === 'current') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (/^\d{4}-\d{2}$/.test(month)) {
        const [year, monthIndex] = month.split('-');
        startDate = new Date(parseInt(year), parseInt(monthIndex) - 1, 1);
        endDate = new Date(parseInt(year), parseInt(monthIndex), 0, 23, 59, 59, 999);
    } else {
        return res.status(400).json({ message: 'Invalid month format' });
    }

    try {
        const attendanceRecords = await Attendance.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
                    createdAt: {  // Filter by createdAt field to match month
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                '$addFields': {
                    'totalPauseTime': {
                        '$sum': {
                            '$map': {
                                'input': '$pauseTimes',
                                'as': 'pause',
                                'in': {
                                    '$divide': [
                                        {
                                            '$subtract': ['$$pause.end', '$$pause.start']
                                        },
                                        1000 * 60 * 60 // Convert milliseconds to hours
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                "$project": {
                    "userId": 1,
                    "createdAt": 1,
                    "checkInTime": 1,
                    "checkOutTime": 1,
                    "status": 1,
                    "totalWorkHours": 1,
                    "totalPauseTime": 1,
                    "firstName": "$userData.firstName",
                    "lastName": "$userData.lastName",
                    "email": "$userData.email"
                }
            },
        ]);

        res.json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ message: 'Error fetching attendance data' });
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
    updateAttendanceRecord,
    getMonthlyAttendanceRecords,
    getAdminMonthlyAttendanceRecords
};
