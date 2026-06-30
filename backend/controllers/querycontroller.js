// backend/controllers/queryController.js
const Chunk = require('../models/chunk');
const Message = require('../models/message'); // ◄ New Model
const { generateEmbeddings } = require('../services/embeddingservice');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        // Fetch the last 50 messages for this specific user, sorted oldest to newest
        // sorting by 'createdAt: 1' makes it incredibly easy for the frontend to map over and display
        const chatHistory = await Message.find({ userId: userId })
            .sort({ createdAt: 1 })
            .limit(50); 

        res.status(200).json({
            success: true,
            count: chatHistory.length,
            history: chatHistory.map(msg => ({
                id: msg._id,
                role: msg.role, // 'user' or 'model'
                content: msg.content,
                timestamp: msg.createdAt
            }))
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching conversation history', 
            error: error.message 
        });
    }
};

exports.queryDocument = async (req, res) => {
    try {
        const { question } = req.body;
     const userId = req.user.id || req.user._id; // ◄ Fallback check to ensure it catches both formats// Derived from your authMiddleware protect function// Derived from your authMiddleware protect function

        if (!question) {
            return res.status(400).json({ message: 'Question text is required' });
        }

        // ==========================================
        // FEATURE 1: RATE LIMIT CHECK (3 MESSAGES/DAY)
        // ==========================================
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyMessageCount = await Message.countDocuments({
            userId: userId,
            role: 'user',
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (dailyMessageCount >= 3) {
            return res.status(429).json({
                success: false,
                message: "Daily limit reached. You can only send 3 messages per 24 hours."
            });
        }

        // ==========================================
        // FEATURE 2: CONTEXT WINDOW (CHAT HISTORY)
        // ==========================================
        // Fetch the last 6 messages to provide conversational history context
        const priorMessages = await Message.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(6);
        
        // Reverse them so they read chronologically
        priorMessages.reverse();

        // Format history into a clean structural text block for the LLM
        const formattedHistory = priorMessages.map(msg => 
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');

        // 1. Vector Search for relevant document chunks
        const queryVectorArray = await generateEmbeddings([question], 'search_query');
        const queryVector = queryVectorArray[0];

        const pipeline = [
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding',
                    queryVector: queryVector,
                    numCandidates: 10,
                    limit: 3
                }
            },
            {
                $project: { text: 1, pageNumber: 1, score: { $meta: 'vectorSearchScore' } }
            }
        ];

        const matchingChunks = await Chunk.aggregate(pipeline);
        const compiledContext = matchingChunks.map(chunk => chunk.text).join('\n\n');

        // 2. Synthesize prompt with both Document Context AND Chat History
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const systemPrompt = `
You are a brilliant, friendly, and natural workspace assistant. 
Answer the user's question using the provided document context below, while maintaining the natural flow of the conversation history.

Document Context:
${compiledContext}

Recent Conversation History:
${formattedHistory || "No previous history in this session."}

Current User Question: ${question}
Answer:`;

        const aiResponse = await model.generateContent(systemPrompt);
        const generatedAnswer = aiResponse.response.text();

        // ==========================================
        // FEATURE 3: SAVE MESSAGES TO HISTORY
        // ==========================================
        await Message.create([
            { userId: userId, role: 'user', content: question },
            { userId: userId, role: 'model', content: generatedAnswer }
        ]);

        // 3. Send response
        res.status(200).json({
            success: true,
            answer: generatedAnswer,
            sources: matchingChunks.map(c => ({ page: c.pageNumber, matchScore: c.score }))
        });

    } catch (error) {
        res.status(500).json({ message: 'Error processing vector query request', error: error.message });
    }
};

// Append to the bottom of backend/controllers/queryController.js

// 3. Clear all chat history for the logged-in user
exports.clearChatHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        await Message.deleteMany({ userId: userId });

        res.status(200).json({
            success: true,
            message: 'Chat history cleared successfully. Context window reset.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error clearing chat history', error: error.message });
    }
};