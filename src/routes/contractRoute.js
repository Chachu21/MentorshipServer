import express from "express";
import {
  createContract,
  getAllContracts,
  getContractById,
  updateContract,
  deleteContract,
  getContractsByField,
} from "../controllers/contractController.js";
import { verifyToken } from "../middlewares/jwtMiddleware.js";

const contractRoute = express.Router();

contractRoute.post("/contracts", verifyToken, createContract);
contractRoute.get("/contracts", getAllContracts);
contractRoute.get("/contracts/:id", getContractById);
contractRoute.get("/contracts/search", verifyToken, getContractsByField);
contractRoute.put("/contracts/:id", updateContract);
contractRoute.delete("/contracts/:id", verifyToken, deleteContract);

export default contractRoute;
