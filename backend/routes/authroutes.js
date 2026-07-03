// backend/routes/authRoutes.js
const express = require('express');
const { register, login, logout, getMe, googleLogin } = require('../controllers/authcontroller');
const { protect } = require('../middleware/authmiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

module.exports = router;