const mongoose = require('mongoose');
const { convertUTCToIST } = require('../utils/validationSchemas');

// Check if the Attendance model is already defined
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', new mongoose.Schema({
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
        default: () => convertUTCToIST(new Date()), // Convert default date to IST
    },
}, {
    timestamps: true
}));

// Pre-save hook to convert all dates to IST before saving
Attendance.schema.pre('save', function (next) {
    // Convert checkInTime, checkOutTime, and pauseTimes to IST
    this.checkInTime = this.checkInTime ? convertUTCToIST(this.checkInTime) : null;
    this.checkOutTime = this.checkOutTime ? convertUTCToIST(this.checkOutTime) : null;
    
    if (this.pauseTimes && this.pauseTimes.length > 0) {
        this.pauseTimes = this.pauseTimes.map(pause => ({
            start: pause.start ? convertUTCToIST(pause.start) : null,
            end: pause.end ? convertUTCToIST(pause.end) : null,
        }));
    }
    
    // Convert createdAt and updatedAt timestamps to IST
    this.createdAt = convertUTCToIST(this.createdAt);
    this.updatedAt = convertUTCToIST(this.updatedAt);

    next();
});

module.exports = Attendance;
