import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  loginController,
  getResetPassword,
  forgotPassword,
  resetPassword,
  getMentorsByService,
  getAllMentors,
  getAllMentees,
  getMentorById,
  getMenteeById,
  getMentorsWithHighRating,
  verifyEmail,
  resendVerificationCode,
  findUserByEmail,
  updateUser,
  matchMentors,
  searchBasedNameAndRole,
  searchMentors,
  getMentorsByCategory,
  getMentorsBySkill,
} from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.get("resetPassword/:token", getResetPassword);
userRouter.get("/", getUsers);
userRouter.post("/login", loginController);
userRouter.put("/update/:id", updateUser);
userRouter.get("/mentors", getMentorsByService);
userRouter.get("/getallmentors", getAllMentors);
userRouter.get("/getallmentees", getAllMentees);
userRouter.get("/mentor/:id", getMentorById);
userRouter.get("/mentee/:id", getMenteeById);
userRouter.get("/mentors/skill", getMentorsBySkill);
userRouter.get("/mentors/high-rating", getMentorsWithHighRating);
userRouter.get("/search/user", searchBasedNameAndRole);
userRouter.get("/search/mentors", searchMentors);
userRouter.get("/get/bycategory", getMentorsByCategory);
userRouter.get("/get/:id", getUserById);
userRouter.get("/get/:email", findUserByEmail);
userRouter.get("/mentor/match/:id", matchMentors);
userRouter.post("/signUp", createUser);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/resend-verification-code", resendVerificationCode);
userRouter.post("/resetPassword/:token", resetPassword);
userRouter.get("resetPassword/:token", getResetPassword);
userRouter.post("/forgotpassword", forgotPassword);
userRouter.post(
  "/resetPassword/:token",
  resetPassword // Function to send password reset email
);

export default userRouter;
