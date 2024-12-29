import initKnex from "knex";
import configuration from "../knexfile.js";
import axios from "axios";

const knex = initKnex(configuration);

import { formatPriceFields } from "../helpers/utils.js";

import {
  updateSteamPrice,
  getSteamAppIdViaSearch,
} from "../helpers/steam-helper.js";

import * as priceController from "./price-controller.js";

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
    console.log(
      "Access token fetched successfully",
      response.data.access_token
    );

    // Return the access token
    return response.data.access_token;
  } catch (err) {
    console.error("Error fetching access token", err);
    throw new Error("Could not fetch access token");
  }
};

// Utility function to create price data for any platform
const createPriceData = (gameId, gameTitle, platformName, storeUrl) => {
  return {
    game_id: gameId, // This will be the IGDB game ID
    platform_name: platformName,
    url: storeUrl,
    original_price: 0, // Will be updated after scraping
    discounted_price: 0, // Will be updated after scraping
    discount: 0, // Will be updated after scraping
  };
};

// Utility function to check and update or insert price data
const updateOrInsertPrice = async (gameId, platformName, priceData) => {
  const existingPrice = await knex("prices")
    .where({ game_id: gameId, platform_name: platformName })
    .first(); // Look for an existing price entry

  let updatedPriceData = { ...priceData };

  if (existingPrice) {
    // If an existing price entry is found, update it
    updatedPriceData = {
      ...updatedPriceData,
      updated_at: knex.fn.now(), // Set the updated timestamp
    };

    // Update the existing price record in the database
    await knex("prices")
      .where({ id: existingPrice.id })
      .update(updatedPriceData);

    // Fetch the updated price record
    const updatedPrice = await knex("prices")
      .where({ id: existingPrice.id })
      .first();

    return {
      message: `Price successfully updated for ${platformName}.`,
      price: updatedPrice,
    };
  } else {
    // Insert the new price into the 'prices' table
    const result = await knex("prices").insert(updatedPriceData);

    // Retrieve the inserted price (we'll use `game_id` to fetch it back)
    const newPriceId = result[0]; // The first element is the id of the newly inserted row
    const createdPrice = await knex("prices").where({ id: newPriceId }).first();

    return {
      message: `Price successfully added for ${platformName}.`,
      price: createdPrice,
    };
  }
};

// Store-specific function for Steam
const getSteamStoreData = async (gameTitle, gameId) => {
  // const steamAppId = await getSteamAppId(gameTitle);
  const steamAppId = await getSteamAppIdViaSearch(gameTitle);

  if (!steamAppId) {
    throw new Error(`Steam App ID not found for game title: "${gameTitle}"`);
  }

  const steamUrl = `https://store.steampowered.com/app/${steamAppId}/${gameTitle.replace(
    /\s+/g,
    "_"
  )}`;

  const priceData = createPriceData(gameId, gameTitle, "Steam", steamUrl);
  const updatedPriceData = await updateSteamPrice(priceData); // Update price info using updateSteamPrice function
  return {
    priceData: { ...priceData, ...updatedPriceData },
    platformName: "Steam",
  };
};

// Store-specific function for Humble Bundle
const getHumbleBundleStoreData = async (gameTitle, gameId) => {
  const steamAppId = await getHumbleBundleURLViaSearch(gameTitle);

  if (!steamAppId) {
    throw new Error(`Steam App ID not found for game title: "${gameTitle}"`);
  }

  const steamUrl = `https://store.steampowered.com/app/${steamAppId}/${gameTitle.replace(
    /\s+/g,
    "_"
  )}`;

  const priceData = createPriceData(
    gameId,
    gameTitle,
    "Humble Bundle",
    steamUrl
  );
  const updatedPriceData = await updateSteamPrice(priceData); // Update price info using updateSteamPrice function
  return {
    priceData: { ...priceData, ...updatedPriceData },
    platformName: "Steam",
  };
};

// Function to create prices for a game
const createPricesForGame = async (req, res) => {
  try {
    // 1. Try to find the game in the database
    const gameFound = await knex("games").where({ id: req.params.id }).first(); // Using .first() to retrieve the first match

    if (!gameFound) {
      return res
        .status(404)
        .json({ message: `Game with ID ${req.params.id} not found.` });
    }

    const gameId = gameFound.id; // The IGDB game ID
    const gameTitle = gameFound.title || "Balatro"; // Retrieve the title from the game object

    // Step 2: Get the platform-specific data
    let platformData;

    // Handle Steam platform for now, extend for other platforms via for loop?
    platformData = await getSteamStoreData(gameTitle, gameId);
    // Steam: All bundles are on the same URL, so this link will never need to be updated
    // Humble Bundle: Each bundle has a seperate URL, we should show the cheapest bundle that includes the base game. But when the bundle is no longer the cheapest option, we should switch the URL to the base game. So whenever we update Humble Bundle Prices, we should also update the URL. How do we do this w/o adding circular logic? Add a bool flag to the humblebundle-helper?
    // If creating a price: Create URL, send isURLUpdated=true to updateHBPrice
    // If updating all prices: send bool isURLUpdated = false to updateHBPrice, if false, call 'createURL' fxn to update HB price
    // Do individually for testing
    let isURLUpdated = false;
    // platformData = await getHumbleBundleStoreData(gameTitle, gameId);

    // Step 3: Update or Insert the price data for the platform (e.g., Steam)
    const { message, price } = await updateOrInsertPrice(
      gameId,
      platformData.platformName,
      platformData.priceData
    );

    const formattedPrice = formatPriceFields(price);

    // Return the appropriate response
    return res.status(200).json({
      message,
      formattedPrice,
    });
  } catch (error) {
    console.error("Error creating prices:", error);
    return res.status(500).json({
      message: `Error creating prices for game with ID ${req.params.id}: ${error.message}`,
    });
  }
};

const handleGamesRequest = async (req, res) => {
  const { query } = req.query; // Extract the query parameter from the URL

  if (query && query.trim() !== "") {
    // If a query is provided, perform a search
    console.log("Query provided: ", query);
    return searchGames(req, res);
  } else {
    // If no query, return all games (listing)
    return index(req, res);
  }
};

// Helper function to search games based on query
const searchGames = async (req, res) => {
  const { query } = req.query; // Get the search query from URL parameter

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search term cannot be empty." });
  }

  try {
    // Step 1: Fetch all games from the database
    const dbGames = await knex("games");

    // Step 2: Check if any titles in the database contain the search query (case-insensitive)
    const dbQueryGames = dbGames.filter(
      (game) => game.title.toLowerCase().includes(query.toLowerCase()) // Match titles based on query
    );

    // Step 3: Fetch games from IGDB
    const igdbGames = await getGamesFromIGDB(query);

    // Step 4: Combine the results, with priority to database games
    const allGames = [
      ...dbQueryGames, // Start with the database games
      ...igdbGames.filter(
        (igdbGame) => !dbQueryGames.some((dbGame) => dbGame.id === igdbGame.id) // Only add IGDB games if they don't already exist in DB
      ),
    ];

    // Step 5: Send the combined results
    res.status(200).json(allGames);
  } catch (err) {
    console.error("Error searching for games:", err);
    res.status(500).json({ message: "Error searching for games." });
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

// Helper function to convert IGDB game data to my own db format
const convertIGDBGame = (igdbGame) => {
  return {
    id: igdbGame.id || null, // If id is missing, return null
    title: igdbGame.name || "Untitled Game", // Default to "Untitled Game" if name is missing
    description: igdbGame.storyline || igdbGame.summary || "",
    consoles: igdbGame.genres?.map((genre) => genre.name) || [], // Safely map genres, default to empty array
    release_date: igdbGame.first_release_date
      ? formatReleaseDate(igdbGame.first_release_date)
      : "Unknown", // Format release date or use "Unknown"
    // image_id: co5qi9
    // cover.url: "//images.igdb.com/igdb/image/upload/t_thumb/co1wj7.jpg"
    // construct own URL to account for size
    imageurlSmall: igdbGame.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_small_2x/${igdbGame.cover.image_id}.png`
      : "", // Safe cover image URL
    imageurlBig: igdbGame.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${igdbGame.cover.image_id}.png`
      : "", // Safe cover image URL
  };
};

const getGamesFromIGDB = async (query) => {
  // Step 1: Fetch the list of game IDs already in database
  const dbGames = await knex("games");
  const dbGameIds = dbGames.map((game) => game.id); // Get an array of game IDs

  // Step 2: Prepare the `where` clause to exclude these IDs from the IGDB API request
  // IGDB's query language supports `!=` and `in` operators for filtering
  let excludeCondition =
    dbGameIds.length > 0
      ? `where id != (${dbGameIds.join(
          ", "
        )}) & aggregated_rating > 80 & platforms = 6` // Exclude IDs already in DB
      : "where aggregated_rating > 80 & platforms = 6"; // Fallback in case no IDs are in the DB

  const accessToken =
    process.env.ACCESS_TOKEN || (await getTwitchAccessToken());
  const url = "https://api.igdb.com/v4/games";
  const headers = {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${accessToken}`,
  };
  // https://api-docs.igdb.com/#game
  // similar games for future work

  // Step 3: Create the base body
  let body = "";

  // Step 4: If there is a query, prepend the search term at the start
  // Comparing PC games only for now (scarpped stores are for PC games)
  // where platforms = 6 -> PC (Microsoft Windows)
  // https://gist.github.com/ahmed-abdelazim/b533b443388baaafab3fc377e71e0109
  if (query && query.trim() !== "") {
    excludeCondition =
      dbGameIds.length > 0
        ? `where id != (${dbGameIds.join(", ")}) & platforms = (6)` // Exclude IDs already in DB
        : "where platforms = (6)"; // Fallback in case no IDs are in the DB

    // Prepend the search query
    console.log("Search query present");
    body = `search "${query}"; fields name, genres.name, storyline, summary, themes.name, cover.url, cover.image_id, first_release_date, similar_games.name, platforms.name;
  ${excludeCondition};`;
  } else {
    console.log("NO search query present");
    body = `fields name, genres.name, storyline, summary, themes.name, cover.url, cover.image_id, first_release_date, similar_games.name, platforms.name;
  ${excludeCondition};
  sort aggregated_rating asc;
  limit 10;`;
  }

  console.log("Request body:", body); // Debugging to ensure the body is correct

  try {
    console.log("Trying to fetch results");
    const response = await axios.post(url, body, { headers });

    // Convert the IGDB response into my dbGames format
    console.log("API response:", response.data); // Log the full response to see the structure

    // Check if the response data is an array and contains the expected structure
    if (!Array.isArray(response.data)) {
      console.error("Expected an array but got:", response.data);
      throw new Error("Invalid response format from IGDB API");
    }

    // Check if any items in the response data have the `platforms` property
    if (response.data.some((game) => !game.platforms)) {
      console.error(
        "Some games are missing the 'platforms' field:",
        response.data
      );
      throw new Error("Some games are missing the 'platforms' field");
    }

    // Now map the data as usual
    const convertedGames = response.data.map((game) => {
      console.log("Converting game:", game); // Log the game data being converted
      return convertIGDBGame(game);
    });

    console.log("Mapped data:", convertedGames); // Log the result after mapping
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

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // Remove if the call to IGDB excludes ids already in my database
    // excluded ids from the API call, can remove below
    // keep in case

    // Create a set of ids from dbGames
    const dbGameIds = new Set(dbGames.map((game) => game.id));

    // Filter out games from igdbGames that already exist in dbGames
    const uniqueIgdbGames = igdbGames.filter(
      (igdbGame) => !dbGameIds.has(igdbGame.id)
    );

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    // Combine the data from my database and the IGDB API
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
    // 1. Try to find game in db
    const gameFound = await knex("games").where({ id: req.params.id });

    // 2. If found in db, return it
    if (gameFound.length > 0) {
      // If game is found in DB, return it
      return res.json(gameFound[0]);
    }

    // 3. If not found in db, try to fetch from IGDB API
    const accessToken =
      process.env.ACCESS_TOKEN || (await getTwitchAccessToken());
    const url = "https://api.igdb.com/v4/games";
    const headers = {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    };
    const body = `
  fields name, genres.name, storyline, summary, themes.name, cover.url, cover.image_id, first_release_date, similar_games.name, platforms.name;
  where id = ${req.params.id};`;

    console.log("req.params.id", req.params.id);

    const response = await axios.post(url, body, { headers });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        message: `Game with ID ${req.params.id} not found in IGDB.`,
      });
    }
    const igdbGame = response.data[0];

    const convertedGame = convertIGDBGame(igdbGame);

    // Remove `consoles` field (if it exists) before inserting into DB
    delete convertedGame.consoles;

    // Debug: Log the converted game before inserting it
    console.log("Converted game to insert:", convertedGame);

    // Add game to db - errors here now
    // await knex("games").insert(convertedGame);
    // 4. Insert or update the game in the database with the custom ID from IGDB API
    const insertedGame = await knex("games")
      .insert(convertedGame)
      .onConflict("id") // Resolving conflict based on the `id`
      .merge(); // This will update the existing entry if there is a conflict

    console.log("after tryna add to db");

    // Send added game as the response
    res.json(insertedGame);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve game data for game with ID ${req.params.id}`,
    });
  }
};

// Make API calls to get prices of games
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

export {
  searchGames,
  index,
  findOne,
  createPricesForGame,
  getPricesForGame,
  createGame,
  editGame,
  removeGame,
  handleGamesRequest,
};
