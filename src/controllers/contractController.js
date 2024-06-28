import Contract from "../models/contract.js";

// Create a new contract
export const createContract = async (req, res) => {
  try {
    const newContract = new Contract(req.body);
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
      .populate("mentorship_id")
      .populate("mentor_id")
      .populate("mentee_id");
    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single contract by ID
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("mentorship_id")
      .populate("mentor_id")
      .populate("mentee_id");
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a contract by ID
export const updateContract = async (req, res) => {
  try {
    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedContract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(updatedContract);
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
      .populate("mentorship_id")
      .populate("mentor_id")
      .populate("mentee_id");

    if (contracts.length === 0) {
      return res.status(404).json({ message: "No contracts found" });
    }

    res.status(200).json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
