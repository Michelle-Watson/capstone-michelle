import initKnex from "knex";
import configuration from "../knexfile.js";
import axios from "axios";
const knex = initKnex(configuration);

// Fetch access token from Twitch
const getTwitchAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      }
    );

    // Return the access token
    return response.data.access_token;
  } catch (err) {
    console.error("Error fetching access token", err);
    throw new Error("Could not fetch access token");
  }
};

// Helper function to convert IGDB release date (UNIX timestamp) to YYYY-MM-DD format
const formatReleaseDate = (timestamp) => {
  // return null sets date as 1969-12-31, just set it as such so db doesn't have a null value
  if (!timestamp) return `1969-12-31`;
  const date = new Date(timestamp * 1000); // Convert UNIX timestamp to milliseconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (1-based)
  const day = String(date.getDate()).padStart(2, "0"); // Get day
  return `${year}-${month}-${day}`;
};

// Helper function to convert IGDB game data to your own db format
const convertIGDBGame = (igdbGame) => {
  return {
    id: igdbGame.id, // Map IGDB ID to your db ID
    title: igdbGame.name, // Map IGDB name to db title
    description: igdbGame.storyline || igdbGame.summary || "",
    consoles: igdbGame.genres.map((genre) => genre.name), // Map IGDB genres to db
    release_date: formatReleaseDate(igdbGame.first_release_date), // Convert and map release date
    // image_id: co5qi9
    // cover.url: "//images.igdb.com/igdb/image/upload/t_thumb/co1wj7.jpg"
    // construct own URL to account for size
    imageurlSmall: `https://images.igdb.com/igdb/image/upload/t_cover_small_2x/${igdbGame.cover.image_id}.png`,
    imageurlBig: `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${igdbGame.cover.image_id}.png`,
  };
};

const getGamesFromIGDB = async () => {
  const accessToken =
    process.env.ACCESS_TOKEN || (await getTwitchAccessToken());
  const url = "https://api.igdb.com/v4/games";
  const headers = {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${accessToken}`,
  };
  const body = `
  fields name, genres.name, storyline, summary, themes.name, cover.url, cover.image_id, first_release_date;
  where aggregated_rating > 80;
  sort aggregated_rating asc;
  limit 10;`;

  // const body = `
  //           fields name, genres.name, storyline, themes.name, cover.url, summary;
  //           where aggregated_rating > 80;
  //           sort aggregated_rating asc;
  //           limit 10;`;

  try {
    const response = await axios.post(url, body, { headers });
    // Convert the IGDB response into your dbGames format
    const convertedGames = response.data.map(convertIGDBGame);
    return convertedGames;
  } catch (err) {
    console.error("Error fetching games from IGDB", err);
    throw new Error("Could not fetch games");
  }
};

const index = async (_req, res) => {
  try {
    // get data from knex db, table games
    const dbGames = await knex("games");

    // Optionally fetch from the IGDB API
    const igdbGames = await getGamesFromIGDB();

    // Combine the data from your database and the IGDB API
    const allGames = [...dbGames, ...igdbGames];

    // knex("games")
    // is the same as
    // knex.select("*").from("games")
    res.status(200).json(allGames);
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
  const { title, description, release_date, imageurlSmall, imageurlBig } =
    req.body;

  // Validate the required fields
  if (
    !title?.trim() ||
    !description?.trim() ||
    !release_date?.trim() ||
    isNaN(new Date(release_date)) || // Check if the release date is a valid date
    !imageurlSmall?.trim() ||
    !imageurlBig?.trim()
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
      imageurlSmall,
      imageurlBig,
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
  const { title, description, release_date, imageurlSmall, imageurlBig } =
    req.body;

  // Validate the required fields
  if (
    !title?.trim() ||
    !description?.trim() ||
    !release_date?.trim() ||
    isNaN(new Date(release_date)) || // Check if the release date is a valid date
    !imageurlSmall?.trim() ||
    !imageurlBig?.trim()
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
        imageurlSmall,
        imageurlBig,
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

const removeGame = async (req, res) => {
  try {
    const rowsDeleted = await knex("games")
      .where({ id: req.params.id })
      .delete();

    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ message: `Game with ID ${req.params.id} not found` });
    }

    // No Content response
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: `Unable to delete game with id ${req.params.id}:: ${error}`,
    });
  }
};

export { index, findOne, getPricesForGame, createGame, editGame, removeGame };
