import express from "express";
import {
  createPurchase,
  updatePurchase,
  getPurchases,
} from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", createPurchase);
router.put("/:purchaseId", updatePurchase);
router.get("/", getPurchases);
export default router;
