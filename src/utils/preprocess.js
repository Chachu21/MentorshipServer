import { tfidfVectorizer } from "./vectorizer.js";
import { encodeExperienceLevel, encodeLanguage } from "./encoders.js";

export const preprocessUserData = (user) => {
  return {
    skills: tfidfVectorizer(user.skill),
    expertise: tfidfVectorizer(user.expertise),
    experienceLevel: encodeExperienceLevel(user.experienceLevel),
    preferedExperienceLevel: encodeExperienceLevel(
      user.preferedExperianceLevel
    ),
    language: encodeLanguage(user.language),
  };
};
