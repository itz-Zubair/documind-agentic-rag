const Chunk = require('../models/chunk');
const { generateEmbeddings } = require('../services/embeddingservice');
const { GoogleGenAI } = require('@google/generative-ai'); 

exports.queryDocument = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question text is required' });
        }

        // 1. Generate the 1024-dimension vector for the question via Cohere
        // Note: Using 'search_query' input type because this is a retrieval task
        const queryVectorArray = await generateEmbeddings([question], 'search_query');
        const queryVector = queryVectorArray[0];

        // 2. Perform Vector Search inside MongoDB Atlas
        const pipeline = [
            {
                $vectorSearch: {
                    index: 'vector_index', // ◄ Matches your existing Atlas index name
                    path: 'embedding',
                    queryVector: queryVector,
                    numCandidates: 10,
                    limit: 3 // Pull the top 3 closest matching text blocks
                }
            },
            {
                $project: {
                    text: 1,
                    pageNumber: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ];

        const matchingChunks = await Chunk.aggregate(pipeline);

        if (!matchingChunks || matchingChunks.length === 0) {
            return res.status(200).json({ 
                answer: "I couldn't find any relevant context in your files to answer that question." 
            });
        }

        // 3. Combine the text from the matching chunks
        const compiledContext = matchingChunks.map(chunk => chunk.text).join('\n\n');

        // 4. Send the context and question to Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemPrompt = `
You are an expert workspace assistant. Answer the user's question using ONLY the provided document context below. 
If the context doesn't contain the answer, say "I cannot find that information in the uploaded workspace files."

Context:
${compiledContext}

User Question: ${question}
Answer:`;

        const aiResponse = await model.generateContent(systemPrompt);
        const generatedAnswer = aiResponse.response.text();

        // 5. Respond with the answer and references
        res.status(200).json({
            success: true,
            answer: generatedAnswer,
            sources: matchingChunks.map(c => ({ page: c.pageNumber, matchScore: c.score }))
        });

    } catch (error) {
        res.status(500).json({ message: 'Error processing vector query request', error: error.message });
    }
};