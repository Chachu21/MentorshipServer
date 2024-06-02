const experienceLevels = ["beginner", "intermediate", "advanced"];

// export const encodeExperienceLevel = (level) => {
//   return experienceLevels.indexOf(level.toLowerCase());
// };
export const encodeExperienceLevel = (level) => {
  if (typeof level === "string") {
    const experienceLevels = ["beginner", "intermediate", "advanced"];
    return experienceLevels.indexOf(level.toLowerCase());
  } else {
    // Handle the case when level is not a string (e.g., undefined)
    return -1; // or return a default value, depending on your use case
  }
};

// export const encodeLanguage = (language) => {
//   const languages = ["english", "spanish", "french"]; // Extend this list as needed
//   return languages.indexOf(language.toLowerCase());
// };
export const encodeLanguage = (language) => {
  if (typeof language === "string") {
    const languages = ["english", "spanish", "french"]; // Extend this list as needed
    return languages.indexOf(language.toLowerCase());
  } else {
    // Handle the case when language is not a string (e.g., undefined)
    return -1; // or return a default value, depending on your use case
  }
};
