// // // import express from "express";
// // // import { createExam } from "../controllers/examController.js";

// // // const router = express.Router();

// // // router.post("/exams", createExam);

// // // export default router;
// // import express from "express";
// // import {
// //   createExam,
// //   getFacultyExams,
// //   updateExamStatus,
// //   deleteExam,
// // } from "../controllers/examController.js";

// // const router = express.Router();

// // /* ================= EXAMS ================= */

// // // Create exam
// // router.post("/exams", createExam);

// // // Get all exams for faculty
// // router.get("/exams/faculty/:facultyId", getFacultyExams);

// // // Activate / Deactivate exam
// // router.patch("/exams/:examId/status", updateExamStatus);

// // // Delete exam
// // router.delete("/exams/:examId", deleteExam);

// // export default router;
// import express from "express";
// import {
//   createExam,
//   getFacultyExams,
//   deleteExam,
// } from "../controllers/examController.js";

// const router = express.Router();

// // Create exam
// router.post("/exams", createExam);

// // Get exams by faculty
// router.get("/exams/faculty/:facultyId", getFacultyExams);

// // Delete exam
// router.delete("/exams/:id", deleteExam);


// export default router;
import express from "express";
import {
  createExam,
  toggleExamStatus,
  getFacultyExams,
  deleteExam
  , getExamById, getExamQuestions
} from "../controllers/examController.js";

const router = express.Router();

router.post("/exams", createExam);
router.get("/exams/faculty/:facultyId", getFacultyExams);
router.patch("/exams/:examId/status", toggleExamStatus);
router.delete("/exams/:examId", deleteExam);
router.get("/exams/:examId", getExamById);
router.get("/exams/:examId/questions", getExamQuestions);


export default router;
