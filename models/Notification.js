const mongoose = require('mongoose');
const { convertUTCToIST } = require('../utils/validationSchemas');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['checkout_reminder', 'checkin_reminder', 'attendance_reminder'], required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => convertUTCToIST(new Date()) }
}, {
    timestamps: true
});

notificationSchema.pre('save', function (next) {
    this.createdAt = convertUTCToIST(this.createdAt);
    this.updatedAt = convertUTCToIST(this.updatedAt);
    next();
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
