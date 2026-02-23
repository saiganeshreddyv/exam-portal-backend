// controllers/facultyResultsController.js
import pool from "../db.js";

export const getFacultyExamResults = async (req, res) => {
  try {
    const facultyId = req.facultyId;

    const result = await pool.query(
      `
      SELECT
        e.id AS exam_id,
        e.title,
        COUNT(ea.id) AS total_attempts,
        COUNT(ea.id) FILTER (WHERE ea.status = 'SUBMITTED') AS submitted_attempts,
        COALESCE(AVG(ea.score) FILTER (WHERE ea.status = 'SUBMITTED'), 0) AS avg_score,
        BOOL_OR(ea.results_published) AS results_published
      FROM exams e
      LEFT JOIN exam_attempts ea ON ea.exam_id = e.id
      WHERE e.faculty_id = $1
      GROUP BY e.id
      ORDER BY e.created_at DESC
      `,
      [facultyId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("FACULTY RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to load exam results" });
  }
};



export const getExamAttemptsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const facultyId = req.facultyId;

    // 🔐 Security: exam must belong to faculty
    const examCheck = await pool.query(
      `SELECT id FROM exams WHERE id = $1 AND faculty_id = $2`,
      [examId, facultyId]
    );

    if (!examCheck.rowCount) {
      return res.status(403).json({ message: "Unauthorized exam access" });
    }

    const result = await pool.query(
      `
      SELECT
        s.id AS student_id,
        s.name,
        s.roll_number,
        ea.status,
        ea.score,
        ea.correct_count,
        ea.attempted_count,
        ea.malpractice_count,
        ea.duration_taken
      FROM exam_attempts ea
      JOIN students s ON s.id = ea.student_id
      WHERE ea.exam_id = $1
      ORDER BY s.roll_number
      `,
      [examId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("EXAM ATTEMPTS ERROR:", err);
    res.status(500).json({ message: "Failed to load attempts" });
  }
};

/**
 * PUBLISH RESULTS
 * POST /api/faculty/exams/:examId/publish-results
 */
export const publishResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const facultyId = req.facultyId;

    await pool.query(
      `
      UPDATE exam_attempts
      SET results_published = true
      WHERE exam_id = $1
        AND exam_id IN (
          SELECT id FROM exams WHERE faculty_id = $2
        )
      `,
      [examId, facultyId]
    );

    res.json({ message: "Results published successfully" });
  } catch (err) {
    console.error("PUBLISH RESULTS ERROR:", err);
    res.status(500).json({ message: "Failed to publish results" });
  }
};

