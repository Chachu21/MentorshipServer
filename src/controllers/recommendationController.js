import { preprocessUserData } from "../utils/preprocess.js";
import { calculateSimilarity } from "../utils/calculateSimilarity.js";
import User from "../models/users.js";

//TODO
// the recommendation is based on similarity in
//     0.4 * skillSimilarity +
//     0.3 * expertiseSimilarity +
//     0.1 * experienceLevelSimilarity +
//     0.1 * preferedExperienceLevelSimilarity +
//     0.1 * languageSimilarity;
export const getRecommendation = async (req, res) => {
  try {
    const menteeId = req.params.menteeId;
    const mentee = await User.findById(menteeId);

    if (!mentee) {
      return res.status(404).json({ error: "Mentee not found" });
    }

    const mentors = await User.find({ role: "mentor", is_approved: true });

    const menteeData = {
      skill: mentee.skill,
      expertise: mentee.expertise,
      experienceLevel: mentee.experienceLevel,
      preferedExperienceLevel: mentee.preferedExperianceLevel,
      language: mentee.language,
    };
    const menteeFeatures = preprocessUserData(menteeData);

    const mentorScores = mentors.map((mentor) => {
      const mentorData = {
        skill: mentor.skill,
        expertise: mentor.expertise,
        experienceLevel: mentor.experienceLevel,
        language: mentor.language,
      };
      const mentorFeatures = preprocessUserData(mentorData);
      const similarityScore = calculateSimilarity(
        menteeFeatures,
        mentorFeatures
      );
      return { mentor, score: similarityScore };
    });

    mentorScores.sort((a, b) => b.score - a.score);
    const topMentors = mentorScores.slice(0, 2).map((item) => item.mentor);

    res.json(topMentors);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
