import { cosineSimilarity } from "./similarity.js"; 

export const calculateSimilarity = (features1, features2) => {
  const skillSimilarity = cosineSimilarity(features1.skills, features2.skills);
  const expertiseSimilarity = cosineSimilarity(
    features1.expertise,
    features2.expertise
  );
  const experienceLevelSimilarity =
    features1.experienceLevel === features2.experienceLevel ? 1 : 0;
  const preferedExperienceLevelSimilarity =
    features1.preferedExperienceLevel === features2.preferedExperienceLevel
      ? 1
      : 0;
  const languageSimilarity = features1.language === features2.language ? 1 : 0;
//the predetermined cofficients are given by the importance of each value in determining similarities
  const totalSimilarity =
    0.4 * skillSimilarity +
    0.3 * expertiseSimilarity +
    0.1 * experienceLevelSimilarity +
    0.1 * preferedExperienceLevelSimilarity +
    0.1 * languageSimilarity;

  return totalSimilarity;
};
