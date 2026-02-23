import express from "express";
import { getFacultyOverview, toggleFacultyStatus, getFacultyQuestions } from "../controllers/adminFacultyController.js";
import adminAuth from "../middlewares/adminAuth.js";

const router = express.Router();

router.get(
  "/faculty/:facultyId/overview",
  adminAuth,
  getFacultyOverview
);


router.patch(
  "/faculty/:id/status",
  adminAuth,
  toggleFacultyStatus
);

router.get(
  "/faculty/:facultyId/questions",
  adminAuth,
  getFacultyQuestions
);


export default router;
