import "./Header.scss";
import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import searchIcon from "/assets/icons/search-24px.svg";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // useNavigate for programmatic navigation

  // Handle the input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle form submission (when pressing enter)
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission
    if (searchTerm.trim()) {
      navigate(`/games?query=${searchTerm}`); // Navigate to the games page with query
    }
  };

  return (
    <>
      <header className="nav">
        <nav className="nav__container">
          <div className="header">
            <Link to="/" className="nav__logo">
              GameFinder
            </Link>
            <div className="searchHeader">
              <form
                className="searchHeader__form"
                onSubmit={handleSearchSubmit}
              >
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
        </nav>
      </header>
    </>
  );
}
