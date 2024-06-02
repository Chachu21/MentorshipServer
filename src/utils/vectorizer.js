import natural from "natural";

const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

export const tfidfVectorizer = (text) => {
  if (!text) return [];
  tfidf.addDocument(text);
  const vector = [];
  tfidf.listTerms(0).forEach((term) => {
    vector.push({ term: term.term, tfidf: term.tfidf });
  });
  return vector;
};
