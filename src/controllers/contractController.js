import Contract from "../models/contract.js";
import User from "../models/users.js";
import Mentorship from "../models/mentorship.js"; // Assuming you have a mentorship model

// Create a new contract
export const createContract = async (req, res) => {
  const mentor_id = req.user;

  const { mentee_id, isAgree, mentorship_id } = req.body;
  try {
    const user = await User.findById(mentor_id);
    // Check user exists or not
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newContract = new Contract({
      mentor_id,
      mentee_id,
      mentorship_id,
      isAgree,
    });
    const savedContract = await newContract.save();
    res.status(201).json(savedContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all contracts
export const getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate("mentorship_id", "title")
      .populate("mentor_id", "name")
      .populate("mentee_id", "name");
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single contract by ID
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("mentorship_id", "title")
      .populate("mentor_id", "name")
      .populate("mentee_id", "name");
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all contracts by mentor_id
export const getByMentorId = async (req, res) => {
  const mentor_id = req.user;
  try {
    const user = await User.findById(mentor_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const contracts = await Contract.find({ mentor_id })
      .populate("mentorship_id", "title")
      .populate("mentor_id", "fullName")
      .populate("mentee_id", "fullName");
    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ error: "Contracts not found" });
    }
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all contracts by mentee_id
export const getByMenteeId = async (req, res) => {
  const mentee_id = req.user;
  try {
    const user = await User.findById(mentee_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const contracts = await Contract.find({ mentee_id })
      .populate("mentorship_id", "title")
      .populate("mentor_id", "fullName")
      .populate("mentee_id", "fullName");
    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ error: "Contracts not found" });
    }
    // console.log(contracts);
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a contract by ID
export const updateContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const { isApproved, paid } = req.body;
    // Retrieve the contract by ID
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    // Update the contract fields
    if (isApproved !== undefined) {
      contract.isApproved = isApproved;
      if (isApproved) {
        contract.status = "active";
      }
    }

    if (paid !== undefined) {
      contract.paid = paid;
      if (paid === "Yes") {
        contract.status = "completed";

        // Retrieve mentorship value
        const mentorship = await Mentorship.findById(contract.mentorship_id);
        if (!mentorship) {
          return res.status(404).json({ message: "Mentorship not found" });
        }

        // Calculate the amount to update the balance
        const amount = mentorship.YourPayment;
        // Update the mentor's remaining balance
        const mentor = await User.findById(contract.mentor_id);
        if (mentor) {
          mentor.remainingBalance += amount;
          await mentor.save();
        }
      }
    }

    // Save the updated contract
    const updatedContract = await contract.save();
    // Populate fields and return the response
    const populatedContract = await Contract.findById(updatedContract._id)
      .populate("mentorship_id", "title")
      .populate("mentor_id", "name")
      .populate("mentee_id", "name");

    res.status(200).json(populatedContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a contract by ID
export const deleteContract = async (req, res) => {
  try {
    const deletedContract = await Contract.findByIdAndDelete(req.params.id);
    if (!deletedContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json({ message: "Contract deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get contracts by mentor_id, mentee_id, or mentorship_id
export const getContractsByField = async (req, res) => {
  try {
    const { mentor_id, mentee_id, mentorship_id } = req.query;

    const query = {};
    if (mentor_id) query.mentor_id = mentor_id;
    if (mentee_id) query.mentee_id = mentee_id;
    if (mentorship_id) query.mentorship_id = mentorship_id;

    const contracts = await Contract.find(query)
      .populate("mentorship_id", "title")
      .populate("mentor_id", "name")
      .populate("mentee_id", "name");

    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ message: "No contracts found" });
    }

    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
