// import express from "express";
// import pool from "../db.js";
// import multer from "multer";
// // import pdfParse from "pdf-parse";
// // import fs from "fs";
// // import upload from "../middlewares/pdfUpload.js";
// import { extractQuestionsFromPDF, saveQuestionsBulk } from "../controllers/questionController.js";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// /* Add Question */
// router.post("/", async (req, res) => {
//   try {
//     const {
//       question,
//       optionA,
//       optionB,
//       optionC,
//       optionD,
//       correctOption,
//       marks,
//     } = req.body;

//     if (
//       !question ||
//       !optionA ||
//       !optionB ||
//       !optionC ||
//       !optionD ||
//       !correctOption ||
//       !marks
//     ) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const result = await pool.query(
//       `INSERT INTO questions 
//       (question, option_a, option_b, option_c, option_d, correct_option, marks)
//       VALUES ($1,$2,$3,$4,$5,$6,$7)
//       RETURNING *`,
//       [
//         question,
//         optionA,
//         optionB,
//         optionC,
//         optionD,
//         correctOption,
//         marks,
//       ]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// // Get all questions
// router.get("/", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT * FROM questions ORDER BY created_at DESC"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// // router.post(
// //   "/extract-pdf",
// //   upload.single("file"),
// //   extractQuestionsFromPDF
// // );

// router.post(
//   "/extract-pdf",
//   upload.fields([
//     { name: "questionPdf", maxCount: 1 },
//     { name: "answerKeyPdf", maxCount: 1 },
//   ]),
//   extractQuestionsFromPDF
// );
// router.post("/bulk", saveQuestionsBulk);


// export default router;
import express from "express";
import pool from "../db.js";
import multer from "multer";
import {
  extractQuestionsFromPDF,
  saveQuestionsBulk,
} from "../controllers/questionController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ================= GET QUESTIONS (FACULTY ONLY) ================= */
router.get("/", async (req, res) => {
  try {
    const facultyId = req.headers["x-faculty-id"];

    if (!facultyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT * FROM questions
       WHERE faculty_id = $1
       ORDER BY created_at DESC`,
      [facultyId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD SINGLE QUESTION ================= */
router.post("/", async (req, res) => {
  try {
    const facultyId = req.headers["x-faculty-id"];
    if (!facultyId) return res.status(401).json({ message: "Unauthorized" });

    const {
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      marks,
    } = req.body;

    if (
      !question ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !correctOption ||
      !marks
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    const result = await pool.query(
      `INSERT INTO questions
       (question, option_a, option_b, option_c, option_d, correct_option, marks, faculty_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        marks,
        facultyId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE QUESTION (OWNERSHIP CHECK) ================= */
router.delete("/:id", async (req, res) => {
  try {
    const facultyId = req.headers["x-faculty-id"];
    const { id } = req.params;

    if (!facultyId) return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(
      `DELETE FROM questions
       WHERE id = $1 AND faculty_id = $2`,
      [id, facultyId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= PDF EXTRACT ================= */
router.post(
  "/extract-pdf",
  upload.fields([
    { name: "questionPdf", maxCount: 1 },
    { name: "answerKeyPdf", maxCount: 1 },
  ]),
  extractQuestionsFromPDF
);

/* ================= BULK SAVE ================= */
router.post("/bulk", saveQuestionsBulk);

export default router;
