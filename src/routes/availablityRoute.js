import express from "express";
import { createAvailability, getAvailabilities } from "../controllers/availablityController.js";
const availablityRouter = express.Router();


availablityRouter.post("/:mentorId", createAvailability);
availablityRouter.get("/:mentorId", getAvailabilities);

export default availablityRouter;
