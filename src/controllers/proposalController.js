import Proposal from "../models/proposal.js"; // Adjust the path as needed
import User from "../models/users.js";
import Mentorship from "../models/mentorship.js";
// Create a new proposal
export const createProposal = async (req, res) => {
  try {
    const user_id = req.user;
    const { title, description, mentorship_id, mentor_id } = req.body;

    // Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the mentorship exists
    const mentorship = await Mentorship.findById(mentorship_id);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    // Check if the user already has a proposal for this mentorship
    const existingProposal = await Proposal.findOne({
      author: user_id,
      mentorship_id,
    });
    if (existingProposal) {
      return res
        .status(400)
        .json({ message: "You already have a proposal for this mentorship" });
    }

    // Create a new proposal
    const newProposal = new Proposal({
      title,
      description,
      author: user_id,
      mentorship_id,
      mentor: mentor_id,
    });

    const savedProposal = await newProposal.save();

    res.status(201).json(savedProposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Update the status of a proposal
export const updateProposalStatus = async (req, res) => {
  const proposal_id = req.params.id;
  try {
    const user_id = req.user;
    const { status } = req.body;
    // console.log(req.body);
    // Validate the status
    const validStatuses = ["accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the proposal exists
    const proposal = await Proposal.findById(proposal_id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Allow mentors to update the status from 'pending' to 'accepted' or 'rejected'
    if (user.role === "mentor") {
      if (proposal.status === "pending") {
        proposal.status = status;
      } else if (proposal.status === "rejected" && status === "accepted") {
        // Allow mentors to change status from 'rejected' to 'accepted'
        proposal.status = "accepted";
      } else {
        return res
          .status(400)
          .json({ message: "Cannot update status from current state" });
      }
    } else {
      return res
        .status(403)
        .json({ message: "Only mentors can change the status" });
    }

    const updatedProposal = await proposal.save();

    res.status(200).json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find();
    res.status(200).json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getProposalsByMentorId = async (req, res) => {
  const mentor_id = req.user;

  try {
    const proposals = await Proposal.find({ mentor: mentor_id });
    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ message: "Proposals not found" });
    }
    res.status(200).json(proposals);
  } catch (error) {
    console.error("Error fetching proposals by mentor ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProposalsByMenteeId = async (req, res) => {
  const mentor_id = req.user;
  try {
    const proposals = await Proposal.find({ author: mentor_id });
    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ message: "Proposals not found" });
    }
    res.status(200).json(proposals);
  } catch (error) {
    console.error("Error fetching proposals by mentor ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
