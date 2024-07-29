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
      YourPayment,
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
      YourPayment,
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
    const mentorships = await Mentorship.find().sort({ createdAt: -1 });
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
    // console.log(error);
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

    // Convert the query to a number if it is a valid number, otherwise use it as a string
    const queryNumber = isNaN(query) ? null : Number(query);

    // Constructing the query object based on provided search query
    const searchCriteria = {
      $or: [
        { service: { $regex: new RegExp(query, "i") } }, // Search by service
        { skills: { $in: [new RegExp(query, "i")] } }, // Search by skills using $in operator
        { title: { $in: [new RegExp(query, "i")] } }, // Search by title
        ...(queryNumber !== null ? [{ amount: queryNumber }] : []), // Search by amount if query is a number
        ...(queryNumber !== null ? [{ duration: queryNumber }] : []), // Search by duration if query is a number
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
    // Check if the user already exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log(user);
    const { professionalRole, skills } = user;

    // Ensure skills is an array
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    // console.log(skillsArray);
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

    // Destructure user object to get professionalRole
    const { professionalRole } = user;

    // Create a case-insensitive regular expression for professionalRole
    const professionalRoleRegex = new RegExp(
      professionalRole.split(" ").join("|"),
      "i"
    );

    // Constructing the query object based on professional role
    const query = {
      professionalRole: professionalRoleRegex, // Case-insensitive match for professional role using regex
    };

    // Executing the query and sorting by creation date
    const mentorships = await Mentorship.find(query).sort({ createdAt: -1 });

    res.status(200).json(mentorships);
  } catch (error) {
    console.error("Error getting recently posted mentorships:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// // Apply to a mentorship
// export const applyToMentorship = async (req, res) => {
//   try {
//     const menteeId = req.user;
//     const mentorshipId = req.params.id;
//     const mentorship = await Mentorship.findById(mentorshipId);
//     if (!mentorship) {
//       return res.status(404).json({ error: "Mentorship not found" });
//     }

//     // Check if the mentee has already applied
//     if (mentorship.mentees.includes(menteeId)) {
//       return res
//         .status(400)
//         .json({ error: "You have already applied to this mentorship" });
//     }

//     // Add the mentee to the mentees array
//     mentorship.mentees.push(menteeId);
//     await mentorship.save();

//     res.status(200).json({ message: "you successfully applied", mentorship });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Controller function to create an agreement
// export const createAgreement = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const mentor = req.user;
//     const { mentee, termsAccepted } = req.body;

//     // Check if the mentorship exists
//     const mentorship = await Mentorship.findById(id);
//     if (!mentorship) {
//       return res.status(404).json({ error: "Mentorship not found" });
//     }

//     // Check if the agreement already exists
//     const existingAgreement = mentorship.contracts.some(
//       (contract) =>
//         contract.mentor.toString() === mentor.toString() &&
//         contract.mentee.toString() === mentee.toString() &&
//         contract.termsAccepted === termsAccepted
//     );

//     if (existingAgreement) {
//       return res.status(400).json({ error: "Agreement already exists" });
//     }

//     // Create new agreement
//     mentorship.contracts.push({
//       mentor,
//       mentee,
//       termsAccepted,
//     });

//     // Save mentorship with new agreement
//     await mentorship.save();

//     res
//       .status(201)
//       .json({ message: "Agreement created successfully", mentorship });
//   } catch (error) {
//     console.error("Error creating agreement:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Controller function to delete an agreement (contract)
// export const deleteAgreement = async (req, res) => {
//   try {
//     const userId = req.user;
//     const { id } = req.params;
//     console.log(userId, "user id", id, "contract id");
//     // Find mentorship by user ID and contract ID
//     const mentorship = await Mentorship.findOne({
//       createdBy: userId,
//       "contracts._id": id,
//     });

//     if (!mentorship) {
//       return res
//         .status(404)
//         .json({ error: "Mentorship or contract not found" });
//     }

//     // Filter out the agreement/contract to be deleted
//     mentorship.contracts = mentorship.contracts.filter(
//       (contract) => contract._id.toString() !== id
//     );

//     // Save mentorship with updated contracts array
//     await mentorship.save();

//     res
//       .status(200)
//       .json({ message: "Contract deleted successfully", mentorship });
//   } catch (error) {
//     console.error("Error deleting contract:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Get contracts for the logged-in mentor or mentee
// export const getUserContracts = async (req, res) => {
//   try {
//     const userId = req.user;

//     // Find contracts where the user is either the mentor or the mentee
//     const mentorships = await Mentorship.find({
//       $or: [{ "contracts.mentor": userId }, { "contracts.mentee": userId }],
//     }).populate({
//       path: "contracts.mentee",
//       select: "fullname", // Populate with necessary fields, you can adjust as needed
//     });

//     const userContracts = mentorships.reduce((contracts, mentorship) => {
//       return contracts.concat(
//         mentorship.contracts.filter(
//           (contract) =>
//             contract.mentor.toString() === userId.toString() ||
//             contract.mentee.toString() === userId.toString()
//         )
//       );
//     }, []);

//     res.status(200).json(userContracts);
//   } catch (error) {
//     console.error("Error getting user contracts:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };
