import db from "../db.js";
import bcrypt from "bcrypt";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const result = await db.query(
      `
      SELECT id, name, email, password, role
      FROM faculty
      WHERE email = $1
        AND role IN ('ADMIN', 'SUPER_ADMIN')
      `,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = result.rows[0];

    // ✅ bcrypt comparison (THIS WAS MISSING / WRONG)
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ success
    res.status(200).json({
      message: "Admin login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
