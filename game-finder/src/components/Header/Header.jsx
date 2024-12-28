import "./Header.scss";
import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import searchIcon from "/assets/icons/search-24px.svg";

export default function Header() {
  // Add search term to query IGDB
  const [searchTerm, setSearchTerm] = useState("");
  // const [filteredGames, setFilteredGames] = useState(games);

  // useEffect(() => {
  //   if (searchTerm) {
  //     const filtered = games.filter((game) =>
  //       [game.title, game.description, game.release_date]
  //         .join(" ")
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //     );
  //     setFilteredGames(filtered);
  //   } else {
  //     setFilteredGames(games);
  //   }
  // }, [games, searchTerm]);

  // const handleSearchChange = (event) => {
  //   event.preventDefault();
  //   setSearchTerm(event.target.value);
  // };

  return (
    <>
      <header className="nav">
        <nav className="nav__container">
          <div className="header">
            <Link to="/" className="nav__logo">
              GameFinder
            </Link>
            <div className="searchHeader">
              <form className="searchHeader__form">
                <input
                  type="text"
                  className="searchHeader__input"
                  placeholder="Search games..."
                  value={searchTerm}
                  // onChange={handleSearchChange}
                />
              </form>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
