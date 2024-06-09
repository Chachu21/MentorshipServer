import Mentorship from "../models/mentorship.js";
import User from "../models/users.js";
// Create a new mentorship
export const createMentorship = async (req, res) => {
  try {
    const {
      title,
      skills,
      description,
      goal,
      benefit,
      service,
      amount,
      duration,
    } = req.body;
    const createdBy = req.user;
    const mentorship = new Mentorship({
      title,
      skills,
      description,
      goal,
      benefit,
      service,
      amount,
      duration,
      createdBy,
    });

    const savedMentorship = await mentorship.save();
    await User.findByIdAndUpdate(
      createdBy,
      { $push: { mentorships: savedMentorship._id } },
      { new: true }
    );
    res.status(201).json(savedMentorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Get all mentorships
export const getAllMentorships = async (req, res) => {
  try {
    const mentorships = await Mentorship.find();
    res.status(200).json(mentorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single mentorship by ID
export const getMentorshipById = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    res.status(200).json(mentorship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Get all mentorships by mentor id
export const getMentorshipByMentorId = async (req, res) => {
  try {
    const user_id = req.params.id;
    //check weather the user is already exist or not
    const mentor = await User.findById(user_id);
    if (!mentor) {
      res.status(404).json({ message: "User not found" });
    }
    const mentorship = await Mentorship.find({ createdBy: user_id }).sort({
      createdAt: -1,
    });
    res.status(200).json(mentorship);
  } catch (error) {
    console.log(error);
  }
};

// Update a mentorship by ID
export const updateMentorship = async (req, res) => {
  try {
    const updatedMentorship = await Mentorship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    res.status(200).json(updatedMentorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a mentorship by ID
export const deleteMentorship = async (req, res) => {
  try {
    const user_id = req.user;
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const deletedMentorship = await Mentorship.findByIdAndDelete(req.params.id);
    if (!deletedMentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }
    res.status(200).json({ message: "Mentorship deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search mentorships by mentee skills and professional roles
export const searchMentorshipsBySkillsAndRoles = async (req, res) => {
  try {
    const { query } = req.query;

    // Constructing the query object based on provided search query
    const searchCriteria = {
      $or: [
        { service: { $regex: new RegExp(query, "i") } }, // Search by name
        { skills: { $in: [new RegExp(query, "i")] } }, // Search by skills using $in operator
      ],
    };

    // Executing the search query
    const mentorships = await Mentorship.find(searchCriteria);

    res.status(200).json(mentorships);
  } catch (error) {
    console.error("Error searching mentorships by skills and service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get best matching mentorships based on mentee skills and professional roles
export const getBestMatchingMentorships = async (req, res) => {
  try {
    const user_id = req.params.id;
    console.log("from mentorship matching", user_id);
    // Check if the user already exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { professionalRole, skills } = user;
    console.log("skills", skills);

    // Ensure skills is an array
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    // Create a case-insensitive regular expression for professionalRole
    const professionalRoleRegex = new RegExp(
      professionalRole.split(" ").join("|"),
      "i"
    );
    // const goalregex = new RegExp(goal.split(" ").join("|"));
    // Constructing the query object based on provided skills and professional roles
    const query = {
      $or: [
        { professionalRole: professionalRoleRegex }, // Case-insensitive match for professional role using regex
        { skills: { $in: skillsArray } }, // Match any of the provided skills
        // { goal: { $in: goalregex } },
      ],
    };
    console.log(query);
    // Executing the search query and sorting by relevance or any other criteria
    const mentorships = await Mentorship.find(query).populate("createdBy");
    res.status(200).json(mentorships);
  } catch (error) {
    console.error("Error getting best matching mentorships:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecentlyPostedMentorships = async (req, res) => {
  try {
    const user_id = req.params.id;

    // Check if the user already exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { professionalRole, goal } = user;
    // Create a case-insensitive regular expression for professionalRole
    const professionalRoleRegex = new RegExp(
      professionalRole.split(" ").join("|"),
      "i"
    );
    const goalregex = new RegExp(goal.split(" ").join("|"));
    // Constructing the query object based on provided skills and professional roles
    const query = {
      $or: [
        { professionalRole: professionalRoleRegex }, // Case-insensitive match for professional role using regex
        { goal: { $in: goalregex } },
      ],
    };
    // Executing the query and sorting by creation date
    const mentorships = await Mentorship.find(query).sort({ createdAt: -1 });

    res.status(200).json(mentorships);
  } catch (error) {
    console.error("Error getting recently posted mentorships:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
