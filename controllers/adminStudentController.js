// import db from "../db.js";
// import bcrypt from "bcryptjs";
// import csv from "csv-parser";
// import { Readable } from "stream";

// /* ================= GET STUDENTS ================= */
// export const getStudentsBySection = async (req, res) => {
//   const { sectionId } = req.params;

//   const result = await db.query(
//     `
//     SELECT id, roll_number, name, email, phone
//     FROM students
//     WHERE section_id = $1
//     ORDER BY roll_number
//     `,
//     [sectionId]
//   );

//   res.json(result.rows);
// };

// /* ================= ADD STUDENT ================= */
// export const addStudentToSection = async (req, res) => {
//   const { sectionId } = req.params;
//   const { roll_number, name, email, phone } = req.body;

//   const hashedPassword = await bcrypt.hash(roll_number, 10);

//   await db.query(
//     `
//     INSERT INTO students
//       (roll_number, name, email, phone, section_id, password, must_change_password)
//     VALUES ($1, $2, $3, $4, $5, $6, true)
//     `,
//     [roll_number, name, email, phone, sectionId, hashedPassword]
//   );

//   res.status(201).json({ message: "Student added" });
// };

// /* ================= UPDATE STUDENT ================= */
// export const updateStudent = async (req, res) => {
//   const { studentId } = req.params;
//   const { name, email, phone } = req.body;

//   await db.query(
//     `
//     UPDATE students
//     SET name = $1, email = $2, phone = $3
//     WHERE id = $4
//     `,
//     [name, email, phone, studentId]
//   );

//   res.json({ message: "Student updated" });
// };

// /* ================= DELETE STUDENTS ================= */
// export const deleteStudentsBulk = async (req, res) => {
//   const { studentIds } = req.body;

//   await db.query(
//     `DELETE FROM students WHERE id = ANY($1)`,
//     [studentIds]
//   );

//   res.json({ message: "Students deleted" });
// };


// export const uploadStudentsCsv = async (req, res) => {
//   try {
//     const { sectionId } = req.params;

//     if (!req.file || !req.file.buffer) {
//       return res.status(400).json({ message: "CSV file not received" });
//     }

//     const rows = [];          // ✅ DEFINE rows
//     const skipped = [];

//     Readable.from(req.file.buffer)
//       .pipe(csv({
//         separator: ",",
//         trim: true
//       }))
//       .on("data", (data) => {
//         rows.push(data);
//       })
//       .on("end", async () => {
//         console.log("TOTAL ROWS PARSED:", rows.length);

//         let inserted = 0;

//         for (const row of rows) {
//           const roll_number = row.roll_number?.trim();
//           const name = row.name?.trim();
//           const email = row.email?.trim();
//           const phone = row.phone?.trim() || null;

//           if (!roll_number || !name || !email) {
//             skipped.push({ email, reason: "Missing required fields" });
//             continue;
//           }

//           try {
//             const hashedPassword = await bcrypt.hash(roll_number, 10);

//             await db.query(
//               `
//               INSERT INTO students
//                 (roll_number, name, email, phone, section_id, password, must_change_password)
//               VALUES ($1, $2, $3, $4, $5, $6, true)
//               `,
//               [
//                 roll_number,
//                 name,
//                 email,
//                 phone,
//                 sectionId,
//                 hashedPassword
//               ]
//             );

//             inserted++;
//           } catch (err) {
//             if (err.code === "23505") {
//               skipped.push({ email, reason: "Duplicate entry" });
//             } else {
//               skipped.push({ email, reason: "DB error" });
//               console.error("DB ERROR:", err.message);
//             }
//           }
//         }

//         return res.json({
//           message: "CSV upload completed",
//           total: rows.length,
//           inserted,
//           skippedCount: skipped.length,
//           skipped
//         });
//       });

//   } catch (err) {
//     console.error("CSV UPLOAD ERROR:", err);
//     return res.status(500).json({ message: "CSV processing failed" });
//   }
// };


// export const getAllFaculty = async (req, res) => {
//   const result = await db.query(
//     `SELECT id, name, email FROM faculty WHERE role = 'faculty' ORDER BY name`
//   );
//   res.json(result.rows);
// };

// export const assignFacultyToSection = async (req, res) => {
//   const { sectionId } = req.params;
//   const { facultyId } = req.body;

//   await db.query(
//     `UPDATE sections SET faculty_id = $1 WHERE id = $2`,
//     [facultyId, sectionId]
//   );

//   res.json({ message: "Faculty assigned" });
// };

// export const getSectionById = async (req, res) => {
//   const { sectionId } = req.params;

//   const result = await db.query(
//     `
//     SELECT 
//       s.id,
//       s.year,
//       s.branch,
//       s.section_code,
//       f.name AS faculty_name
//     FROM sections s
//     LEFT JOIN faculty f ON f.id = s.faculty_id
//     WHERE s.id = $1
//     `,
//     [sectionId]
//   );

//   res.json(result.rows); // 👈 THIS RETURNS ARRAY
// };
import db from "../db.js";
import bcrypt from "bcryptjs";
import csv from "csv-parser";
import { Readable } from "stream";

/* =========================================================
   GET STUDENTS BY SECTION (USING section_code)
   ========================================================= */
export const getStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    // 1️⃣ Get section_code from sections table
    const sectionRes = await db.query(
      `SELECT section_code FROM sections WHERE id = $1`,
      [sectionId]
    );

    if (sectionRes.rowCount === 0) {
      return res.status(404).json({ message: "Section not found" });
    }

    const sectionCode = sectionRes.rows[0].section_code;

    // 2️⃣ Fetch students using section_code
    const result = await db.query(
      `
      SELECT id, roll_number, name, email, phone
      FROM students
      WHERE section_code = $1
      ORDER BY roll_number
      `,
      [sectionCode]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

/* =========================================================
   ADD SINGLE STUDENT TO SECTION
   ========================================================= */
export const addStudentToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { roll_number, name, email, phone } = req.body;

    // 1️⃣ Resolve section_code
    const sectionRes = await db.query(
      `SELECT section_code FROM sections WHERE id = $1`,
      [sectionId]
    );

    if (sectionRes.rowCount === 0) {
      return res.status(404).json({ message: "Section not found" });
    }

    const sectionCode = sectionRes.rows[0].section_code;

    const hashedPassword = await bcrypt.hash(roll_number, 10);

    // 2️⃣ Insert student using section_code
    await db.query(
      `
      INSERT INTO students
        (roll_number, name, email, phone, section_code, password, must_change_password)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      `,
      [roll_number, name, email, phone, sectionCode, hashedPassword]
    );

    res.status(201).json({ message: "Student added successfully" });
  } catch (err) {
    console.error("ADD STUDENT ERROR:", err);
    res.status(500).json({ message: "Failed to add student" });
  }
};

/* =========================================================
   UPDATE STUDENT
   ========================================================= */
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email, phone } = req.body;

    await db.query(
      `
      UPDATE students
      SET name = $1, email = $2, phone = $3
      WHERE id = $4
      `,
      [name, email, phone, studentId]
    );

    res.json({ message: "Student updated successfully" });
  } catch (err) {
    console.error("UPDATE STUDENT ERROR:", err);
    res.status(500).json({ message: "Failed to update student" });
  }
};

/* =========================================================
   DELETE STUDENTS (BULK)
   ========================================================= */
export const deleteStudentsBulk = async (req, res) => {
  try {
    const { studentIds } = req.body;

    await db.query(
      `DELETE FROM students WHERE id = ANY($1)`,
      [studentIds]
    );

    res.json({ message: "Students deleted successfully" });
  } catch (err) {
    console.error("DELETE STUDENTS ERROR:", err);
    res.status(500).json({ message: "Failed to delete students" });
  }
};

/* =========================================================
   UPLOAD STUDENTS VIA CSV
   ========================================================= */
export const uploadStudentsCsv = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "CSV file not received" });
    }

    // 1️⃣ Resolve section_code ONCE
    const sectionRes = await db.query(
      `SELECT section_code FROM sections WHERE id = $1`,
      [sectionId]
    );

    if (sectionRes.rowCount === 0) {
      return res.status(404).json({ message: "Section not found" });
    }

    const sectionCode = sectionRes.rows[0].section_code;

    const rows = [];
    const skipped = [];

    Readable.from(req.file.buffer)
      .pipe(csv({ separator: ",", trim: true }))
      .on("data", (data) => rows.push(data))
      .on("end", async () => {
        let inserted = 0;

        for (const row of rows) {
          const roll_number = row.roll_number?.trim();
          const name = row.name?.trim();
          const email = row.email?.trim();
          const phone = row.phone?.trim() || null;

          if (!roll_number || !name || !email) {
            skipped.push({ email, reason: "Missing required fields" });
            continue;
          }

          try {
            const hashedPassword = await bcrypt.hash(roll_number, 10);

            await db.query(
              `
              INSERT INTO students
                (roll_number, name, email, phone, section_code, password, must_change_password)
              VALUES ($1, $2, $3, $4, $5, $6, true)
              `,
              [roll_number, name, email, phone, sectionCode, hashedPassword]
            );

            inserted++;
          } catch (err) {
            if (err.code === "23505") {
              skipped.push({ email, reason: "Duplicate entry" });
            } else {
              skipped.push({ email, reason: "DB error" });
              console.error("CSV INSERT ERROR:", err.message);
            }
          }
        }

        res.json({
          message: "CSV upload completed",
          total: rows.length,
          inserted,
          skippedCount: skipped.length,
          skipped
        });
      });

  } catch (err) {
    console.error("CSV UPLOAD ERROR:", err);
    res.status(500).json({ message: "CSV processing failed" });
  }
};

export const getAllFaculty = async (req, res) => {
  const result = await db.query(
    `SELECT id, name, email FROM faculty WHERE role = 'faculty' ORDER BY name`
  );
  res.json(result.rows);
};


/* =========================================================
   ASSIGN FACULTY TO SECTION
   ========================================================= */
export const assignFacultyToSection = async (req, res) => {
  const { sectionId } = req.params;
  const { facultyId } = req.body;

  await db.query(
    `UPDATE sections SET faculty_id = $1 WHERE id = $2`,
    [facultyId, sectionId]
  );

  res.json({ message: "Faculty assigned successfully" });
};

/* =========================================================
   GET SECTION DETAILS
   ========================================================= */
export const getSectionById = async (req, res) => {
  const { sectionId } = req.params;

  const result = await db.query(
    `
    SELECT 
      s.id,
      s.year,
      s.branch,
      s.section_code,
      f.name AS faculty_name
    FROM sections s
    LEFT JOIN faculty f ON f.id = s.faculty_id
    WHERE s.id = $1
    `,
    [sectionId]
  );

  res.json(result.rows[0] || null);
};
