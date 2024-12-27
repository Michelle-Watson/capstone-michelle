import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

export const updateG2APrice = async (priceData) => {
  try {
    console.log("before response");
    console.log("Fetching URL:", priceData.url);

    // Append the parameters to ensure it's in CDN (Canadian) currency
    let url = `${priceData.url}?___currency=CAD&___store=canada&___locale=en`;

    // Example) https://www.g2a.com/cyberpunk-2077-gogcom-key-global-i10000156543001?___currency=CAD&___store=canada&___locale=en

    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-CA,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    const html = response.data;

    // verify html is of the correct page
    fs.writeFileSync("./g2a_store.html", html);

    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    // Locate the game section containing the price
    const gameSection = $(
      ".sc-crzoAE.sc-dIsUp.inDMqh.dCzjOa.sc-ksluID.iNwvzq"
    ).first();

    // Initialize default values for price details
    let originalPriceText = "";
    let discountedPriceText = "";
    let discountText = "";
    let isDiscounted = false;

    // Extract the price from the game section
    originalPriceText = gameSection.text().trim();
    discountedPriceText = originalPriceText; // Since there's no clear discount, set both to the same value
    discountText = ""; // No discount, so leave as an empty string

    // Extract the currency from the originalPriceText
    const currencyMatch = originalPriceText.match(/^[^\d]+/); // Matches non-digit characters at the start
    const currency = currencyMatch ? currencyMatch[0].trim() : null;

    // Debugging output
    console.log("Original Price Text:", originalPriceText);
    console.log("Discounted Price Text:", discountedPriceText);
    console.log("Discount Text:", discountText);
    console.log("Extracted Currency:", currency);
    console.log("Is Discounted:", isDiscounted);

    // Parse prices
    const originalPrice =
      parseFloat(originalPriceText.replace(/[^\d.]/g, "")) ||
      priceData.original_price;
    const discountedPrice =
      parseFloat(discountedPriceText.replace(/[^\d.]/g, "")) || originalPrice;
    const discount = 0; // No discount

    // Format the updated_at timestamp
    const updatedAt = new Date().toISOString().replace("Z", ""); // Adjust to match DB format

    // Return the updated price data
    return {
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount,
      updated_at: updatedAt, // Use formatted datetime
    };
  } catch (error) {
    console.error(
      `Failed to update price for G2A URL: ${priceData.url}`,
      error
    );
    throw error;
  }
};
