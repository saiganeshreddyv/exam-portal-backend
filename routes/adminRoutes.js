import express from "express";
import adminAuth from "../middlewares/adminAuth.js";
import { getAllFaculties } from "../controllers/adminController.js";

const router = express.Router();

// TEST ROUTE (VERY IMPORTANT)
router.get("/test", (req, res) => {
  res.send("ADMIN ROUTES WORKING");
});

// REAL ROUTE
router.get("/faculties", adminAuth, getAllFaculties);

export default router;
