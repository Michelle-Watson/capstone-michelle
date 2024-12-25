import axios from "axios";
import * as cheerio from "cheerio";

export const updateSteamPrice = async (priceData) => {
  try {
    // Fetch the page
    const response = await axios.get(priceData.url);
    const html = response.data;

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Scrape price details (update selectors as necessary)
    const originalPriceText = $(".game_purchase_price").text().trim();
    const discountedPriceText = $(".discount_final_price").text().trim();
    const discountText = $(".discount_pct").text().trim();

    // Parse prices and discounts
    const originalPrice =
      parseFloat(originalPriceText.replace("$", "")) ||
      priceData.original_price;
    const discountedPrice =
      parseFloat(discountedPriceText.replace("$", "")) || originalPrice;
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
