import pool from "../db.js";

export const getFacultyOverview = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const facultyResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        registration_number AS reg_no,
        role,
        status
      FROM faculty
      WHERE id = $1
      `,
      [facultyId]
    );

    const statsResult = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM questions WHERE faculty_id = $1) AS questions,
        (SELECT COUNT(*) FROM exams WHERE faculty_id = $1) AS exams,
        (SELECT COUNT(*) FROM sections WHERE faculty_id = $1) AS sections
      `,
      [facultyId]
    );

    res.json({
      faculty: facultyResult.rows[0],
      stats: statsResult.rows[0],
    });
  } catch (err) {
    console.error("Admin faculty overview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const toggleFacultyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE faculty
      SET status = NOT status
      WHERE id = $1
      RETURNING id, status
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({
      message: "Status updated",
      status: result.rows[0].status,
    });
  } catch (err) {
    console.error("Toggle faculty status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFacultyQuestions = async (req, res) => {
  const { facultyId } = req.params;

  const result = await pool.query(
    `
    SELECT id, question, marks
    FROM questions
    WHERE faculty_id = $1
    `,
    [facultyId]
  );

  res.json(result.rows);
};
