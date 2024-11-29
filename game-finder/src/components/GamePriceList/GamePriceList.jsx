import "./GamePriceList.scss";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function GamePriceList({ priceList, getPricesforGame }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredpriceList, setFilteredpriceList] = useState(priceList);

  useEffect(() => {
    const filtered = priceList.filter((price) =>
      [price.platform_name, price.discount, price.discounted_price]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    const sortedFiltered = [...filtered].sort(
      (a, b) => a.discounted_price - b.discounted_price
    );
    setFilteredpriceList(sortedFiltered);
  }, [priceList, searchTerm]);

  const handleSearchChange = (event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  };

  const placeholderImageUrl =
    "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg";

  return (
    <div className="main-container">
      <div className="gameList">
        <div className="header">
          <h1 className="title">List of Prices</h1>
          <div className="searchHeader">
            <form className="searchHeader__form">
              <input
                type="text"
                className="searchHeader__input"
                placeholder="Search platforms..."
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
              <th>Platform</th>
              <th>Discount</th>
              <th>Discounted Price</th>
              <th>Original Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredpriceList.map((price) => (
              <tr key={price.id}>
                <td>
                  <Link
                    to={price.url}
                    target="_blank"
                    className="gameList__link"
                  >
                    <img
                      src={`/assets/icons/${price.platform_name.toLowerCase()}.svg`}
                      alt={price.platform_name}
                      className="logoArt"
                    />
                    {/* 
                  <img
                    src={placeholderImageUrl}
                    alt={price.platform_name}
                    className="logoArt"
                  />
                  <img
                    src={`/assets/icons/${price.platform_name.toLowerCase()}.svg`}
                    alt={price.platform_name}
                    className="logoArt"
                  /> */}
                  </Link>
                </td>
                <td>{price.platform_name}</td>
                <td className={price.discount > 50 ? "high-discount" : ""}>
                  - {Math.round(price.discount)}%
                </td>
                <td>{price.discounted_price}</td>
                <td>{price.original_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
