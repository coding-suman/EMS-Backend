require('dotenv').config();
require('./cronJobs/attendanceReminder');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
const config = require('./config');

const connectDB = async () => {
    try {
        await mongoose.connect(config.dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit the process with a failure
    }
};

connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const notificationRoutes = require('./routes/notificationRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', require('./routes/employees'));

// Placeholder route
app.get('/', (req, res) => {
    res.send('Attendance System API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
