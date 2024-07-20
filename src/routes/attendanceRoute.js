import express from "express";
import {
  createAttendance, getAttendance, getAttendanceByName,
} from "../controllers/attendanceController.js";

const attendanceRoutes = express.Router();

attendanceRoutes.post("/create", createAttendance);
attendanceRoutes.get("/all", getAttendance);
attendanceRoutes.get("/name", getAttendanceByName);


export default attendanceRoutes;
