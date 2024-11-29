import { useParams, Link, useNavigate } from "react-router-dom";
import "./PriceForm.scss";
import { useEffect, useState } from "react";
import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function PriceForm() {
  //to redirect user to game list after submission
  const navigate = useNavigate();

  //Define an isEditMode Variable to check if the id parameter is present
  const { id } = useParams();
  const isEditMode = Boolean(id);
  console.log("isEditMode:", isEditMode);

  // State to store warehouses list
  const [games, setGames] = useState([]);

  // Field configurations for game and image sections
  const storeFields = [
    {
      label: "Game Title",
      name: "title",
      options: ["Cyberpunk 2077", "Noita"],
    },
    {
      label: "Store name",
      name: "platform_name",
      options: ["Steam", "Humble Bundle", "G2A", "Epic Games"],
    },
    { label: "URL to Store Page", name: "url" },
  ];

  const priceFields = [
    { label: "Original Price", name: "original_price", type: "number" },
    { label: "Discount (as a decimal)", name: "discount", type: "number" },
    { label: "Discounted Price", name: "discounted_price", type: "number" },
  ];

  // Form data and error state management
  const [formData, setFormData] = useState({
    title: "",
    platform_name: "",
    url: "",
    original_price: "",
    discount: "",
    discounted_price: "",
    game_id: "", // Add game_id here to store the ID from the name
  });

  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`${VITE_API_URL}/prices/${id}`)
        .then((response) => {
          const priceData = response.data;

          // Any extra proecssing

          //   setFormData(priceData);
          setFormData({
            title: priceData.title,
            platform_name: priceData.platform_name,
            url: priceData.url,
            original_price: priceData.original_price,
            discount: priceData.discount,
            discounted_price: priceData.discounted_price,
            game_id: priceData.game_id,
          });
          console.log("Fetched price data:", priceData);
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            navigate("/");
          } else {
            console.error("Error fetching price data:", error);
          }
        });
    }
  }, [isEditMode, id, games]);

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

  const [errors, setErrors] = useState({});

  // Handles field changes and removes error message on input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // MAY SCRAP -=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // If the 'warehouse' field changes, find the game_id by game title name
    if (name === "title") {
      const selectedTitle = warehouses.find((game) => game.title === value);

      // Ensure warehouse_id is set correctly
      setFormData((prev) => ({
        ...prev,
        game_id: selectedTitle ? selectedTitle.id : "", // this should be a number
      }));
    }
    // -=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  };

  // Helper function to validate the URL
  const isValidUrl = (url) => {
    const regex =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    return regex.test(url);
  };

  // Validates the form fields
  const validateFields = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Game Title is required.";
    }

    if (!formData.platform_name.trim()) {
      newErrors.description = "Store Name is required.";
    }

    if (!formData.url.trim()) {
      newErrors.release_date = "url to store page is required.";
    }

    // Only need 2/3 fields
    // original_price: "",
    // discount: "",
    // discounted_price: "",

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateFields()) {
      try {
        const response = isEditMode
          ? await axios.put(`${VITE_API_URL}/prices/${id}`, formData)
          : await axios.post(`${VITE_API_URL}/prices`, formData);
        if (response.status === 201 || response.status === 200) {
          setFormData({
            title: "",
            platform_name: "",
            url: "",
            original_price: "",
            discount: "",
            discounted_price: "",
            game_id: "",
          });
          navigate(`/games/${game_id}`); // Navigate to the details page of the game the price was updated/added for
        }
      } catch (error) {
        console.error(
          "Error adding/updating price to the server. Please try again later.",
          error
        );
      }
    }
  };

  return (
    <main className="game-management">
      <div className="game-form">
        {/* form header */}
        <form onSubmit={handleSubmit}>
          <legend className="game-form__header">
            <div className="game-form__header-container">
              <Link
                to={isEditMode ? `/prices/${id}` : "/prices"} // Conditionally navigate based on edit mode
                className="game-form__icon"
              >
                <img
                  src="/assets/icons/arrow_back-24px.svg"
                  alt="arrow back icon"
                  className="game-form__icon"
                />
              </Link>
              <h1 className="game-form__title">
                {isEditMode ? "Edit Price" : "Add New Price"}
              </h1>
            </div>
          </legend>

          <hr className="game-form__divider" />

          <div className="game-form__sections">
            {/* game details inputs */}
            <section className="game-form__game-details">
              <h2 className="game-form__section-title">Store Details</h2>
              {storeFields.map((field) => {
                // Choose field type
                let inputElement = null;

                // If the field is for description, render a textarea
                if (field.name === "description") {
                  inputElement = (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`input-control ${
                        errors[field.name]
                          ? "game-form__input-control--error"
                          : ""
                      }`}
                      placeholder={field.label}
                    />
                  );
                }

                // If the field is for release_date, render a text=date
                else if (field.name === "release_date") {
                  inputElement = (
                    <input
                      type="date"
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`input-control ${
                        errors[field.name]
                          ? "game-form__input-control--error"
                          : ""
                      }`}
                    />
                  );
                }
                // For other fields, render a normal text input
                else {
                  inputElement = (
                    <input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`input-control ${
                        errors[field.name]
                          ? "game-form__input-control--error"
                          : ""
                      }`}
                      placeholder={field.label}
                    />
                  );
                }
                return (
                  // Render apporpriate field for each game field
                  <div className="game-form__input-field" key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="game-form__input-label"
                    >
                      {field.label}
                    </label>
                    {inputElement}{" "}
                    {/* Render the corresponding input element based on conditions */}
                    {errors[field.name] && (
                      <span className="game-form__error-message">
                        <img
                          src="/assets/icons/error-24px.svg"
                          alt="error icon"
                          className="game-form__error-icon"
                        />
                        {errors[field.name]}
                      </span>
                    )}
                  </div>
                );
              })}
            </section>

            <hr className="game-form__divider game-form__divider--tablet" />

            {/* contact details inputs */}
            <section className="game-form__contact-details">
              <h2 className="game-form__section-title">Discount Details</h2>
              {priceFields.map((field) => (
                <div className="game-form__input-field" key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="game-form__input-label"
                  >
                    {field.label}
                  </label>
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`input-control ${
                      errors[field.name]
                        ? "game-form__input-control--error"
                        : ""
                    }`}
                    placeholder={`${field.label}`}
                  />
                  {errors[field.name] && (
                    <span className="game-form__error-message">
                      <img
                        src="/assets/icons/error-24px.svg"
                        alt="error icon"
                        className="game-form__error-icon"
                      />
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ))}
            </section>
          </div>
          {/* form actions/buttons */}
          <div className="game-form__actions">
            <div className="game-form__actions-container">
              <Link
                to={isEditMode ? `/games/${id}` : "/games"} // Conditionally navigate
                className="button button--secondary game-form__button--link"
              >
                Cancel
              </Link>

              <button type="submit" className="button button--primary">
                {isEditMode ? "Save" : "+ Add Game"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
