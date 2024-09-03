const mongoose = require('mongoose');

// Define the Attendance schema
const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    checkInTime: {
        type: Date,
        default: null,
    },
    checkOutTime: {
        type: Date,
        default: null,
    },
    pauseTimes: [
        {
            start: { type: Date, default: null },
            end: { type: Date, default: null },
        }
    ],
    status: {
        type: String,
        enum: ['Checked In', 'Checked Out', 'Paused', 'Resumed'],
        default: 'Checked Out',
    },
    totalWorkHours: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

// Create the Attendance model
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
