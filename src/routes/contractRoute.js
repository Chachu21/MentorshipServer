import express from "express";
import {
  createContract,
  getAllContracts,
  getContractById,
  updateContract,
  deleteContract,
  getContractsByField,
  getByMentorId,
  getByMenteeId,
} from "../controllers/contractController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";

const contractRoute = express.Router();

contractRoute.post("/create", verifyToken, createContract);
contractRoute.get("/", getAllContracts);
contractRoute.get("/get/:id", getContractById);
contractRoute.get("/mentor", verifyToken, getByMentorId);
contractRoute.get("/mentee", verifyToken, getByMenteeId);
contractRoute.get("/search", verifyToken, getContractsByField);
contractRoute.put("/update/:id", updateContract);
contractRoute.delete("/delete/:id", verifyToken, deleteContract);

export default contractRoute;
