// import db from "../db.js";

// export const getAllFaculties = async (req, res) => {
//   try {
//     // ✅ Optional: enforce role check if middleware missed
//     const adminId = req.headers["x-admin-id"];
//     if (!adminId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const adminCheck = await db.query(
//       "SELECT role FROM faculty WHERE id = $1",
//       [adminId]
//     );

//     if (
//       adminCheck.rowCount === 0 ||
//       !["ADMIN", "SUPER_ADMIN"].includes(adminCheck.rows[0].role)
//     ) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     // ✅ Fetch only FACULTY accounts
//     const result = await db.query(`
//       SELECT 
//         id,
//         name,
//         email,
//         registration_number,
//         role,
//         created_at
//       FROM faculty
//       WHERE role = 'FACULTY'
//       ORDER BY created_at DESC
//     `);

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error("Admin fetch faculties error:", err);
//     res.status(500).json({ message: "Failed to load faculty list" });
//   }
// };
import db from "../db.js";

export const getAllFaculties = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, email, registration_number, role, created_at
      FROM faculty where role = 'FACULTY'
      ORDER BY created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Admin fetch faculties error:", err);
    res.status(500).json({ message: "Failed to load faculty list" });
  }
};
