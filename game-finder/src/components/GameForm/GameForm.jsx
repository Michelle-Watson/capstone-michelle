import { useParams, Link, useNavigate } from "react-router-dom";
import "./GameForm.scss";
import { useEffect, useState } from "react";
import axios from "axios";

const URL = import.meta.env.VITE_API_URL;

export default function GameForm() {
  //to redirect user to game list after submission
  const navigate = useNavigate();

  //Define an isEditMode Variable to check if the id parameter is present
  const { id } = useParams();
  const isEditMode = Boolean(id);
  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`${URL}/games/${id}`)
        .then((response) => setFormData(response.data))
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
          ? await axios.put(`${URL}/games/${id}`, formData)
          : await axios.post(`${URL}/games`, formData);
        if (response.status === 201 || response.status === 200) {
          setFormData({
            title: "",
            description: "",
            release_date: "",
            imageurlSmall: "",
            imageurlBig: "",
          });

          navigate(`/games/${id}`);
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
    <main className="warehouse-management">
      <div className="warehouse-form">
        {/* form header */}
        <form onSubmit={handleSubmit}>
          <legend className="warehouse-form__header">
            <div className="warehouse-form__header-container">
              <Link to={`/games/${id}`} className="warehouse-form__icon">
                <img
                  src="/assets/icons/arrow_back-24px.svg"
                  alt="arrow back icon"
                  className="warehouse-form__icon"
                />
              </Link>
              <h1 className="warehouse-form__title">
                {isEditMode ? "Edit Game" : "Add New Game"}
              </h1>
            </div>
          </legend>
          <hr className="warehouse-form__divider" />
          <div className="warehouse-form__sections">
            {/* warehouse details inputs */}
            <section className="warehouse-form__warehouse-details">
              <h2 className="warehouse-form__section-title">Game Details</h2>
              {gameFields.map((field) => (
                <div className="warehouse-form__input-field" key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="warehouse-form__input-label"
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
                        ? "warehouse-form__input-control--error"
                        : ""
                    }`}
                    placeholder={`${field.label}`}
                  />
                  {errors[field.name] && (
                    <span className="warehouse-form__error-message">
                      <img
                        src="/assets/icons/error-24px.svg"
                        alt="error icon"
                        className="warehouse-form__error-icon"
                      />
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ))}
            </section>

            <hr className="warehouse-form__divider warehouse-form__divider--tablet" />

            {/* contact details inputs */}
            <section className="warehouse-form__contact-details">
              <h2 className="warehouse-form__section-title">Image Details</h2>
              {imageFields.map((field) => (
                <div className="warehouse-form__input-field" key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="warehouse-form__input-label"
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
                        ? "warehouse-form__input-control--error"
                        : ""
                    }`}
                    placeholder={`${field.label}`}
                  />
                  {errors[field.name] && (
                    <span className="warehouse-form__error-message">
                      <img
                        src="/assets/icons/error-24px.svg"
                        alt="error icon"
                        className="warehouse-form__error-icon"
                      />
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ))}
            </section>
          </div>
          {/* form actions/buttons */}
          <div className="warehouse-form__actions">
            <div className="warehouse-form__actions-container">
              <Link
                to={`/games/${id}`}
                className="button button--secondary warehouse-form__button--link"
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
