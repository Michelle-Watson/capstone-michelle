import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const index = async (_req, res) => {
  try {
    const data = await knex("prices");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving prices: ${err}`);
  }
};

const findOne = async (req, res) => {
  try {
    // Query the 'prices' table and join with the 'games' table to get game title and price details
    const priceFound = await knex("prices")
      .join("games", "prices.game_id", "games.id")
      .where("prices.id", req.params.id) // Look for the specific price using the ID
      .select(
        "prices.id",
        // "games.title as game_title",
        "games.title",
        "prices.platform_name",
        "prices.original_price",
        "prices.discount",
        "prices.discounted_price",
        "prices.url"
      );

    // If no price is found, return a 404 response
    if (priceFound.length === 0) {
      return res.status(404).json({
        message: `Price record with ID ${req.params.id} not found`,
      });
    }

    // Extract the first (and only) record from the array of results
    const priceData = priceFound[0];

    // Return the price data
    res.json(priceData);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve price data for price with ID ${req.params.id}: ${error}`,
    });
  }
};

export { index, findOne };
