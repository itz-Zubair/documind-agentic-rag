// backend/controllers/documentController.js
const Document = require('../models/Document');
const Chunk = require('../models/chunk');
const pdfParseModule = require('pdf-parse'); // ◄ Keep standard import name here
const { chunkTextWithPages } = require('../utils/chunker');
const { generateEmbeddings } = require('../services/embeddingservice'); 

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create metadata document tracker
        const docMeta = await Document.create({
            userId: req.user.id,
            filename: req.file.filename || `upload_${Date.now()}.pdf`,
            originalName: req.file.originalname,
            status: 'processing'
        });

        let extractedText = '';

        // 🛠️ SAFELY HANDLE BOTH pdf-parse VERSION 1 AND VERSION 2
        if (pdfParseModule.PDFParse) {
            // Version 2 structure (New Class API)
            const parser = new pdfParseModule.PDFParse({ data: req.file.buffer });
            const result = await parser.getText();
            extractedText = result.text;
            await parser.destroy(); // Free up memory allocation
        } else {
            // Version 1 structure (Classic Function API)
            const parsePDF = pdfParseModule.default || pdfParseModule;
            const parsedData = await parsePDF(req.file.buffer);
            extractedText = parsedData.text;
        }

        // Split text content into pages and process chunks
        const pages = extractedText.split(/\f/);
        const processedChunks = chunkTextWithPages(pages);

        // Map text out for embedding creation
        const textStringsToEmbed = processedChunks.map(chunk => chunk.text);

        // Generate the 1024-dimensional vectors via Cohere
        const vectors = await generateEmbeddings(textStringsToEmbed, 'search_document');

        // Pair the chunks with their corresponding vectors
        const chunksToInsert = processedChunks.map((chunk, index) => ({
            documentId: docMeta._id,
            userId: req.user.id,
            text: chunk.text,
            pageNumber: chunk.pageNumber,
            chunkIndex: chunk.chunkIndex,
            embedding: vectors[index]
        }));

        // Bulk insert directly into MongoDB Atlas
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