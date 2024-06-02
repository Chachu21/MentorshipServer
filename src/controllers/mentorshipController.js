import Mentorship from "../models/mentorship.js";
import User from "../models/users.js";
// Create a new mentorship
export const createMentorship = async (req, res) => {
  try {
    const { skill, description, goal, benefit, service, amount, duration } =
      req.body;
    const createdBy = req.user;

    const mentorship = new Mentorship({
      skill,
      description,
      goal,
      benefit,
      service,
      amount,
      duration,
      createdBy,
    });

    const savedMentorship = await mentorship.save();
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

// Other controller methods remain the same...
