import {
  acceptPayment,
  getAllPayments,
  getAllPaymentsByUserId,
  getAllTransfers,
  getTransferByReference,
  transferPayment,
  verifyPayment,
} from "../controllers/paymentController.js";
// import { verifyToken } from "../midleware/jwtMiddleware.js";

import express from "express";
const paymentRouter = express.Router();

paymentRouter.post("/accept-payment", acceptPayment);
paymentRouter.get("/verify-payment", verifyPayment);
paymentRouter.get("/get", getAllPayments);
paymentRouter.get("/get/:userId", getAllPaymentsByUserId);
paymentRouter.post("/initiate-transfer", transferPayment);
paymentRouter.get("/transfers", getAllTransfers);
paymentRouter.get("/transfers/:reference", getTransferByReference);
export default paymentRouter;
