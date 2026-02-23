// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import studentRoutes from "./routes/studentRoutes.js";
// // import facultyRoutes from "./routes/facultyRoutes.js";
// // // import examRoutes from "./routes/examRoutes.js";
// // dotenv.config();
// // const app = express();

// // // ✅ 1. Must come before routes
// // app.use(cors());
// // app.use(express.json()); // <<<<<< REQUIRED
// // app.use(express.urlencoded({ extended: true }));

// // // ✅ 2. Then your routes
// // app.use("/api/students", studentRoutes);
// // app.use("/api/faculty", facultyRoutes);
// // // app.use("/api/exams", examRoutes); // exam routes
// // // ✅ 3. Optional health check
// // const examRoutes = require("./routes/examRoutes");
// // app.use("/api/faculty", examRoutes);

// // app.get("/", (req, res) => res.send("Server is running ✅"));

// // // ✅ 4. Start the server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";

// import studentRoutes from "./routes/studentRoutes.js";
// import facultyRoutes from "./routes/facultyRoutes.js";
// import examRoutes from "./routes/examRoutes.js";  // << FIXED
// import questionRoutes from "./routes/questionRoutes.js";

// dotenv.config();

// const app = express();

// // ✅ Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Routes
// app.use("/api/students", studentRoutes);
// app.use("/api/faculty", facultyRoutes);
// app.use("/api/faculty", examRoutes);  // << exam routes work under /faculty
// app.use("/api/questions", questionRoutes); // << question routes

// // Health Check
// app.get("/", (req, res) => {
//   res.send("Server is running ✅");
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import studentRoutes from "./routes/studentRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminFacultyRoutes from "./routes/adminFacultyRoutes.js";
import adminSectionsRoutes from "./routes/adminSectionsRoutes.js";
import adminStudentRoutes from "./routes/adminStudentRoutes.js";
import examAttemptsRoutes from "./routes/examAttempts.js";
import facultyResultsRoutes from "./routes/facultyResults.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/faculty", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminFacultyRoutes);
app.use("/api/admin", adminSectionsRoutes);
app.use("/api/admin", adminStudentRoutes);
app.use("/api/exam-attempts", examAttemptsRoutes);
app.use("/api/faculty", facultyResultsRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
