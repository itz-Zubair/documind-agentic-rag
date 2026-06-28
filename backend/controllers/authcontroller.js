// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT and set it in an httpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
    // Create token containing the user's MongoDB ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d' // Token expires in 24 hours
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true, // Prevents cross-site scripting (XSS) attacks by making token inaccessible via JS
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        sameSite: 'lax'
    };

    // Strip password hash from response body for security
    user.passwordHash = undefined;

    res.status(statusCode)
       .cookie('token', token, cookieOptions)
       .json({ success: true, user });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Create user (Pre-save hook handles hashing)
        const user = await User.create({
            name,
            email,
            passwordHash: password // mapped to passwordHash in schema
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ message: 'Server error during login', error: err.message });
    }
};

// @desc    Logout user / Clear Cookie
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
        httpOnly: true
    });

    res.status(200).json({ success: true, message: 'User logged out successfully' });
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        // req.user is populated by the protect middleware we will build next
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching user profile' });
    }
};