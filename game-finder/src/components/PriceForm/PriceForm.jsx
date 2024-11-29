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
  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`${VITE_API_URL}/games/${id}`)
        .then((response) => {
          const gameData = response.data;

          // Format the release_date if it exists
          if (gameData.release_date) {
            // Convert to yyyy-MM-dd format
            const releaseDate = new Date(gameData.release_date)
              .toISOString()
              .split("T")[0];
            gameData.release_date = releaseDate;
          }

          setFormData(gameData);
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            navigate("/");
          } else {
            console.error("Error fetching game data:", error);
          }
        });
    }
  }, [isEditMode, id]);

  // Field configurations for game and image sections
  const gameFields = [
    { label: "Game Title", name: "title" },
    { label: "Description", name: "description" },
    { label: "Release Date", name: "release_date" },
  ];

  const imageFields = [
    { label: "Image URL (small)", name: "imageurlSmall" },
    { label: "Image URL (big)", name: "imageurlBig" },
  ];

  // Form data and error state management
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    release_date: "",
    imageurlSmall: "",
    imageurlBig: "",
  });

  const [errors, setErrors] = useState({});

  // Handles field changes and removes error message on input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (!formData.release_date.trim()) {
      newErrors.release_date = "Release Date is required.";
    }

    if (!isValidUrl(formData.imageurlSmall)) {
      newErrors.imageurlSmall = "Small image URL is required.";
    }

    if (!isValidUrl(formData.imageurlBig)) {
      newErrors.imageurlBig = "BIG image URL is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateFields()) {
      try {
        const response = isEditMode
          ? await axios.put(`${VITE_API_URL}/games/${id}`, formData)
          : await axios.post(`${VITE_API_URL}/games`, formData);
        if (response.status === 201 || response.status === 200) {
          setFormData({
            title: "",
            description: "",
            release_date: "",
            imageurlSmall: "",
            imageurlBig: "",
          });
          // Redirect to the item details page after saving the item in edit mode
          if (isEditMode) {
            navigate(`/games/${id}`); // Navigate to the details page of the edited game
          } else {
            navigate("/games"); // Navigate to games list if it's a new game
          }
        }
      } catch (error) {
        console.error(
          "Error connecting to the server. Please try again later.",
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
                to={isEditMode ? `/games/${id}` : "/games"} // Conditionally navigate based on edit mode
                className="game-form__icon"
              >
                <img
                  src="/assets/icons/arrow_back-24px.svg"
                  alt="arrow back icon"
                  className="game-form__icon"
                />
              </Link>
              <h1 className="game-form__title">
                {isEditMode ? "Edit Game" : "Add New Game"}
              </h1>
            </div>
          </legend>

          <hr className="game-form__divider" />

          <div className="game-form__sections">
            {/* game details inputs */}
            <section className="game-form__game-details">
              <h2 className="game-form__section-title">Game Details</h2>
              {gameFields.map((field) => {
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
              <h2 className="game-form__section-title">Image Details</h2>
              {imageFields.map((field) => (
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
