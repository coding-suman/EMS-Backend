require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Ensure bcryptjs is imported correctly
const User = require('./models/User'); // Adjust the path if necessary

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

const createAdminUser = async () => {
    try {
        // Check if an admin already exists
        const adminExists = await User.findOne({ role: 'Admin' });
        if (adminExists) {
            console.log('An admin user already exists.');
            process.exit(0);
        }

        // Define the admin user details
        const adminUser = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'password123', // Replace this with a strong password
            role: 'Admin'
        });

        // Hash the password before saving
        // const salt = await bcrypt.genSalt(10);  // Ensure salt is generated correctly
        // adminUser.password = await bcrypt.hash(adminUser.password, salt);  // Ensure password is hashed correctly

        // Save the admin user to the database
        await adminUser.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();
