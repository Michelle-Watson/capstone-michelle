// import seed data files, arrays of objects
import gameData from "../seed-data/games.js";
import priceData from "../seed-data/prices.js";

export async function seed(knex) {
  await knex("prices").del();
  await knex("games").del();
  await knex("games").insert(gameData);
  await knex("prices").insert(priceData);
}
