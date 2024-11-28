import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// separate bootstrap styles for the game list component using a module
// import styles from "./GameList.scss";
// personal styles
// import "./GameList2.scss";
import "./GameList.scss";
// import "bootstrap/dist/css/bootstrap.min.css";

export default function GameList({ games, fetchGames }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGames, setFilteredGames] = useState(games);

  useEffect(() => {
    if (searchTerm) {
      const filtered = games.filter((game) =>
        [game.title, game.description, game.release_date]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredGames(filtered);
    } else {
      setFilteredGames(games);
    }
  }, [games, searchTerm]);

  const handleSearchChange = (event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  };

  // Helper function to truncate the description to 100 characters
  const truncateDescription = (description) => {
    if (description && description.length > 100) {
      return description.slice(0, 100) + "...";
    }
    return description;
  };

  return (
    <div className="main-container">
      {/* Center the content */}
      <div className="gameList">
        <div className="header">
          <h1 className="title">List of Games</h1>
          <div className="searchHeader">
            <form className="searchHeader__form">
              <input
                type="text"
                className="searchHeader__input"
                placeholder="Search games..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </form>
          </div>
        </div>
        <table className="table table-sm">
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Release Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.map((game) => (
              <tr key={game.id}>
                <td>
                  <Link to={`/games/${game.id}`} className="gameList__link">
                    <img
                      src={game.imageurlSmall}
                      alt={game.title}
                      className="gameArt"
                    />
                  </Link>
                </td>
                <td>{game.title}</td>
                <td>{new Date(game.release_date).toLocaleDateString()}</td>
                <td>{truncateDescription(game.description)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
