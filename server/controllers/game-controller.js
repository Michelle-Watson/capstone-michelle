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

export { index };
