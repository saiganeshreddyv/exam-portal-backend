import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔹 Faculty Login
 * Uses registration_number + password
 */
export const loginFaculty = async (req, res) => {
  const { registration_number, password } = req.body;
  console.log("🧾 Login received:", req.body);

  if (!registration_number || !password) {
    return res
      .status(400)
      .json({ message: "Registration number and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM faculty WHERE registration_number = $1 AND status = true",
      [registration_number]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    let match = false;
    if (user.password.startsWith("$2b$")) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = password === user.password;
    }

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.must_change_password) {
      return res.status(200).json({
        message: "Password change required",
        requireChange: true,
        registration_number: user.registration_number,
      });
    }

    const token = jwt.sign(
      { id: user.id, role: "faculty" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    delete user.password;

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("❌ Faculty login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Faculty Change Password
 * Used when must_change_password = TRUE
 */
export const changeFacultyPassword = async (req, res) => {
  console.log("🔥 Faculty password change hit");
  const { registration_number, newPassword } = req.body;

  if (!registration_number || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `
      UPDATE faculty
      SET password = $1, must_change_password = FALSE
      WHERE registration_number = $2
      RETURNING id, name, email, registration_number;
    `;

    const result = await pool.query(updateQuery, [
      hashedPassword,
      registration_number,
    ]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Faculty not found" });

    res.status(200).json({
      message: "Password updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Faculty Password Update Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
