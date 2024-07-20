import express from "express";
import { verifyToken } from "../middlewares/jwtMiddleware.js";
import {
  createProposal,
  getAllProposals,
  getProposalsByMentorId,
  updateProposalStatus,
  getAllProposalsByMenteeId,
} from "../controllers/proposalController.js";
const proposalRouter = express.Router();

proposalRouter.post("/create", verifyToken, createProposal);
proposalRouter.get("/", getAllProposals);
proposalRouter.get("/mentor", verifyToken, getProposalsByMentorId);
proposalRouter.get("/mentee", verifyToken, getAllProposalsByMenteeId);
proposalRouter.put("/update", verifyToken, updateProposalStatus);
export default proposalRouter;
