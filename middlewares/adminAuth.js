import pool from "../db.js";

const adminAuth = async (req, res, next) => {
  try {
    const adminId = req.headers["x-admin-id"];

    if (!adminId) {
      return res.status(401).json({ message: "Admin not authenticated" });
    }

    const result = await pool.query(
      "SELECT id, role FROM faculty WHERE id = $1",
      [adminId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid admin" });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(result.rows[0].role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.admin = result.rows[0];
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    res.status(500).json({ message: "Admin authentication failed" });
  }
};

export default adminAuth;
