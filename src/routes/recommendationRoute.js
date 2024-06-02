import express from "express";
import { getRecommendation } from "../controllers/recommendationController.js";
const recommendationRouter = express.Router();

recommendationRouter.get("/:menteeId", getRecommendation);

 export default recommendationRouter;