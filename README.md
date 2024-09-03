# EMS-Backend
Employee Management System - Backend

# Attendance Management System Backend

This is the backend service for the Attendance Management System, built using Node.js, Express, and MongoDB. This service handles user authentication, attendance management, and role-based access control (RBAC) for admins and employees.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [Attendance Routes](#attendance-routes)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure user registration and login with JWT-based authentication.
- **Role-Based Access Control (RBAC)**: Separate permissions for Admins and Employees.
- **Attendance Management**: Employees can check-in, check-out, pause, and resume their attendance. Admins can view and update attendance records.
- **Secure Data Handling**: All sensitive information is handled securely with encryption and hashing.
- **Scalable Architecture**: Built to be scalable and maintainable, with clear separation of concerns.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express**: Web framework for Node.js, designed for building robust APIs.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: MongoDB object modeling for Node.js.
- **JWT (jsonwebtoken)**: For secure user authentication.
- **bcryptjs**: For password hashing and security.
- **dotenv**: For environment variable management.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/coding-suman/EMS-Backend.git
   cd EMS-Backend
