import * as gameController from "../controllers/game-controller.js";

import express from "express";
const router = express.Router();

router.route("/").get(gameController.index);
// router.route("/").get(gameController.index).post(gameController.createGame);

// router.route("/:id").get(gameController.findOne).put(gameController.editGame);

// router.route("/:id/prices").get(gameController.getPrice);

export default router;
