import express from "express";
import {
  loginStudent,
  changeStudentPassword
} from "../controllers/studentController.js";
import { studentAuth } from "../middlewares/studentAuth.js";
import { getStudentExams } from "../controllers/studentExamsController.js";

const router = express.Router();

// ✅ Student Login
router.post("/login", loginStudent);

// ✅ Student Change Password
router.post("/change-password", changeStudentPassword);

router.get("/exams", studentAuth, getStudentExams);

export default router;
