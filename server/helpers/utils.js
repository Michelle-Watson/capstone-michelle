import axios from "axios";
import fuzzy from "fuzzy";

const formatPriceFields = (price) => ({
  ...price,
  original_price: parseFloat(price.original_price),
  discount: parseFloat(price.discount),
  discounted_price: parseFloat(price.discounted_price),
});

const getSteamAppId = async (gameTitle) => {
  try {
    // Fetch the list of all games from Steam's API
    const response = await axios.get(
      "http://api.steampowered.com/ISteamApps/GetAppList/v2/"
    );
    const appList = response.data.applist.apps;

    // Step 1: Use fuzzy matching to find the closest match for the game title
    const gameNames = appList.map((app) => app.name);
    const matches = fuzzy.filter(gameTitle, gameNames); // Fuzzy match the title with the list of game names

    if (matches.length > 0) {
      // Step 2: If we find matches, return the App ID of the closest match
      const closestMatch = matches[0].string;
      const matchedApp = appList.find((app) => app.name === closestMatch);
      return matchedApp ? matchedApp.appid : null;
    } else {
      return null; // No match found
    }
  } catch (error) {
    console.error("Error fetching Steam App ID:", error.message);
    return null; // Handle any errors gracefully
  }
};

export { formatPriceFields, getSteamAppId };
