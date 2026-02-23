// import express from "express";
// import {
//   loginFaculty,
//   changeFacultyPassword,
// } from "../controllers/facultyController.js";

// const router = express.Router();

// // ✅ Login
// router.post("/login", loginFaculty);

// // ✅ Change Password
// router.post("/change-password", changeFacultyPassword);
// // LINK QUESTIONS TO EXAM
// router.post("/exams/:examId/questions", async (req, res) => {
//   const { examId } = req.params;
//   const { questionIds } = req.body;

//   if (!questionIds || questionIds.length === 0) {
//     return res.status(400).json({ error: "No questions selected" });
//   }

//   try {
//     const values = questionIds
//       .map((qid) => `(${examId}, ${qid})`)
//       .join(",");

//     await pool.query(
//       `INSERT INTO exam_questions (exam_id, question_id) VALUES ${values}`
//     );

//     res.status(201).json({ message: "Questions linked successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to attach questions" });
//   }
// });



// export default router;
import express from "express";
import pool from "../db.js"; // ✅ REQUIRED
import {
  loginFaculty,
  changeFacultyPassword,
} from "../controllers/facultyController.js";

const router = express.Router();

// Login
router.post("/login", loginFaculty);


// Change password
router.post("/change-password", changeFacultyPassword);

// ✅ LINK QUESTIONS TO EXAM (FIXED ROUTE)
router.post("/exams/:examId/questions", async (req, res) => {
  const { examId } = req.params;
  const { questionIds } = req.body;

  if (!questionIds || questionIds.length === 0) {
    return res.status(400).json({ error: "No questions selected" });
  }

  try {
    const values = questionIds
      .map((qid) => `(${examId}, ${qid})`)
      .join(",");

    await pool.query(
      `INSERT INTO exam_questions (exam_id, question_id) VALUES ${values}`
    );

    res.status(201).json({ message: "Questions linked to exam successfully" });
  } catch (err) {
    console.error("LINK QUESTIONS ERROR:", err);
    res.status(500).json({ error: "Failed to attach questions to exam" });
  }
});

export default router;
