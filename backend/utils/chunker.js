// backend/utils/chunker.js

/**

 * @param {Array} pages 
 * @param {Number} chunkSize
 * @param {Number} overlap
 */
exports.chunkTextWithPages = (pages, chunkSize = 800, overlap = 100) => {
    const chunks = [];
    let chunkIndex = 0;

    // Process each page individually so we always know exactly what page text came from
    pages.forEach((pageText, idx) => {
        const pageNumber = idx + 1;
        let start = 0;

        while (start < pageText.length) {
            let end = start + chunkSize;
            let textSegment = pageText.substring(start, end);

            chunks.push({
                text: textSegment.trim(),
                pageNumber,
                chunkIndex
            });

            chunkIndex++;
            start += (chunkSize - overlap);
        }
    });

    return chunks;
};