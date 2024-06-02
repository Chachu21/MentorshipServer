
export const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, item, index) => sum + item.tfidf * vecB[index].tfidf, 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, item) => sum + item.tfidf * item.tfidf, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, item) => sum + item.tfidf * item.tfidf, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0; // If one of the vectors is zero

  return dotProduct / (magnitudeA * magnitudeB);
};
