// import express from "express";
// import { startExamAttempt, getAttemptQuestions} from "../controllers/examAttempts.js";
// import authMiddleware from "../middlewares/authMiddleware.js";


// const router = express.Router();

// router.post("/start", authMiddleware, startExamAttempt);
// router.get(
//     "/:attemptId/questions",
//   authMiddleware,
//   getAttemptQuestions
// );


// export default router;



// routes/examAttempts.js
import express from "express";
import {
  startExamAttempt,
  getAttemptQuestions,
  submitExamAttempt,
} from "../controllers/examAttempts.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", authMiddleware, startExamAttempt);
router.get("/:attemptId/questions", authMiddleware, getAttemptQuestions);
router.post("/:attemptId/submit", authMiddleware, submitExamAttempt);

export default router;
