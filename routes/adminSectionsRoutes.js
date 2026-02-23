import express from "express";
import adminAuth from "../middlewares/adminAuth.js";
import {
  getAllSections,
  createSection,
  getSectionDetails,
} from "../controllers/adminSectionsController.js";

const router = express.Router();

/**
 * GET /api/admin/sections
 * List all sections (global)
 */
router.get("/sections", adminAuth, getAllSections);

/**
 * POST /api/admin/sections
 * Create a new section
 */
router.post("/sections", adminAuth, createSection);

/**
 * GET /api/admin/sections/:sectionId
 * Section details + students + faculty
 */
router.get("/sections/:sectionId", adminAuth, getSectionDetails);

export default router;
