import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const index = async (_req, res) => {
  try {
    // get data from knex db, table games
    const data = await knex("games");
    // knex("games")
    // is the same as
    // knex.select("*").from("games")
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving games: ${err}`);
  }
};

const findOne = async (req, res) => {
  try {
    const gameFound = await knex("games").where({ id: req.params.id });

    if (gameFound.length === 0) {
      return res.status(404).json({
        message: `Game with ID ${req.params.id} not found`,
      });
    }

    const gameData = gameFound[0];
    res.json(gameData);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve game data for game with ID ${req.params.id}`,
    });
  }
};

const getPricesForGame = async (req, res) => {
  try {
    const prices = await knex("games")
      .join("prices", "prices.game_id", "games.id")
      .where({ game_id: req.params.id });

    res.json(prices);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve prices for game with ID ${req.params.id}: ${error}`,
    });
  }
};

export { index, findOne, getPricesForGame };
