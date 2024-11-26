import express from "express";
import cors from "cors";
import "dotenv/config";

import gameRoutes from "./routes/game-routes.js";
import priceRoutes from "./routes/price-routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/games", gameRoutes);

app.use("/prices", priceRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
