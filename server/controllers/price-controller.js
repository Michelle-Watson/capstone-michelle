import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const index = async (_req, res) => {
  try {
    const data = await knex("prices");

    // Convert price fields to numbers before sending the response
    const formattedData = data.map((price) => ({
      ...price,
      original_price: parseFloat(price.original_price),
      discount: parseFloat(price.discount),
      discounted_price: parseFloat(price.discounted_price),
    }));

    res.status(200).json(formattedData);
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

    // Convert price fields to numbers before sending the response
    const formattedPriceData = {
      ...priceData,
      original_price: parseFloat(priceData.original_price),
      discount: parseFloat(priceData.discount),
      discounted_price: parseFloat(priceData.discounted_price),
    };

    // Return the price data
    res.json(formattedPriceData);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve price data for price with ID ${req.params.id}: ${error}`,
    });
  }
};

const addPrice = async (req, res) => {
  const {
    game_id,
    platform_name,
    original_price,
    discount,
    discounted_price,
    url,
  } = req.body;

  // Validate the required fields
  if (
    !game_id ||
    !platform_name?.trim() ||
    isNaN(original_price) ||
    !url?.trim() ||
    !isValidUrl(url) // URL validation
  ) {
    return res.status(400).json({
      message:
        "Invalid or missing data in request body. Ensure all fields are provided, and prices are valid numbers.",
    });
  }

  // If discount is provided, ensure it's a valid number
  if (discount !== undefined && isNaN(discount)) {
    return res.status(400).json({
      message: "Discount must be a valid number.",
    });
  }

  // If discounted_price is provided, ensure it's a valid number
  if (discounted_price !== undefined && isNaN(discounted_price)) {
    return res.status(400).json({
      message: "Discounted price must be a valid number.",
    });
  }

  // Check the conditions for missing discount or discounted_price
  if (
    (discount === undefined && discounted_price === undefined) || // Cannot have both missing
    (discounted_price === undefined && discount === undefined) // Both discount and discounted_price cannot be missing at the same time
  ) {
    return res.status(400).json({
      message:
        "Either discount or discounted_price must be provided. Ensure at least one of them is present.",
    });
  }

  try {
    // Check if the game exists in the 'games' table
    const gameExists = await knex("games")
      .select("id")
      .where("id", game_id)
      .first();

    if (!gameExists) {
      return res.status(400).json({ message: "Invalid game_id" });
    }

    // Ensure that price fields are treated as numbers
    const validOriginalPrice = parseFloat(original_price);

    let validDiscount = null;
    if (discount) {
      validDiscount = parseFloat(discount);
    }

    let validDiscountedPrice = null;
    if (discounted_price) {
      validDiscountedPrice = parseFloat(discounted_price);
    }

    // Calculate the discount if it's missing and discounted_price is provided
    let calculatedDiscount = validDiscount;
    let calculatedDiscountedPrice = validDiscountedPrice;

    if (validDiscount === null && validDiscountedPrice !== null) {
      // If discount is not provided, but discounted_price is, calculate the discount percentage
      calculatedDiscount =
        ((validOriginalPrice - validDiscountedPrice) / validOriginalPrice) *
        100;
      calculatedDiscountedPrice = validDiscountedPrice; // Use provided discounted price
    } else if (validDiscount !== null && validDiscountedPrice === null) {
      // If discounted_price is not provided, calculate it from original_price and discount percentage
      calculatedDiscountedPrice =
        validOriginalPrice * (1 - calculatedDiscount / 100);
    }

    // Create the new price object
    const newPrice = {
      game_id,
      platform_name,
      original_price: validOriginalPrice,
      discount: calculatedDiscount,
      discounted_price: calculatedDiscountedPrice, // Use the calculated discounted price
      url,
    };

    // Insert the new price into the 'prices' table
    const result = await knex("prices").insert(newPrice);

    // Retrieve the inserted price (we'll use `game_id` to fetch it back)
    const newPriceId = result[0]; // The first element is the id of the newly inserted row
    const createdPrice = await knex("prices").where({ id: newPriceId }).first();

    // Ensure the returned price fields are numbers
    const formattedCreatedPrice = {
      ...createdPrice,
      original_price: parseFloat(createdPrice.original_price),
      discount: parseFloat(createdPrice.discount),
      discounted_price: parseFloat(createdPrice.discounted_price),
    };

    // Return the newly created price with the related game_id and other details
    res.status(201).json(formattedCreatedPrice);
  } catch (error) {
    res.status(500).json({
      message: `Error creating price for game with ID ${req.body.game_id}: ${error}`,
    });
  }
};

// Helper function to validate the URL
const isValidUrl = (url) => {
  const regex =
    /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
  return regex.test(url);
};

export { index, findOne, addPrice };
