// backend/routes/documentRoutes.js
const express = require('express');
const multer = require('multer');
const { uploadDocument } = require('../controllers/documentcontroller');
const { protect } = require('../middleware/authmiddleware');
const { queryDocument,getChatHistory } = require('../controllers/querycontroller');

const router = express.Router();

// 1. Setup in-memory staging to catch files without writing directly to disk
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Hard 10MB cutoff point (PRD Compliance FR-27)
    },
    fileFilter: (req, file, cb) => {
        // Enforce the PDF-only rule right at the network boundary
        if (file.mimetype === 'application/pdf') {
            cb(null, true); // Clean match; allow passage
        } else {
            cb(new Error('Only standardized PDF files (.pdf) are supported!'), false); // Reject instantly
        }
    }
});

// 2. Wire the protected endpoint
// Note: 'pdfFile' is the form data key your React app must target during upload
router.post('/upload', protect, upload.single('pdfFile'), uploadDocument);
router.post('/query', protect, queryDocument);
router.get('/history', protect, getChatHistory);
// 3. Graceful route-level error handling layer for Multer rejections
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Maximum threshold is 10MB.' });
        }
    }
    res.status(400).json({ message: error.message });
});

module.exports = router;