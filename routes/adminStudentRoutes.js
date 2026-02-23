// import express from "express";
// import multer from "multer";
// import path from "path";
// import adminAuth from "../middlewares/adminAuth.js";
// import { uploadStudentsCsv } from "../controllers/adminStudentController.js";
// import {
//   addStudentToSection,
//   updateStudent,
//   getStudentsBySection,
//   deleteStudentsBulk
// } from "../controllers/adminStudentController.js";

// const router = express.Router();

// // get students by section
// router.get(
//   "/sections/:sectionId/students",
//   adminAuth,
//   getStudentsBySection
// );

// // add single student
// router.post(
//   "/sections/:sectionId/students",
//   adminAuth,
//   addStudentToSection
// );

// // update student
// router.put(
//   "/students/:studentId",
//   adminAuth,
//   updateStudent
// );

// // delete students (bulk)
// router.post(
//   "/students/delete",
//   adminAuth,
//   deleteStudentsBulk
// );

// const upload = multer({
//   dest: "uploads/",
//   fileFilter: (req, file, cb) => {
//     if (path.extname(file.originalname) !== ".csv") {
//       return cb(new Error("Only CSV files allowed"));
//     }
//     cb(null, true);
//   }
// });

// router.post(
//   "/sections/:sectionId/students/upload",
//   adminAuth,
//   upload.single("file"),
//   uploadStudentsCsv
// );

// export default router;
import express from "express";
import multer from "multer";
import path from "path";
import adminAuth from "../middlewares/adminAuth.js";
import {
  addStudentToSection,
  updateStudent,
  getStudentsBySection,
  deleteStudentsBulk,
  uploadStudentsCsv,
  getAllFaculty,
  assignFacultyToSection
} from "../controllers/adminStudentController.js";

const router = express.Router();

/* ================= STUDENT CRUD ================= */

// get students by section
router.get(
  "/sections/:sectionId/students",
  adminAuth,
  getStudentsBySection
);

// add single student
router.post(
  "/sections/:sectionId/students",
  adminAuth,
  addStudentToSection
);

// update student
router.put(
  "/students/:studentId",
  adminAuth,
  updateStudent
);

// delete students (bulk)
router.post(
  "/students/delete",
  adminAuth,
  deleteStudentsBulk
);

/* ================= CSV UPLOAD ================= */

// ✅ memory storage (REQUIRED)
const storage = multer.memoryStorage();

// ✅ SAFE CSV FILTER
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    ext !== ".csv" &&
    mime !== "text/csv" &&
    mime !== "application/vnd.ms-excel"
  ) {
    return cb(new Error("Only CSV files allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ✅ CSV upload route (SAFE WRAPPER)
router.post(
  "/sections/:sectionId/students/upload",
  adminAuth,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ message: "CSV file is required" });
      }
      next();
    });
  },
  uploadStudentsCsv
);


router.get("/faculty", adminAuth, getAllFaculty);

router.put(
  "/sections/:sectionId/assign-faculty",
  adminAuth,
  assignFacultyToSection
);


export default router;
