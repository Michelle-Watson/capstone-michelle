import "./Games.scss";
const VITE_API_URL = import.meta.env.VITE_API_URL;
import axios from "axios";
import { useState, useEffect } from "react";
import GameList from "../../components/GameList/GameList";
export default function Games() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const { data } = await axios.get(`${VITE_API_URL}/games`);
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
