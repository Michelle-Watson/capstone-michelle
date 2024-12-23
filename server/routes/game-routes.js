import * as gameController from "../controllers/game-controller.js";

import express from "express";
const router = express.Router();

router.route("/").get(gameController.index).post(gameController.createGame);

router
  .route("/:id")
  .get(gameController.findOne)
  .delete(gameController.removeGame)
  .put(gameController.editGame);

router.route("/:id/prices").get(gameController.getPricesForGame);

export default router;
