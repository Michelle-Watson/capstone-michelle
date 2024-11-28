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
  const [priceList, setpriceList] = useState(null);

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

  useEffect(() => {
    getGame();
    getPricesforGame();
  }, [id]);

  useEffect(() => {
    console.log("Fetched game:", currentGame);
    console.log("Fetched prices:", priceList);
  }, [currentGame]);

  if (!currentGame || !priceList) {
    return <div>Loading game and price details...</div>;
  }
  return (
    <div className="gameDetails__container">
      <h1>GameDetailsWithPrices Page</h1>
      <div className="gameDetails__container--shadow">
        <GameInfo currentGame={currentGame} />
        <GamePriceList
          priceList={priceList}
          getPricesforGame={getPricesforGame}
        />
      </div>
    </div>
  );
}
