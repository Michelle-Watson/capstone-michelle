import fs from "fs";
// Humble Bundle website dynamically generates its content using JavaScript, which axios cannot execute.

// Since axios and cheerio cannot handle JavaScript execution, use Puppeteer to render the page fully before scraping it.
import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Apply stealth plugin
puppeteerExtra.use(StealthPlugin());

export const updateHumbleBundlePrice = async (priceData) => {
  try {
    let url = priceData.url;

    // Launch Puppeteer using puppeteer-extra
    const browser = await puppeteerExtra.launch({
      headless: true, // Set to false if you want to see the browser window for debugging
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("Launched Puppeteer with Stealth Plugin:");

    const page = await browser.newPage();

    // Set cookies before navigating
    const cookies = [
      {
        name: "hb_age_check",
        value: "25",
        domain: ".humblebundle.com",
      },
    ];
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setCookie(...cookies);

    // Navigate to the URL and wait for the page to load
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    console.log("Now on the page of:", url);

    // Take a screenshot to debug
    await page.screenshot({ path: "./humble-bundle-debug-screenshot.png" });
    const pageContent = await page.content();
    // Save the page content to verify if the right page is being scraped
    fs.writeFileSync("hb_store.html", pageContent);

    // Wait for the required element to load
    // games w/o discount will have .current-price
    // games w/ discount will have .current-price, .full-price and .js-discount-amount.discount-amount
    await page.waitForSelector(".current-price");

    // Initialize variables
    let originalPriceText = null;
    let discountedPriceText = null;
    let discountText = null;
    let gameDiscounted = false; // Default value when no discount exists

    // Check if the .full-price selector exists
    const fullPriceElement = await page.$(".full-price");

    // If .full-price exists, set gameDiscounted to true and extract the original price
    if (fullPriceElement) {
      gameDiscounted = true;

      originalPriceText = await page.$eval(".full-price", (el) =>
        el.textContent.trim()
      );
      // Ex) <span class="full-price">CA$51.99</span>

      // Try to extract the discount if it exists
      discountText = await page.$eval(
        ".js-discount-amount.discount-amount",
        (el) => el.textContent.trim()
      );
      // Ex) <div class="js-discount-amount discount-amount">    -20%<span class="off-text"> OFF</span>    </div>
    } else {
      // If .full-price doesn't exist, gameDiscounted is false
      gameDiscounted = false;
    }

    // Extract the discounted price text (this selector should always be present)
    discountedPriceText = await page.$eval(".current-price", (el) =>
      el.textContent.trim()
    );
    // Ex) <span class="current-price">CA$41.59</span>

    // Close the browser
    await browser.close();

    // If .full-price does not exist, set the full price to be the discounted price
    if (!originalPriceText) {
      originalPriceText = discountedPriceText;
      discountText = ""; // Set discount to 0
    }

    // Extract the currency from the originalPriceText
    const currencyMatch = originalPriceText.match(/^[^\d]+/); // Matches non-digit characters at the start
    const currency = currencyMatch ? currencyMatch[0].trim() : null;

    // Debugging
    console.log("Original Price Text:", originalPriceText);
    console.log("Discounted Price Text:", discountedPriceText);
    console.log("Discount Text:", discountText);
    console.log("Extracted Currency:", currency);
    console.log("Game Discounted:", gameDiscounted);

    // Parse prices and discounts
    const originalPrice =
      parseFloat(originalPriceText.replace(/[^\d.]/g, "")) ||
      priceData.original_price;
    const discountedPrice =
      parseFloat(discountedPriceText.replace(/[^\d.]/g, "")) || originalPrice;
    const discount = discountText
      ? parseFloat(discountText.replace("-", "").replace("%", ""))
      : 0;

    // Format the updated_at timestamp
    const updatedAt = new Date().toISOString().replace("Z", ""); // Adjust to match DB

    return {
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount,
      updated_at: updatedAt,
    };
  } catch (error) {
    console.error(
      `Failed to update price for Humble Bundle URL: ${url}`,
      error
    );
    throw error;
  }
};
