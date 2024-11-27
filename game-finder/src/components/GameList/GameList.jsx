import React, { useState, useEffect } from "react";
import "./GameList.scss";

export default function GameList({ games, fetchGames }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGames, setFilteredGames] = useState(games);
  
  useEffect(() => {
    setFilteredGames(
      games.filter((game) =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [games, searchTerm]);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleFetchMoreGames = () => {
    fetchGames();
  };
}
