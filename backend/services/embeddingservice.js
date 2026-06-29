
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

exports.generateEmbeddings = async (texts, inputType = 'search_document') => {
    try {
        if (!texts || texts.length === 0) return [];

        const response = await cohere.embed({
            model: 'embed-english-v3.0',
            texts: texts,
            inputType: inputType,
            embeddingTypes: ['float'],
        });

        return response.embeddings.float; 
    } catch (error) {
        console.error('❌ Cohere API Error:', error);
        throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
};