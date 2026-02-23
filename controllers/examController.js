// // // import db from "../db.js";

// // // export const createExam = async (req, res) => {
// // //   try {
// // //     const { title, description, date, duration, total_marks, faculty_id } = req.body;

// // //     // Validation
// // //     if (!title || !description || !date || !duration || !total_marks || !faculty_id) {
// // //       return res.status(400).json({ message: "All fields are required." });
// // //     }

// // //     const query = `
// // //       INSERT INTO exams (title, description, date, duration, total_marks, faculty_id)
// // //       VALUES ($1, $2, $3, $4, $5, $6)
// // //       RETURNING *;
// // //     `;

// // //     const values = [title, description, date, duration, total_marks, faculty_id];
// // //     const result = await db.query(query, values);

// // //     return res.status(201).json({
// // //       message: "Exam created successfully",
// // //       exam: result.rows[0],
// // //     });

// // //   } catch (error) {
// // //     console.error("Create exam error:", error);
// // //     res.status(500).json({ message: "Server Error: Unable to create exam" });
// // //   }
// // // };
// // import db from "../db.js";

// // export const createExam = async (req, res) => {
// //   try {
// //     const { title, description, date, duration, total_marks, faculty_id } = req.body;

// //     // Validation
// //     if (!title || !description || !date || !duration || !total_marks || !faculty_id) {
// //       return res.status(400).json({ message: "All fields are required." });
// //     }

// //     const query = `
// //       INSERT INTO exams (title, description, date, duration, total_marks, faculty_id)
// //       VALUES ($1, $2, $3, $4, $5, $6)
// //       RETURNING *;
// //     `;

// //     const values = [title, description, date, duration, total_marks, faculty_id];
// //     const result = await db.query(query, values);

// //     return res.status(201).json({
// //       message: "Exam created successfully",
// //       exam: result.rows[0],
// //     });

// //   } catch (error) {
// //     console.error("Create exam error:", error);
// //     res.status(500).json({ message: "Server Error: Unable to create exam" });
// //   }
// // };
// import db from "../db.js";

// export const createExam = async (req, res) => {
//   const {
//     title,
//     description,
//     date,
//     duration,
//     total_marks,
//     faculty_id,
//     question_ids = []   // 👈 optional
//   } = req.body;

//   // 🔒 Validation
//   if (!title || !description || !date || !duration || !total_marks || !faculty_id) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   const client = await db.connect();

//   try {
//     await client.query("BEGIN");

//     // 1️⃣ Insert exam
//     const examResult = await client.query(
//       `
//       INSERT INTO exams 
//         (title, description, date, duration, total_marks, faculty_id)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING id;
//       `,
//       [title, description, date, duration, total_marks, faculty_id]
//     );

//     const examId = examResult.rows[0].id;

//     // 2️⃣ Attach questions (ONLY if provided)
//     if (question_ids.length > 0) {
//       for (const qid of question_ids) {
//         await client.query(
//           `
//           INSERT INTO exam_questions (exam_id, question_id)
//           VALUES ($1, $2);
//           `,
//           [examId, qid]
//         );
//       }
//     }

//     await client.query("COMMIT");

//     return res.status(201).json({
//       message: "Exam created successfully",
//       exam_id: examId,
//     });

//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("Create exam error:", error);

//     res.status(500).json({
//       message: "Server Error: Unable to create exam",
//     });
//   } finally {
//     client.release();
//   }
// };


// export const deleteExam = async (req, res) => {
//   const { examId } = req.params;
//   const facultyId = req.headers["x-faculty-id"];

//   if (!facultyId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const result = await db.query(
//       `DELETE FROM exams
//        WHERE id = $1 AND faculty_id = $2`,
//       [examId, facultyId]
//     );

//     if (result.rowCount === 0) {
//       return res.status(403).json({
//         message: "Not allowed to delete this exam",
//       });
//     }

//     res.status(200).json({
//       message: "Exam deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete exam error:", error);
//     res.status(500).json({ message: "Failed to delete exam" });
//   }
// };



// export const getFacultyExams = async (req, res) => {
//   const { facultyId } = req.params;

//   try {
//     const result = await db.query(
//       `SELECT 
//          id,
//          title,
//          description,
//          date,
//          duration,
//          total_marks,
//          faculty_id,
//          created_at
//        FROM exams
//        WHERE faculty_id = $1
//        ORDER BY created_at DESC`,
//       [facultyId]
//     );

//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("Get faculty exams error:", error);
//     res.status(500).json({ message: "Failed to fetch exams" });
//   }
// };
// export const toggleExamStatus = async (req, res) => {
//   const { examId } = req.params;

//   try {
//     const result = await db.query(
//       `
//       UPDATE exams
//       SET is_active = NOT is_active
//       WHERE id = $1
//       RETURNING id, is_active
//       `,
//       [examId]
//     );

//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error("Toggle error:", err);
//     res.status(500).json({ message: "Failed to toggle exam status" });
//   }
// };

// export const getExamById = async (req, res) => {
//   const { examId } = req.params;
//   try {
//     const result = await db.query(
//       `SELECT
//           id,
//           title,
//           description,
//           date,
//           duration,
//           total_marks,
//           faculty_id,
//           created_at,
//           is_active
//        FROM exams
//        WHERE id = $1`,
//       [examId]
//     );
//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "Exam not found" });
//     }
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error("Get exam by ID error:", err);
//     res.status(500).json({ message: "Failed to fetch exam details" });
//   }
// };

// export const getExamQuestions = async (req, res) => {
//   const { examId } = req.params;

//   try {
//     const result = await db.query(
//       `
//       SELECT 
//         q.id,
//         q.question,
//         q.option_a,
//         q.option_b,
//         q.option_c,
//         q.option_d,
//         q.correct_option,
//         q.marks
//       FROM questions q
//       INNER JOIN exam_questions eq 
//         ON q.id = eq.question_id
//       WHERE eq.exam_id = $1
//       ORDER BY q.id ASC
//       `,
//       [examId]
//     );

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error("Get exam questions error:", err);
//     res.status(500).json({
//       message: "Failed to fetch exam questions"
//     });
//   }
// };

import db from "../db.js";

/* =====================================================
   CREATE EXAM
===================================================== */
export const createExam = async (req, res) => {
  const facultyId = req.headers["x-faculty-id"]; // 🔒 source of truth
  const {
    title,
    description,
    date,
    duration,
    total_marks,
  } = req.body;

  if (!facultyId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!title || !description || !date || !duration || !total_marks) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const examResult = await client.query(
      `
      INSERT INTO exams
        (title, description, date, duration, total_marks, faculty_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [title, description, date, duration, total_marks, facultyId]
    );

    await client.query("COMMIT");

    // 🔑 RETURN FULL EXAM OBJECT
    return res.status(201).json(examResult.rows[0]);

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create exam error:", error);

    res.status(500).json({
      message: "Server Error: Unable to create exam",
    });
  } finally {
    client.release();
  }
};

/* =====================================================
   DELETE EXAM (FACULTY SAFE)
===================================================== */
export const deleteExam = async (req, res) => {
  const { examId } = req.params;
  const facultyId = req.headers["x-faculty-id"];

  if (!facultyId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await db.query(
      `
      DELETE FROM exams
      WHERE id = $1 AND faculty_id = $2
      `,
      [examId, facultyId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "Not allowed to delete this exam",
      });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Delete exam error:", error);
    res.status(500).json({ message: "Failed to delete exam" });
  }
};

/* =====================================================
   GET FACULTY EXAMS
===================================================== */
export const getFacultyExams = async (req, res) => {
  const { facultyId } = req.params;

  try {
    const result = await db.query(
      `
      SELECT *
      FROM exams
      WHERE faculty_id = $1
      ORDER BY created_at DESC
      `,
      [facultyId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get faculty exams error:", error);
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};

/* =====================================================
   TOGGLE EXAM STATUS (FACULTY SAFE)
===================================================== */
export const toggleExamStatus = async (req, res) => {
  const { examId } = req.params;
  const facultyId = req.headers["x-faculty-id"];

  if (!facultyId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await db.query(
      `
      UPDATE exams
      SET is_active = NOT is_active
      WHERE id = $1 AND faculty_id = $2
      RETURNING id, is_active
      `,
      [examId, facultyId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Toggle error:", err);
    res.status(500).json({ message: "Failed to toggle exam status" });
  }
};

/* =====================================================
   GET EXAM BY ID (FACULTY SAFE)
===================================================== */
export const getExamById = async (req, res) => {
  const { examId } = req.params;
  const facultyId = req.headers["x-faculty-id"];

  try {
    const result = await db.query(
      `
      SELECT *
      FROM exams
      WHERE id = $1 AND faculty_id = $2
      `,
      [examId, facultyId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Get exam by ID error:", err);
    res.status(500).json({ message: "Failed to fetch exam details" });
  }
};

/* =====================================================
   GET EXAM QUESTIONS (FACULTY SAFE)
===================================================== */
export const getExamQuestions = async (req, res) => {
  const { examId } = req.params;
  const facultyId = req.headers["x-faculty-id"];

  if (!facultyId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await db.query(
      `
      SELECT 
        q.id,
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_option,
        q.marks
      FROM exam_questions eq
      JOIN exams e ON e.id = eq.exam_id
      JOIN questions q ON q.id = eq.question_id
      WHERE eq.exam_id = $1
        AND e.faculty_id = $2
      ORDER BY q.id ASC
      `,
      [examId, facultyId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exam questions" });
  }
};
