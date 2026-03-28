import express from "express";
import {
  getSalesReport,
  getPurchaseReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/sales", getSalesReport);
router.get("/purchase", getPurchaseReport);

export default router;
