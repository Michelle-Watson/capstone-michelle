import React, { useState, useEffect } from "react";
// personal styles
import "./GameList.scss";

// seperate bootstrap styles for the game list component using a module
import styles from "./GameList.module.scss";

// import "bootstrap/dist/css/bootstrap.min.css";

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
  return (
    <div className={styles.gameList}>
      <h1 className={styles.title}>List of Games</h1>
      <div className={styles.searchHeader}>
        <form className={styles.searchHeader__form}>
          <input
            type="text"
            className={styles.searchHeader__input}
            placeholder="Search games..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </form>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Release Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredGames.map((game) => (
            <tr key={game.id}>
              <td>{game.title}</td>
              <td>{new Date(game.release_date).toLocaleDateString()}</td>
              <td>{game.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
