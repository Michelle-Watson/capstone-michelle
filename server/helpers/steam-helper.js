import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

export const getSteamAppIdViaSearch = async (gameTitle) => {
  try {
    // Fetch the search results page
    const response = await axios.get(
      `https://store.steampowered.com/search/?term=${gameTitle.replace(
        /\s+/g,
        "+"
      )}`
    );
    const html = response.data;

    // verify html is of the correct page
    fs.writeFileSync("./steam_results.html", html);

    // Load the HTML into Cheerio for parsing
    const $ = cheerio.load(html);

    // Extract the AppID of the first result
    const firstGame = $(".search_result_row").first();
    const appId = firstGame.attr("data-ds-appid");

    if (appId) {
      console.log(`Found App ID for "${gameTitle}": ${appId}`);
      return appId;
    } else {
      console.log("No App ID found for the first result.");
      return null;
    }
  } catch (err) {
    console.error("Error fetching Steam App ID:", err.message);
    return null; // Handle any errors gracefully
  }
};

export const updateSteamPrice = async (priceData) => {
  try {
    // Fetch the page
    // const response = await axios.get(priceData.url);
    let url = priceData.url;
    // testing non-discounted game logic
    // url = "https://store.steampowered.com/app/3121110/Zort";

    // Add the 'birthtime' cookie to simulate age verification
    // otherwise, we are redirected to the agecheck: https://store.steampowered.com/agecheck/app/1091500/ instead
    const response = await axios.get(url, {
      headers: {
        Cookie: "birthtime=568022401; mature_content=1",
      },
    });

    const html = response.data;

    // verify html is of the correct page
    fs.writeFileSync("./steam_store.html", html);

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Locate the first game purchase section (ensures we targetting the base game, no bundles)
    const gameSection = $(".game_area_purchase_game").first();

    // Initialize default values for price details
    let originalPriceText = "";
    let discountedPriceText = "";
    let discountText = "";
    let isDiscounted = false;

    // Check if the base game is discounted
    if (gameSection.find(".discount_original_price").length > 0) {
      // If the discount selectors exist, the game is discounted
      originalPriceText = gameSection
        .find(".discount_original_price")
        .first()
        .text()
        .trim();
      // Example: <div class="discount_original_price">CDN$ 79.99</div>

      discountedPriceText = gameSection
        .find(".discount_final_price")
        .first()
        .text()
        .trim();
      // Example: <div class="discount_final_price">CDN$ 35.99</div>

      discountText = gameSection.find(".discount_pct").first().text().trim();
      // Example: <div class="discount_pct">-55%</div>

      isDiscounted = true;
    } else {
      // If the game is not discounted, only the original price exists
      originalPriceText = gameSection
        .find(".game_purchase_price")
        .first()
        .text()
        .trim();
      discountedPriceText = originalPriceText; // No discount, so the discounted price is the same
      discountText = ""; // No discount, so set it as an empty string
      isDiscounted = false;
    }

    // Extract the currency from the originalPriceText
    const currencyMatch = originalPriceText.match(/^[^\d]+/); // Matches non-digit characters at the start
    const currency = currencyMatch ? currencyMatch[0].trim() : null;

    // Debugging output
    console.log("Original Price Text:", originalPriceText);
    console.log("Discounted Price Text:", discountedPriceText);
    console.log("Discount Text:", discountText);
    console.log("Is Discounted:", isDiscounted);

    // Future Consideration: Always save prices with an associated ISO 4217 currency code.
    console.log("Extracted Currency:", currency);

    // Parse prices and discounts
    const originalPrice =
      parseFloat(originalPriceText.replace(/[^\d.]/g, "")) ||
      priceData.original_price;
    const discountedPrice =
      parseFloat(discountedPriceText.replace(/[^\d.]/g, "")) || originalPrice;
    const discount = discountText
      ? parseFloat(discountText.replace("-", "").replace("%", ""))
      : 0;

    // Format the updated_at to match the database format (remove 'Z' or adjust to your DB)
    const updatedAt = new Date().toISOString().replace("Z", ""); // Remove 'Z' if needed

    // Return the updated price data
    return {
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount,
      updated_at: updatedAt, // Use formatted datetime
    };
  } catch (error) {
    console.error(
      `Failed to update price for Steam URL: ${priceData.url}`,
      error
    );
    throw error;
  }
};
