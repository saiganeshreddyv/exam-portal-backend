import express from "express";
import {
  getFacultyExamResults,
  getExamAttemptsByExam,
  publishResults,
} from "../controllers/facultyResultsController.js";
import { facultyAuth } from "../middlewares/facultyAuth.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/results",
  authMiddleware,
  facultyAuth,
  getFacultyExamResults
);
// 📌 GET attempts of a single exam
router.get("/results/:examId", authMiddleware, facultyAuth, getExamAttemptsByExam);

// 📌 Publish results
router.post(
  "/exams/:examId/publish-results",
  authMiddleware,
  facultyAuth,
  publishResults
);

export default router;
