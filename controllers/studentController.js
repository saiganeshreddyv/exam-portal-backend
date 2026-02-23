import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔹 Student Login
 * Uses registration_number + password
 */
export const loginStudent = async (req, res) => {
  const { registration_number, password } = req.body;

  if (!registration_number || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const result = await pool.query(
      "SELECT * FROM students WHERE roll_number = $1",
      [registration_number]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = result.rows[0];

    // Compare passwords (bcrypt)
    // const match = await bcrypt.compare(password, user.password);
    let match = false;

if (user.password.startsWith("$2b$")) {
  // Hashed password
  match = await bcrypt.compare(password, user.password);
} else {
  // Plain text (old user)
  match = password === user.password;
}

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // If must_change_password = true, redirect to change-password
    if (user.must_change_password) {
      return res.status(200).json({
        message: "Password change required",
        requireChange: true,
        registration_number: user.registration_number,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, type: "student" },
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
    console.error("❌ Student Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Student Change Password
 * Used when must_change_password = TRUE
 */
export const changeStudentPassword = async (req, res) => {
  const { registration_number, newPassword } = req.body;
  console.log("🔥 Student password change route hit!");

  if (!registration_number || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `
      UPDATE students
      SET password = $1, must_change_password = FALSE
      WHERE roll_number = $2
      RETURNING id, name, email, roll_number ;
    `;

    const result = await pool.query(updateQuery, [
      hashedPassword,
      registration_number,
    ]);

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Student not found" });

    res.status(200).json({
      message: "Password updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Change Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
