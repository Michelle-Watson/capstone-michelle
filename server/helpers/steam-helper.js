import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

export const updateSteamPrice = async (priceData) => {
  try {
    // Fetch the page
    // const response = await axios.get(priceData.url);
    const url = priceData.url;

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

    // Scrape price details, website structure are comments below the code
    const originalPriceText = $(".discount_original_price")
      .first()
      .text()
      .trim();
    // Ex) <div class="discount_original_price">CDN$ 79.99</div>

    const discountedPriceText = $(".discount_final_price")
      .first()
      .text()
      .trim();
    // Ex) <div class="discount_final_price">CDN$ 35.99</div>

    const discountText = $(".discount_pct").first().text().trim();
    // Ex) <div class="discount_pct">-55%</div>

    // Extract the currency from the originalPriceText
    const currencyMatch = originalPriceText.match(/^[^\d]+/); // Matches non-digit characters at the start
    const currency = currencyMatch ? currencyMatch[0].trim() : null;

    // Debugging
    console.log("First originalPriceText:", originalPriceText);
    console.log("First discountedPriceText:", discountedPriceText);
    console.log("First discountText:", discountText);

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
