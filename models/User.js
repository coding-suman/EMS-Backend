const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { convertUTCToIST } = require('../utils/validationSchemas');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.createdAt = convertUTCToIST(this.createdAt);
        this.updatedAt = convertUTCToIST(this.updatedAt);
        next();
    } catch (error) {
        return next(error);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
