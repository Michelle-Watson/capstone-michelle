import "./Header.scss";
import { NavLink, Link } from "react-router-dom";
import searchIcon from "/assets/icons/search-24px.svg";

export default function Header() {
  return (
    <>
      <header className="nav">
        <nav className="nav__container">
          <Link to="/" className="nav__logo">
            GameFinder
          </Link>
        </nav>
      </header>
    </>
  );
}
