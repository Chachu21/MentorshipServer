import Availability from "../models/Availablity.js";

export const createAvailability = async (req, res) => {
  const { mentorId } = req.params; // Extract mentorId from request parameters
  const {  date, startTime, endTime } = req.body;

  try {
    const newAvailability = new Availability({
      mentorId,
      date,
      startTime,
      endTime,
    });

    await newAvailability.save();
    res.status(201).json({ message: "Availability created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvailabilities = async (req, res) => {
  const { mentorId } = req.params;

  try {
    const availabilities = await Availability.find({ mentorId });
    res.status(200).json(availabilities);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
