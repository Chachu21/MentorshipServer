import express from "express";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentByMentorId,
  getComments,
} from "../controllers/commentController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";
const commetRouter = express.Router();

//Create a comment
commetRouter.post("/create", verifyToken, createComment);

//Get all comments
commetRouter.get("/gets", getComments);

//Get single comment by ID
commetRouter.get("/get/:id", getCommentById);

//Get all comments by mentor id
commetRouter.get("/get/mentor/:id", getCommentByMentorId);
//Delete comments
commetRouter.delete("/delete/:id", deleteComment);

export default commetRouter;
