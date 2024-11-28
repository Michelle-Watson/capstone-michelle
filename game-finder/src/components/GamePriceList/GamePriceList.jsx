import "./GamePriceList.scss";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
export default function GamePriceList({ priceList, getPricesforGame }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredpriceList, setFilteredpriceList] = useState(priceList);

  useEffect(() => {
    if (searchTerm) {
      const filtered = priceList.filter((price) =>
        [price.platform_name, price.discount, price.discounted_price]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredpriceList(filtered);
    } else {
      setFilteredpriceList(priceList);
    }
  }, [priceList, searchTerm]);

  const handleSearchChange = (event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  };

  const placeholderImageUrl =
    "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/469600/capsule_231x87.jpg?t=1732210582"; // Placeholder image URL

  return (
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
                <Link to={`/games/${price.id}`} className="gameList__link">
                  <img
                    src={placeholderImageUrl}
                    alt={price.title}
                    className="gameArt"
                  />
                </Link>
              </td>
              <td>{price.platform_name}</td>
              <td>{price.discount}</td>
              <td>{price.discounted_price}</td>
              <td>{price.original_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
