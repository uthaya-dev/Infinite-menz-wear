import express from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
  addVariant,
  deleteVariant,
  editVariant,
  searchVariants,
  updateProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.delete("/:id", deleteProduct);
router.put("/:id", updateProduct);
router.post("/:id/add-variant", addVariant);
router.put("/:productId/variant/:variantId", editVariant);
router.delete("/:productId/variant/:variantId", deleteVariant);
router.get("/search-variants", searchVariants);

export default router;
