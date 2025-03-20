import "./GameDetailsWithPrices.scss";
const VITE_API_URL = import.meta.env.VITE_API_URL;
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import GamePriceList from "../../components/GamePriceList/GamePriceList";
import GameInfo from "../../components/GameInfo/GameInfo";

export default function GameDetailsWithPrices() {
  const { id } = useParams();
  let navigate = useNavigate();

  const [currentGame, setcurrentGame] = useState(null);
  const [priceList, setpriceList] = useState([]);
  const [isCreatingPrices, setIsCreatingPrices] = useState(false); // To show loading while creating prices

  async function getGame() {
    try {
      const response = await axios.get(`${VITE_API_URL}/games/${id}`);
      setcurrentGame(response.data);
    } catch (error) {
      if (error.status === 404) {
        navigate("/");
      }
      console.error(`Cannot fetch game with id ${id}: ${error}`);
    }
  }

  const getPricesforGame = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/games/${id}/prices`);
      setpriceList(response.data);
    } catch (error) {
      if (error.status === 404) {
        navigate("/");
      }
      console.error(`Cannot retrieve prices for game with id ${id}: ${error}`);
    }
  };
  // Function to create prices for the game
  const createPricesForGame = async () => {
    setIsCreatingPrices(true); // Show loading indicator
    try {
      const response = await axios.post(
        `${VITE_API_URL}/games/${id}/create-prices`
      );
      if (response.status === 201) {
        // After creating, fetch prices again to update the price list
        await getPricesforGame();
        console.log("Updated prices for game with id ${id");
      } else {
        // If the response is not successful, log the response status
        console.warn(
          `Failed to create prices for game with id ${id}. Status: ${response.status}`
        );
      }
    } catch (error) {
      // Log the error but don't throw it to prevent the app from crashing
      console.error(`Error creating prices for game with id ${id}:`, error);
    } finally {
      setIsCreatingPrices(false); // Hide loading indicator
    }
  };

  useEffect(() => {
    getGame();
    getPricesforGame();
  }, [id, isCreatingPrices]);

  useEffect(() => {
    console.log("Fetched game:", currentGame);
    console.log("Fetched prices:", priceList);
  }, [currentGame]);

  if (!currentGame) {
    return <div>Loading game details...</div>;
  }

  if (priceList === null) {
    return <div>Loading prices...</div>;
  }

  return (
    <div className="gameDetails__container">
      <div className="gameDetails__container--shadow">
        <GameInfo currentGame={currentGame} />
        <GamePriceList
          priceList={priceList}
          getPricesforGame={getPricesforGame}
        />
        {/* If no prices exist, display the "Create Prices" button */}
        {priceList.length === 0 && (
          <div className="create-prices__button">
            <button
              className="button button--primary button--center"
              onClick={createPricesForGame}
              disabled={isCreatingPrices}
            >
              {isCreatingPrices ? "Creating Prices..." : "Create Prices"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
