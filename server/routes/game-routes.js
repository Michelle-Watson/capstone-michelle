import * as gameController from "../controllers/game-controller.js";

import express from "express";
const router = express.Router();

router
  .route("/")
  .get(gameController.handleGamesRequest)
  .post(gameController.createGame);
// index -> handleGamesRequest

// The search route
// router.route("/").get(gameController.searchGames); // Add this for handling search

router
  .route("/:id")
  .get(gameController.findOne)
  .delete(gameController.removeGame)
  .put(gameController.editGame);

router.route("/:id/prices").get(gameController.getPricesForGame);

// New route to craft url for the 4 supported stores manually
// router.route("/:id/create-prices").post(gameController.createPricesforGame);

export default router;
