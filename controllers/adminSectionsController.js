// import db from "../db.js";

// /**
//  * GET ALL SECTIONS (GLOBAL)
//  */
// export const getAllSections = async (req, res) => {
//   try {
//     const result = await db.query(`
//   SELECT 
//     s.id,
//     s.year,
//     s.branch,
//     s.section_code,
//     f.name AS faculty_name,
//     COUNT(st.id)::int AS student_count
//   FROM sections s
//   LEFT JOIN faculty f ON s.faculty_id = f.id
//   LEFT JOIN students st ON st.section = s.section_code
//   GROUP BY 
//     s.id,
//     s.year,
//     s.branch,
//     s.section_code,
//     f.name
//   ORDER BY s.year, s.branch, s.section_code
// `);

//     // const result = await db.query(`
//     //   SELECT 
//     //     s.id,
//     //     s.year,
//     //     s.branch,
//     //     s.section_code,
//     //     f.name AS faculty_name,
//     //     COUNT(st.id) AS student_count
//     //   FROM sections s
//     //   LEFT JOIN faculty f ON s.faculty_id = f.id
//     //   LEFT JOIN students st ON st.section_id = s.id
//     //   GROUP BY s.id, f.name
//     //   ORDER BY s.year, s.branch, s.section_code
//     // `);

//     res.json(result.rows);
//   } catch (err) {
//     console.error("Get sections error:", err);
//     res.status(500).json({ message: "Failed to fetch sections" });
//   }
// };

// /**
//  * CREATE SECTION
//  */
// export const createSection = async (req, res) => {
//   try {
//     const { year, branch, section_code } = req.body;

//     if (!year || !branch || !section_code) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const exists = await db.query(
//       `SELECT id FROM sections 
//        WHERE year = $1 AND branch = $2 AND section_code = $3`,
//       [year, branch, section_code]
//     );

//     if (exists.rowCount > 0) {
//       return res.status(409).json({ message: "Section already exists" });
//     }

//     const result = await db.query(
//       `INSERT INTO sections (year, branch, section_code)
//        VALUES ($1, $2, $3)
//        RETURNING *`,
//       [year, branch, section_code]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error("Create section error:", err);
//     res.status(500).json({ message: "Failed to create section" });
//   }
// };

// /**
//  * SECTION DETAILS
//  */
// export const getSectionDetails = async (req, res) => {
//   try {
//     const { sectionId } = req.params;

//     const sectionResult = await db.query(
//       `
//       SELECT 
//         s.id,
//         s.year,
//         s.branch,
//         s.section_code,
//         f.id AS faculty_id,
//         f.name AS faculty_name,
//         f.email AS faculty_email
//       FROM sections s
//       LEFT JOIN faculty f ON s.faculty_id = f.id
//       WHERE s.id = $1
//       `,
//       [sectionId]
//     );

//     if (sectionResult.rowCount === 0) {
//       return res.status(404).json({ message: "Section not found" });
//     }

//     const studentsResult = await db.query(
//       `
//       SELECT id, roll_number, name, email, phone
//       FROM students
//       WHERE section = (
//   SELECT section_code FROM sections WHERE id = $1
// )
//       ORDER BY roll_number
//       `,
//       [sectionId]
//     );

//     res.json({
//       section: sectionResult.rows[0],
//       students: studentsResult.rows,
//     });
//   } catch (err) {
//     console.error("Section details error:", err);
//     res.status(500).json({ message: "Failed to load section details" });
//   }
// };
import db from "../db.js";

/* =========================================================
   GET ALL SECTIONS
   ========================================================= */
export const getAllSections = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.id,
        s.year,
        s.branch,
        s.section_code,
        f.name AS faculty_name,
        COUNT(st.id)::int AS student_count
      FROM sections s
      LEFT JOIN faculty f 
        ON s.faculty_id = f.id
      LEFT JOIN students st 
        ON st.section_code = s.section_code
      GROUP BY 
        s.id,
        s.year,
        s.branch,
        s.section_code,
        f.name
      ORDER BY s.year, s.branch, s.section_code
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET ALL SECTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sections" });
  }
};

/* =========================================================
   CREATE SECTION
   ========================================================= */
export const createSection = async (req, res) => {
  try {
    const { year, branch, section_code } = req.body;

    if (!year || !branch || !section_code) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await db.query(
      `
      SELECT id FROM sections
      WHERE year = $1 AND branch = $2 AND section_code = $3
      `,
      [year, branch, section_code]
    );

    if (exists.rowCount > 0) {
      return res.status(409).json({ message: "Section already exists" });
    }

    const result = await db.query(
      `
      INSERT INTO sections (year, branch, section_code)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [year, branch, section_code]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE SECTION ERROR:", err);
    res.status(500).json({ message: "Failed to create section" });
  }
};

/* =========================================================
   GET SECTION DETAILS (WITH STUDENTS)
   ========================================================= */
export const getSectionDetails = async (req, res) => {
  try {
    const { sectionId } = req.params;

    /* ---------- SECTION INFO ---------- */
    const sectionResult = await db.query(
      `
      SELECT 
        s.id,
        s.year,
        s.branch,
        s.section_code,
        f.id AS faculty_id,
        f.name AS faculty_name,
        f.email AS faculty_email
      FROM sections s
      LEFT JOIN faculty f ON s.faculty_id = f.id
      WHERE s.id = $1
      `,
      [sectionId]
    );

    if (sectionResult.rowCount === 0) {
      return res.status(404).json({ message: "Section not found" });
    }

    const sectionCode = sectionResult.rows[0].section_code;

    /* ---------- STUDENTS IN SECTION ---------- */
    const studentsResult = await db.query(
      `
      SELECT id, roll_number, name, email, phone
      FROM students
      WHERE section_code = $1
      ORDER BY roll_number
      `,
      [sectionCode]
    );

    res.json({
      section: sectionResult.rows[0],
      students: studentsResult.rows
    });
  } catch (err) {
    console.error("SECTION DETAILS ERROR:", err);
    res.status(500).json({ message: "Failed to load section details" });
  }
};
