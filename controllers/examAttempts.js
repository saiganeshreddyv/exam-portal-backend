// import pool from "../db.js";
// import db from "../db.js";

// export const startExamAttempt = async (req, res) => {
//   try {
//     console.log("REQ.USER:", req.user);
//     console.log("REQ.BODY:", req.body);

//     const studentId = req.user?.id;
//     const { exam_id } = req.body;

//     if (!studentId) {
//       return res.status(401).json({ message: "Student not authenticated" });
//     }

//     if (!exam_id) {
//       return res.status(400).json({ message: "exam_id is required" });
//     }

//     const existing = await pool.query(
//       `SELECT * FROM exam_attempts
//        WHERE exam_id = $1 AND student_id = $2`,
//       [exam_id, studentId]
//     );

//     if (existing.rows.length > 0) {
//       return res.json({
//         attempt_id: existing.rows[0].id,
//         status: existing.rows[0].status,
//       });
//     }

//     const result = await pool.query(
//       `INSERT INTO exam_attempts (exam_id, student_id)
//        VALUES ($1, $2)
//        RETURNING id`,
//       [exam_id, studentId]
//     );

//     res.json({
//       attempt_id: result.rows[0].id,
//       status: "IN_PROGRESS",
//     });
//   } catch (err) {
//     console.error("START EXAM ERROR:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getAttemptQuestions = async (req, res) => {
//   try {
//     const { attemptId } = req.params;
//     const studentId = req.user.id;

//     // 1. Validate attempt + get exam + duration
//     const attemptRes = await pool.query(
//       `
//       SELECT ea.exam_id, e.duration
//       FROM exam_attempts ea
//       JOIN exams e ON e.id = ea.exam_id
//       WHERE ea.id = $1
//         AND ea.student_id = $2
//         AND ea.status = 'IN_PROGRESS'
//       `,
//       [attemptId, studentId]
//     );

//     if (attemptRes.rows.length === 0) {
//       return res.status(403).json({ message: "Invalid attempt" });
//     }

//     const { exam_id, duration } = attemptRes.rows[0];

//     // 2. Fetch questions via exam_questions
//     const questionsRes = await pool.query(
//       `
//       SELECT
//         q.id,
//         q.question,
//         q.option_a,
//         q.option_b,
//         q.option_c,
//         q.option_d
//       FROM exam_questions eq
//       JOIN questions q ON q.id = eq.question_id
//       WHERE eq.exam_id = $1
//       ORDER BY q.id
//       `,
//       [exam_id]
//     );

//     // 3. Format options (VERY IMPORTANT)
//     const questions = questionsRes.rows.map((q) => ({
//       id: q.id,
//       question: q.question,
//       options: [
//         q.option_a,
//         q.option_b,
//         q.option_c,
//         q.option_d,
//       ],
//     }));

//     res.json({
//       duration, // minutes
//       questions,
//     });
//   } catch (err) {
//     console.error("GET QUESTIONS ERROR:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };



// export const submitExamAttempt = async (req, res) => {
//   try {
//     const { attemptId } = req.params;
//     const { answers, malpracticeCount } = req.body;

//     // 1️⃣ Get question IDs
//     const questionIds = Object.keys(answers).map(id => parseInt(id));

//     // 2️⃣ Fetch correct answers
//     const result = await db.query(
//       `
//       SELECT id, correct_option, marks
//       FROM questions
//       WHERE id = ANY($1::int[])
//       `,
//       [questionIds]
//     );

//     let correctCount = 0;
//     let score = 0;

//     for (const row of result.rows) {
//       if (answers[row.id] === row.correct_option) {
//         correctCount++;
//         score += row.marks;
//       }
//     }

//     // 3️⃣ Update exam_attempts
//     await db.query(
//       `
//       UPDATE exam_attempts
//       SET
//         answers = $1,
//         attempted_count = $2,
//         correct_count = $3,
//         score = $4,
//         malpractice_count = $5,
//         status = 'SUBMITTED',
//         end_time = NOW(),
//         duration_taken = EXTRACT(EPOCH FROM (NOW() - start_time))
//       WHERE id = $6
//       `,
//       [
//         answers,
//         questionIds.length,
//         correctCount,
//         score,
//         malpracticeCount || 0,
//         attemptId
//       ]
//     );

//     res.json({ message: "Exam submitted successfully" });

//   } catch (err) {
//     console.error("SUBMIT EXAM ERROR:", err);
//     res.status(500).json({ message: "Failed to submit exam" });
//   }
// };
import pool from "../db.js";

/* ======================================================
   START EXAM ATTEMPT
====================================================== */
export const startExamAttempt = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { exam_id } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: "Student not authenticated" });
    }

    if (!exam_id) {
      return res.status(400).json({ message: "exam_id is required" });
    }

    // Check existing attempt (resume support)
    const existing = await pool.query(
      `
      SELECT id, status
      FROM exam_attempts
      WHERE exam_id = $1 AND student_id = $2
      `,
      [exam_id, studentId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        attempt_id: existing.rows[0].id,
        status: existing.rows[0].status,
      });
    }

    // Create new attempt
    const result = await pool.query(
      `
      INSERT INTO exam_attempts (exam_id, student_id)
      VALUES ($1, $2)
      RETURNING id
      `,
      [exam_id, studentId]
    );

    res.json({
      attempt_id: result.rows[0].id,
      status: "IN_PROGRESS",
    });
  } catch (err) {
    console.error("START EXAM ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   GET QUESTIONS FOR ATTEMPT
====================================================== */
export const getAttemptQuestions = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.id;

    // Validate attempt
    const attemptRes = await pool.query(
      `
      SELECT ea.exam_id, e.duration
      FROM exam_attempts ea
      JOIN exams e ON e.id = ea.exam_id
      WHERE ea.id = $1
        AND ea.student_id = $2
        AND ea.status = 'IN_PROGRESS'
      `,
      [attemptId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      return res.status(403).json({ message: "Invalid or finished attempt" });
    }

    const { exam_id, duration } = attemptRes.rows[0];

    // Fetch questions
    const questionsRes = await pool.query(
      `
      SELECT
        q.id,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d
      FROM exam_questions eq
      JOIN questions q ON q.id = eq.question_id
      WHERE eq.exam_id = $1
      ORDER BY q.id
      `,
      [exam_id]
    );

    const questions = questionsRes.rows.map((q) => ({
      id: q.id, // IMPORTANT: question_id
      question: q.question,
      options: [
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
      ],
    }));

    res.json({
      duration, // minutes
      questions,
    });
  } catch (err) {
    console.error("GET QUESTIONS ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ======================================================
   SUBMIT EXAM ATTEMPT (FINAL & CORRECT)
====================================================== */
export const submitExamAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, malpracticeCount } = req.body;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Invalid answers payload" });
    }

    // Question IDs answered
    const questionIds = Object.keys(answers).map((id) => Number(id));

    if (questionIds.length === 0) {
      return res.status(400).json({ message: "No answers submitted" });
    }

    // Fetch correct answers + marks
    const result = await pool.query(
      `
      SELECT id, correct_option, marks
      FROM questions
      WHERE id = ANY($1::int[])
      `,
      [questionIds]
    );

    let correctCount = 0;
    let score = 0;

    for (const row of result.rows) {
      if (answers[row.id] === row.correct_option) {
        correctCount++;
        score += row.marks;
      }
    }

    // Update attempt
    await pool.query(
      `
      UPDATE exam_attempts
      SET
        answers = $1::jsonb,
        attempted_count = $2,
        correct_count = $3,
        score = $4,
        malpractice_count = $5,
        status = 'SUBMITTED',
        end_time = NOW(),
        duration_taken = FLOOR(EXTRACT(EPOCH FROM (NOW() - start_time)))
      WHERE id = $6
        AND status = 'IN_PROGRESS'
      `,
      [
        JSON.stringify(answers),
        questionIds.length,
        correctCount,
        score,
        malpracticeCount || 0,
        attemptId,
      ]
    );

    res.json({
      message: "Exam submitted successfully",
      correctCount,
      score,
    });
  } catch (err) {
    console.error("SUBMIT EXAM ERROR:", err);
    res.status(500).json({ message: "Failed to submit exam" });
  }
};
