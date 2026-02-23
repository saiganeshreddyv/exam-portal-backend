// // import pool from "../db.js";

// // export const createExam = async (req, res) => {
// //   try {
// //     const { title, description, date, duration, total_marks, faculty_id } = req.body;

// //     if (!title || !description || !date || !duration || !total_marks || !faculty_id) {
// //       return res.status(400).json({ message: "All fields are required." });
// //     }

// //     const result = await pool.query(
// //       `INSERT INTO exams (title, description, date, duration, total_marks, faculty_id)
// //        VALUES ($1, $2, $3, $4, $5, $6)
// //        RETURNING id`,
// //       [title, description, date, duration, total_marks, faculty_id]
// //     );

// //     res.status(201).json({
// //       message: "Exam created successfully",
// //       exam: { id: result.rows[0].id },
// //     });

// //   } catch (err) {
// //     console.error("Create exam error:", err);
// //     res.status(500).json({ message: "Failed to create exam" });
// //   }
// // };
// import pool from "../db.js";

// export const createExam = async (req, res) => {
//   try {
//     // const { title, description, date, duration, total_marks, faculty_id } = req.body;
//     const {
//   title,
//   description,
//   date,
//   duration,
//   total_marks,
//   faculty_id,
//   camera_required,
//   fullscreen_required,
//   max_malpractice_limit
// } = req.body;

//     if (!title || !description || !date || !duration || !total_marks || !faculty_id) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     const result = await pool.query(
//       `INSERT INTO exams (title, description, date, duration, total_marks, faculty_id)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        RETURNING id`,
//       [title, description, date, duration, total_marks, faculty_id]
//     );

//     res.status(201).json({
//       message: "Exam created successfully",
//       exam: { id: result.rows[0].id },
//     });

//   } catch (err) {
//     console.error("Create exam error:", err);
//     res.status(500).json({ message: "Failed to create exam" });
//   }
// };
import pool from "../db.js";

export const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      duration,
      total_marks,
      faculty_id,
      camera_required = true,
      fullscreen_required = true,
      max_malpractice_limit = 3
    } = req.body;

    if (!title || !description || !date || !duration || !total_marks || !faculty_id) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `
      INSERT INTO exams (
        title,
        description,
        date,
        duration,
        total_marks,
        faculty_id,
        camera_required,
        fullscreen_required,
        max_malpractice_limit
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id
      `,
      [
        title,
        description,
        date,
        duration,
        total_marks,
        faculty_id,
        camera_required,
        fullscreen_required,
        max_malpractice_limit
      ]
    );

    res.status(201).json({
      message: "Exam created successfully",
      exam: { id: result.rows[0].id }
    });

  } catch (err) {
    console.error("Create exam error:", err);
    res.status(500).json({ message: "Failed to create exam" });
  }
};
