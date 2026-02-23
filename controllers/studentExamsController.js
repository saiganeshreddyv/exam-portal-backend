// import db from "../db.js";

// /**
//  * GET EXAMS FOR LOGGED-IN STUDENT
//  */
// export const getStudentExams = async (req, res) => {
//   try {
//     const studentId = req.studentId;

//     /* 1️⃣ Get student's section_code */
//     const studentResult = await db.query(
//       `SELECT section_code FROM students WHERE id = $1`,
//       [studentId]
//     );

//     if (studentResult.rowCount === 0) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     const { section_code } = studentResult.rows[0];

//     /* 2️⃣ Get faculty_id from section */
//     const sectionResult = await db.query(
//       `SELECT faculty_id FROM sections WHERE section_code = $1`,
//       [section_code]
//     );

//     if (
//       sectionResult.rowCount === 0 ||
//       !sectionResult.rows[0].faculty_id
//     ) {
//       return res.json([]); // No faculty assigned yet
//     }

//     const { faculty_id } = sectionResult.rows[0];

//     /* 3️⃣ Get exams created by that faculty */
//     const examsResult = await db.query(
//       `
//       SELECT
//         id,
//         title,
//         description,
//         date,
//         duration,
//         total_marks,
//         is_active,
//         created_at
//       FROM exams
//       WHERE faculty_id = $1
//       ORDER BY date ASC
//       `,
//       [faculty_id]
//     );

//     res.json(examsResult.rows);
//   } catch (err) {
//     console.error("Student exams error:", err);
//     res.status(500).json({ message: "Failed to load exams" });
//   }
// };
import db from "../db.js";

/**
 * GET EXAMS FOR LOGGED-IN STUDENT (WITH ATTEMPT STATUS)
 */
export const getStudentExams = async (req, res) => {
  try {
    const studentId = req.studentId;

    // 1️⃣ Get student's section_code
    const studentResult = await db.query(
      `SELECT section_code FROM students WHERE id = $1`,
      [studentId]
    );

    if (studentResult.rowCount === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { section_code } = studentResult.rows[0];

    // 2️⃣ Get faculty_id from section
    const sectionResult = await db.query(
      `SELECT faculty_id FROM sections WHERE section_code = $1`,
      [section_code]
    );

    if (!sectionResult.rowCount || !sectionResult.rows[0].faculty_id) {
      return res.json([]);
    }

    const { faculty_id } = sectionResult.rows[0];

    // 3️⃣ Get exams + student attempt status
    const examsResult = await db.query(
      `
      SELECT
        e.id,
        e.title,
        e.description,
        e.date,
        e.duration,
        e.total_marks,
        e.is_active,
        e.created_at,

        ea.id AS attempt_id,
        ea.status AS attempt_status

      FROM exams e
      LEFT JOIN exam_attempts ea
        ON ea.exam_id = e.id
       AND ea.student_id = $2

      WHERE e.faculty_id = $1
      ORDER BY e.date ASC
      `,
      [faculty_id, studentId]
    );

    res.json(examsResult.rows);
  } catch (err) {
    console.error("Student exams error:", err);
    res.status(500).json({ message: "Failed to load exams" });
  }
};
