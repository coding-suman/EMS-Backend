const User = require('../models/User');  // Import the User model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidationSchema } = require('../utils/validationSchemas'); // Import the Joi schema

// Register a new user
const registerUser = async (req, res) => {
    // Validate the request body against the schema
    const { error } = registerValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, role, firstName, lastName } = req.body;

    try {
        // Check if username already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username already in use' });
        }

        // Check if email already exists
        user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create a new user object
        user = new User({
            firstName,
            lastName,
            email,
            password,
            role
        });

        // Save the user to the database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                firstName: firstName,
                lastName: lastName,
                username: username,
                email: email,
                role: role
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Log in an existing user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Controller for creating an admin user (protected route)
const createAdminUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new admin user
        user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'Admin'
        });

        // Save the admin user to the database
        await user.save();

        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        res.status(500).send('Server error');
    }
};


const updateUserProfile = async (req, res) => {
    const { firstName, lastName, email } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};

module.exports = { registerUser, loginUser, createAdminUser, updateUserProfile };
