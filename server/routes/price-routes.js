import * as priceController from "../controllers/price-controller.js";

import express from "express";
const router = express.Router();

router.route("/").get(priceController.index).post(priceController.addPrice);

router
  .route("/:id")
  .get(priceController.findOne)
  .put(priceController.editPrice)
  .delete(priceController.removePrice);

export default router;
