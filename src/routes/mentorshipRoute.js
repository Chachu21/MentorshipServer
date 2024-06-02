import express from "express";
import {
  createMentorship,
  getAllMentorships,
  getMentorshipById,
  updateMentorship,
  deleteMentorship,
  getMentorshipByMentorId,
} from "../controllers/mentorshipController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";

const mentorshipRoute = express.Router();

// CRUD operations
mentorshipRoute.post("/create", verifyToken, createMentorship);
mentorshipRoute.get("/", getAllMentorships);
mentorshipRoute.get("/get/:id", getMentorshipById);
mentorshipRoute.get("/getbymentor/:id", getMentorshipByMentorId);
mentorshipRoute.put("/update/:id", updateMentorship);
mentorshipRoute.delete("/delete/:id", verifyToken, deleteMentorship);

export default mentorshipRoute;
