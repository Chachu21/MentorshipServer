import express from "express";
import { bookAppointment } from "../controllers/appointmentController.js";
const appointmentRouter = express.Router();

appointmentRouter.post("/", bookAppointment);

export default appointmentRouter;
