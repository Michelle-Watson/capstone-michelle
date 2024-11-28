import "./App.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Games from "./pages/Games/Games";
import GameDetailsWithPrices from "./pages/GameDetailsWithPrices/GameDetailsWithPrices";
import GameEdit from "./pages/GameEdit/GameEdit";
import GameAdd from "./pages/GameAdd/GameAdd";
import PricesEdit from "./pages/PricesEdit/PricesEdit";
import PricesAdd from "./pages/PricesAdd/PricesAdd";

// App component that uses BrowserRouter and Routes to render different pages based on the current URL path.
function App() {
  return (
    <BrowserRouter>
      {/* <h1>Header placeholder</h1> */}
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Games />} />
            <Route path="games" element={<Games />} />
            <Route path="games/:id" element={<GameDetailsWithPrices />} />
            <Route path="games/add" element={<GameAdd />} />
            <Route path="games/:id/edit" element={<GameEdit />} />
            <Route path="prices/add" element={<PricesAdd />} />
            <Route path="prices/:id/edit" element={<PricesEdit />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© GameFinder Inc. All Rights Reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
