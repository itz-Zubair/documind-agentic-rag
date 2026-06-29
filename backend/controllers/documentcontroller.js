// backend/controllers/documentController.js
const Document = require('../models/Document');
const Chunk = require('../models/chunk');
const pdfParseModule = require('pdf-parse'); 
const { chunkTextWithPages } = require('../utils/chunker');
const { generateEmbeddings } = require('../services/embeddingservice');

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 🛠️ FIXED: Rate limiting logic is now fully wrapped inside this async handler
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const userId = req.user.id || req.user._id;

        // Count how many files this specific user has uploaded in the last 24 hours
        const dailyUploadCount = await Document.countDocuments({
            userId: userId,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (dailyUploadCount >= 1) {
            return res.status(429).json({
                success: false,
                message: "Upload limit reached. You can only upload 1 PDF file per 24 hours."
            });
        }

        // 1. Create metadata document tracker
        const docMeta = await Document.create({
            userId: userId,
            filename: req.file.filename || `upload_${Date.now()}.pdf`,
            originalName: req.file.originalname,
            status: 'processing'
        });

        let extractedText = '';

        // 2. Extract plain text content from the file buffer
        if (pdfParseModule.PDFParse) {
            const parser = new pdfParseModule.PDFParse({ data: req.file.buffer });
            const result = await parser.getText();
            extractedText = result.text;
            await parser.destroy(); 
        } else {
            const parsePDF = pdfParseModule.default || pdfParseModule;
            const parsedData = await parsePDF(req.file.buffer);
            extractedText = parsedData.text;
        }

        // 3. Process layout chunk divisions
        const pages = extractedText.split(/\f/);
        const processedChunks = chunkTextWithPages(pages);
        const textStringsToEmbed = processedChunks.map(chunk => chunk.text);

        // 4. Generate vectors via Cohere
        const vectors = await generateEmbeddings(textStringsToEmbed, 'search_document');

        // 5. Build documents structure arrays
        const chunksToInsert = processedChunks.map((chunk, index) => ({
            documentId: docMeta._id,
            userId: userId,
            text: chunk.text,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            embedding: vectors[index]
        }));

        // 6. Bulk write collections to MongoDB Atlas
        await Chunk.insertMany(chunksToInsert);

        docMeta.status = 'ready';
        docMeta.pageCount = pages.length;
        await docMeta.save();

        res.status(201).json({
            success: true,
            message: 'Document processed and vector embeddings saved successfully.',
            document: docMeta
        });

    } catch (error) {
        res.status(500).json({ message: 'Server upload handling error', error: error.message });
    }
};