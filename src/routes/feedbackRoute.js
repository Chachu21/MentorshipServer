import express from "express";
import {
  createFeedBack,
  deleteFeedBack,
  getFeedBack,
  getFeedBackById,
} from "../controllers/feedbackController.js";
const feedbackRouter = express.Router();

//Create a comment
feedbackRouter.post("/create", createFeedBack);

//Get all comments
feedbackRouter.get("/get", getFeedBack);

//Get single comment by ID
feedbackRouter.get("/get/:id", getFeedBackById);

//Delete comments
feedbackRouter.delete("/delete/:id", deleteFeedBack);

export default feedbackRouter;
