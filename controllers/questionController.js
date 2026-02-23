// import fs from "fs";
// import { createRequire } from "module";
// import { parseQuestionsFromText } from "../utils/questionParser.js";

// const require = createRequire(import.meta.url);
// const pdfParse = require("pdf-parse"); // ✅ works in 1.1.1

// export const extractQuestionsFromPDF = async (req, res) => {
//   try {
//     console.log("FILE RECEIVED:", req.file);

//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ message: "PDF file not received" });
//     }

//     const buffer = fs.readFileSync(req.file.path);
//     const data = await pdfParse(buffer);

//     const text = data.text || "";
//     const questions = parseQuestionsFromText(text);

//     fs.unlinkSync(req.file.path);
//     console.log("PDF TEXT SAMPLE:", text.slice(0, 1000));

//     return res.status(200).json({
//       total: questions.length,
//       questions,
//     });
//   } catch (error) {
//     console.error("PDF EXTRACT ERROR:", error);
//     return res.status(500).json({
//       message: "PDF extraction failed",
//       error: error.message,
//     });
//   }
// };
// export const saveQuestionsBulk = async (req, res) => {
//   const { questions } = req.body;

//   if (!Array.isArray(questions) || questions.length === 0) {
//     return res.status(400).json({ message: "No questions to save" });
//   }

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     for (const q of questions) {
//       const {
//         question,
//         optionA,
//         optionB,
//         optionC,
//         optionD,
//         correctOption,
//         marks,
//       } = q;

//       if (!question || !correctOption) {
//         throw new Error("Invalid question data");
//       }

//       await client.query(
//         `
//         INSERT INTO questions
//         (question, option_a, option_b, option_c, option_d, correct_option, marks)
//         VALUES ($1,$2,$3,$4,$5,$6,$7)
//         `,
//         [
//           question,
//           optionA,
//           optionB,
//           optionC,
//           optionD,
//           correctOption,
//           marks || 1,
//         ]
//       );
//     }

//     await client.query("COMMIT");

//     return res.status(201).json({
//       message: "Questions saved successfully",
//       count: questions.length,
//     });

//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("BULK SAVE ERROR:", error);

//     return res.status(500).json({
//       message: "Failed to save questions",
//       error: error.message,
//     });

//   } finally {
//     client.release();
//   }
// };
import fs from "fs";
import { createRequire } from "module";
import { parseQuestionsFromText } from "../utils/questionParser.js";
import { parseAnswerKey } from "../utils/answerKeyParser.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const addSingleQuestion = async (req, res) => {
  try {
    const facultyId = req.facultyId;

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
      !["A", "B", "C", "D"].includes(correctOption)
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO questions
      (question, option_a, option_b, option_c, option_d, correct_option, marks, faculty_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        question.trim(),
        optionA.trim(),
        optionB.trim(),
        optionC.trim(),
        optionD.trim(),
        correctOption,
        Number(marks) || 1,
        facultyId,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const extractQuestionsFromPDF = async (req, res) => {
  try {
    const questionPdfArr = req.files?.questionPdf;
    const answerKeyArr = req.files?.answerKeyPdf;

    if (!questionPdfArr || !questionPdfArr.length) {
      return res.status(400).json({ message: "Question PDF is required" });
    }

    const questionPdf = questionPdfArr[0];
    const answerKeyFile = answerKeyArr?.[0];

    /* ---------- Parse Question PDF (PDF ONLY) ---------- */
    const qBuffer = fs.readFileSync(questionPdf.path);
    const qData = await pdfParse(qBuffer);
    const questions = parseQuestionsFromText(qData.text);

    /* ---------- Parse Answer Key (TXT / CSV) ---------- */
    let answerKeyMap = {};

    if (answerKeyFile) {
      console.log("Answer Key detected:", answerKeyFile.originalname);

      if (answerKeyFile.mimetype === "application/pdf") {
        // ❌ Not recommended, but supported if ever needed
        const aBuffer = fs.readFileSync(answerKeyFile.path);
        const aData = await pdfParse(aBuffer);
        answerKeyMap = parseAnswerKey(aData.text);
      } else {
        // ✅ CORRECT: TXT / CSV
        const text = fs.readFileSync(answerKeyFile.path, "utf-8");
        answerKeyMap = parseAnswerKey(text);
      }
    }
    console.log("PDF TEXT SAMPLE:", qData.text.slice(0, 500));
console.log("PARSED QUESTIONS:", questions.length);
console.log("ANSWER MAP:", answerKeyMap);


    /* ---------- Apply Answer Priority ---------- */
    const finalQuestions = questions.map((q, index) => {
      const qNo = index + 1;

      if (answerKeyMap[qNo]) {
        return {
          ...q,
          correctOption: answerKeyMap[qNo],
        };
      }

      return q;
    });

    /* ---------- Cleanup ---------- */
    fs.unlinkSync(questionPdf.path);
    if (answerKeyFile?.path) fs.unlinkSync(answerKeyFile.path);

    return res.status(200).json({
      total: finalQuestions.length,
      questions: finalQuestions,
    });

  } catch (error) {
    console.error("EXTRACT ERROR:", error);
    return res.status(500).json({
      message: "Failed to extract questions",
      error: error.message,
    });
  }
};




/* ================= BULK SAVE ================= */
// export const saveQuestionsBulk = async (req, res) => {
//   try {
//     const { questions } = req.body;

//     // 🔐 TEMPORARY (replace with auth later)
//     const facultyId = req.user?.id || req.body.facultyId;

//     if (!facultyId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!Array.isArray(questions) || questions.length === 0) {
//       return res.status(400).json({ message: "No questions provided" });
//     }

//     const client = await pool.connect();

//     try {
//       await client.query("BEGIN");

//       for (const q of questions) {
//         const {
//           question,
//           optionA,
//           optionB,
//           optionC,
//           optionD,
//           correctOption,
//           marks,
//         } = q;

//         // Defensive validation
//         if (
//           !question ||
//           !optionA ||
//           !optionB ||
//           !optionC ||
//           !optionD ||
//           !["A", "B", "C", "D"].includes(correctOption)
//         ) {
//           throw new Error("Invalid question payload");
//         }

//         await client.query(
//           `
//           INSERT INTO questions
//           (question, option_a, option_b, option_c, option_d, correct_option, marks, faculty_id)
//           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//           `,
//           [
//             question.trim(),
//             optionA.trim(),
//             optionB.trim(),
//             optionC.trim(),
//             optionD.trim(),
//             correctOption,
//             Number(marks) || 1,
//             facultyId,
//           ]
//         );
//       }

//       await client.query("COMMIT");

//       return res.status(201).json({
//         message: "Questions saved successfully",
//         count: questions.length,
//       });

//     } catch (err) {
//       await client.query("ROLLBACK");
//       console.error("BULK INSERT ERROR:", err);

//       return res.status(500).json({
//         message: "Bulk insert failed",
//         error: err.message,
//       });
//     } finally {
//       client.release();
//     }

//   } catch (err) {
//     console.error("SERVER ERROR:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

export const saveQuestionsBulk = async (req, res) => {
  try {
    const { questions } = req.body;
    const facultyId = req.facultyId; // ✅ ONLY SOURCE

    if (!facultyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "No questions provided" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const q of questions) {
        const {
          question,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
          marks,
        } = q;

        if (
          !question ||
          !optionA ||
          !optionB ||
          !optionC ||
          !optionD ||
          !["A", "B", "C", "D"].includes(correctOption)
        ) {
          throw new Error("Invalid question payload");
        }

        await client.query(
          `
          INSERT INTO questions
          (question, option_a, option_b, option_c, option_d, correct_option, marks, faculty_id)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          `,
          [
            question.trim(),
            optionA.trim(),
            optionB.trim(),
            optionC.trim(),
            optionD.trim(),
            correctOption,
            Number(marks) || 1,
            facultyId,
          ]
        );
      }

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Questions saved successfully",
        count: questions.length,
      });

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("BULK INSERT ERROR:", err);
    return res.status(500).json({ message: "Bulk insert failed" });
  }
};

import pool from "../db.js";

/* ================= GET OWN QUESTIONS ================= */
export const getMyQuestions = async (req, res) => {
  try {
    const facultyId = req.facultyId;

    const { rows } = await pool.query(
      `
      SELECT
        id,
        question,
        option_a AS "optionA",
        option_b AS "optionB",
        option_c AS "optionC",
        option_d AS "optionD",
        correct_option AS "correctOption",
        marks,
        created_at
      FROM questions
      WHERE faculty_id = $1
      ORDER BY created_at DESC
      `,
      [facultyId]
    );

    return res.status(200).json({ questions: rows });
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch questions" });
  }
};


/* ================= DELETE OWN QUESTION ================= */
export const deleteMyQuestion = async (req, res) => {
  try {
    const facultyId = req.facultyId;
    const { id } = req.params;

    const { rowCount } = await pool.query(
      `
      DELETE FROM questions
      WHERE id = $1 AND faculty_id = $2
      `,
      [id, facultyId]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Question not found or not owned by you",
      });
    }

    return res.status(200).json({ message: "Question deleted" });
  } catch (error) {
    console.error("DELETE QUESTION ERROR:", error);
    return res.status(500).json({ message: "Delete failed" });
  }
};
