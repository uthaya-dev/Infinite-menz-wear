import express from "express";
import {
  createMaster,
  getMasters,
  updateMaster,
  deleteMaster,
} from "../controllers/masterController.js";

const router = express.Router();

// Create
router.post("/", createMaster);

// Get by type
router.get("/:type", getMasters);

// Update
router.put("/:id", updateMaster);

// Delete
router.delete("/:id", deleteMaster);

export default router;
