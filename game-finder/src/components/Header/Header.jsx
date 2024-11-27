import "./Header.scss";
import { NavLink, Link } from "react-router-dom";
import searchIcon from "/assets/icons/search-24px.svg";

export default function Header() {
  return (
    <>
      <header className="nav">
        <nav className="nav__container">
          {/* Logo on the left */}
          <Link to="/" className="nav__logo">
            {/* <img
              src={searchIcon}
              alt="GameFinder Logo"
              className="nav__logo-img"
            /> */}
            GameFinder
          </Link>

          {/* Search bar on the right */}
          {/* <div className="search-header">
            <form className="search-header__form">
              <input
                className="search-header__input"
                type="search"
                placeholder="Search..."
              />
            </form>
          </div> */}
        </nav>
      </header>
    </>
  );
}
