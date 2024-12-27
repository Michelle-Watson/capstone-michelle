import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

// Apply stealth plugin
puppeteerExtra.use(StealthPlugin());

export const updateEpicGamesPrice = async (priceData) => {
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
        name: "birthtime",
        value: "568022401",
        domain: ".epicgames.com",
      },
      {
        name: "mature_content",
        value: "1", // Assuming '1' is the value to bypass age check
        domain: ".epicgames.com",
      },
    ];

    await page.setCookie(...cookies);

    console.log("Set cookies");

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    // Wait for the page to load completely
    await page.waitForSelector("body", { timeout: 5000 });

    // Take a screenshot to verify the page has loaded correctly
    await page.screenshot({ path: "./epic-debug.png" });

    // Get the page content
    const pageContent = await page.content();
    fs.writeFileSync("./epic_store.html", pageContent);

    // Initialize variables
    let originalPriceText = null;
    let discountedPriceText = null;
    let discountText = null;
    let gameDiscounted = false; // Default value when no discount exists

    // Check if the .full-price selector exists
    const fullPriceElement = await page.$(".css-4jky3p");
    // Ex) <div class="css-4jky3p">CA$79.99</div>

    // If .full-price exists, set gameDiscounted to true and extract the original price
    if (fullPriceElement) {
      gameDiscounted = true;

      originalPriceText = await page.$eval(".css-4jky3p", (el) =>
        el.textContent.trim()
      );
      // Ex) <div class="css-4jky3p">CA$79.99</div>

      // Try to extract the discount if it exists
      discountText = await page.$eval(".eds_1xxntt819", (el) =>
        el.textContent.trim()
      );
      // Ex) <span class="eds_1xxntt819">-55%</span>
    } else {
      // If .full-price doesn't exist, gameDiscounted is false
      gameDiscounted = false;
    }

    // Extract the discounted price text (this selector should always be present)
    discountedPriceText = await page.$eval("span.eds_1ypbntd0 b", (el) =>
      el.textContent.trim()
    );
    // Ex) <span class="eds_1ypbntd0 eds_1ypbntdb eds_1ypbntdk css-12s1vua"><b>CA$35.99</b></span>

    // Close the browser after scraping is done
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
      `Failed to update price for Epic Games URL: ${priceData.url}`,
      error
    );
    throw error;
  }
};
