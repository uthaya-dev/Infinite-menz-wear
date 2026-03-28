import express from "express";
import {
  createSale,
  updateSale,
  getSales,
  getSaleById,
} from "../controllers/saleController.js";

const router = express.Router();

router.post("/", createSale);
router.put("/:saleId", updateSale);
router.get("/", getSales); // list all sales
router.get("/:id", getSaleById);

export default router;
