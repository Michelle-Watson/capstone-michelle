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

const createGame = async (req, res) => {
  const { title, description, release_date } = req.body;

  // Validate the required fields
  if (
    !title?.trim() ||
    !description?.trim() ||
    !release_date?.trim() ||
    isNaN(new Date(release_date)) // Check if the release date is a valid date
  ) {
    return res.status(400).json({
      message:
        "Invalid or missing data in request body. Please ensure all fields are provided and the release date is valid.",
    });
  }

  try {
    // Create a new game object to insert into the database
    const newGame = {
      title,
      description,
      release_date,
    };

    // const result = await knex("user").games(req.body);
    // Insert the new game into the 'games' table
    const [newGameId] = await knex("games").insert(newGame).returning("*");

    // Return the newly created game along with its ID
    res.status(201).json({ id: newGameId, ...newGame });
  } catch (error) {
    res.status(500).json({
      message: `Error creating game:  ${error}`,
    });
  }
};

const editGame = async (req, res) => {
  const { title, description, release_date } = req.body;

  // Validate the required fields
  if (
    !title?.trim() ||
    !description?.trim() ||
    !release_date?.trim() ||
    isNaN(new Date(release_date)) // Check if the release date is a valid date
  ) {
    return res.status(400).json({
      message:
        "Invalid or missing data in request body. Please ensure all fields are provided and the release date is valid.",
    });
  }

  try {
    // Update the game in the 'games' table
    const gameUpdated = await knex("games")
      .where({ id: req.params.id }) // Find the game by the ID provided in the URL
      .update({
        title,
        description,
        release_date,
      });

    // If no rows were updated, it means the game with the provided ID was not found
    if (gameUpdated === 0) {
      return res.status(404).json({
        message: `Unable to find game with ID ${req.params.id}`,
      });
    }

    // Retrieve updated game from the database
    const editedGame = await knex("games")
      .where({ id: req.params.id })
      .select("id", "title", "description", "release_date")
      .first(); // Only return the first result (since IDs are unique)

    // Send the updated game back in the response
    res.status(200).json(editedGame);
  } catch (error) {
    res
      .status(500)
      .send(`Error editing game with ID ${req.params.id}: ${error}`);
  }
};

export { index, findOne, getPricesForGame, createGame, editGame };
