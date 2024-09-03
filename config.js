const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Configuration for different environments
const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        dbURI: process.env.MONGO_URI,
        jwtSecret: process.env.JWT_SECRET,
    },
    production: {
        dbURI: process.env.MONGO_URI_PROD,
        jwtSecret: process.env.JWT_SECRET_PROD,
    }
};

const currentConfig = config[env];

module.exports = currentConfig;
