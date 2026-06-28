
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
    pageCount: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexing userId makes searching for "All documents uploaded by User X" incredibly fast
documentSchema.index({ userId: 1 });

module.exports = mongoose.model('Document', documentSchema);