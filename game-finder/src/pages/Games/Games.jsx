import "./Games.scss";
const VITE_API_URL = import.meta.env.VITE_API_URL;
import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to access the URL query parameters
import GameList from "../../components/GameList/GameList";

export default function Games() {
  const [games, setGames] = useState([]);
  const { search } = useLocation(); // Get the query string from the URL

  // Function to parse the query string into an object
  const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(search);
    return urlParams.get(param);
  };

  useEffect(() => {
    const query = getQueryParam("query"); // Get the query parameter "query"
    if (query) {
      console.log("query: ", query);
      fetchGames(query); // Fetch games based on the search term
    } else {
      fetchGames(); // Fetch all games if no search query is provided
    }
  }, [search]); // Re-run when the search query in the URL changes

  async function fetchGames(query) {
    try {
      const { data } = await axios.get(`${VITE_API_URL}/games`, {
        params: { query }, // Pass query as a parameter to the backend
      });
      setGames(data);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }

  // Log the fetched games after they have been set
  useEffect(() => {
    console.log("Fetched games:", games);
  }, [games]); // This effect will run whenever 'games' state is updated
  return (
    <>
      <GameList games={games} fetchGames={fetchGames} />
    </>
  );
}
