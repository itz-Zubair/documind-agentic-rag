const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({

    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], default: [] }, 
    pageNumber: { type: Number, required: true },
    chunkIndex: { type: Number, required: true }
}, { timestamps: true });

// Compound index ensures that if a user deletes a file, we can instantly delete all its chunks
chunkSchema.index({ documentId: 1, userId: 1 });

module.exports = mongoose.model('Chunk', chunkSchema);