import express from "express";
import {
  createMentorship,
  getAllMentorships,
  getMentorshipById,
  updateMentorship,
  deleteMentorship,
  getMentorshipByMentorId,
  searchMentorshipsBySkillsAndRoles,
  getBestMatchingMentorships,
  getRecentlyPostedMentorships,
  // applyToMentorship,
  // createAgreement,
  // deleteAgreement,
  // getUserContracts,
} from "../controllers/mentorshipController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";

const mentorshipRoute = express.Router();

// CRUD operations
mentorshipRoute.post("/create", verifyToken, createMentorship);
// mentorshipRoute.post("/agreement/create/:id", verifyToken, createAgreement);
// mentorshipRoute.post("/apply/:id", verifyToken, applyToMentorship);
mentorshipRoute.get("/", getAllMentorships);
mentorshipRoute.get("/get/:id", getMentorshipById);
mentorshipRoute.get("/getbymentor/:id", getMentorshipByMentorId);
mentorshipRoute.get("/search", searchMentorshipsBySkillsAndRoles);
mentorshipRoute.get("/best/match/:id", getBestMatchingMentorships);
mentorshipRoute.get("/most/recently/:id", getRecentlyPostedMentorships);
// mentorshipRoute.get("/contracts", verifyToken, getUserContracts);
mentorshipRoute.put("/update/:id", updateMentorship);
mentorshipRoute.delete("/delete/:id", verifyToken, deleteMentorship);
// mentorshipRoute.delete("/agreement/delete/:id", verifyToken, deleteAgreement);

export default mentorshipRoute;
