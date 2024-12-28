import axios from "axios";
import fuzzy from "fuzzy";
import fs from "fs";

const formatPriceFields = (price) => ({
  ...price,
  original_price: parseFloat(price.original_price),
  discount: parseFloat(price.discount),
  discounted_price: parseFloat(price.discounted_price),
});

// ERROR: "url": "https://store.steampowered.com/app/362003/Grand_Theft_Auto_V",
// The Steam ID is incorrect, it should be this URL: https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/, debug the fuzzy filter?
// https://partner.steamgames.com/doc/webapi/isteamapps
const getSteamAppId = async (gameTitle) => {
  try {
    // Fetch the list of all games from Steam's API
    const response = await axios.get(
      "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
      //   "http://api.steampowered.com/ISteamApps/GetAppList/v0002/"
    );
    const appList = response.data.applist.apps;

    // Save appList to a log file
    const logData = JSON.stringify(appList, null, 2); // JSON format with indentation for readability
    fs.writeFileSync("Steam_Games.json", logData); // Save to "Steam_Games.json"

    // Step 1: Use fuzzy matching to find the closest match for the game title
    const gameNames = appList.map((app) => app.name);
    const matches = fuzzy.filter(gameTitle, gameNames); // Fuzzy match the title with the list of game names

    // Debugging: log the matches and gameTitle
    console.log("Fuzzy matches for title:", gameTitle);
    console.log(matches); // verbose logging

    if (matches.length > 0) {
      // Step 2: Print the `appid` for each match
      matches.forEach((match) => {
        // Find the app for the current match
        const matchedApp = appList.find((app) => app.name === match.string);
        if (matchedApp) {
          console.log(`Match: "${match.string}", App ID: ${matchedApp.appid}`);
        }
      });

      // Now select the closest match and its appid
      const closestMatch = matches[0].string;

      // Debugging: log the closest match
      console.log("Closest match found:", closestMatch);

      const matchedApp = appList.find((app) => app.name === closestMatch);

      // Debugging: log the matched app
      console.log("Matched app details:", matchedApp);

      return matchedApp ? matchedApp.appid : null;
    } else {
      console.log("No fuzzy match found for:", gameTitle);
      return null; // No match found
    }
  } catch (error) {
    console.error("Error fetching Steam App ID:", error.message);
    return null; // Handle any errors gracefully
  }
};

export { formatPriceFields, getSteamAppId };
