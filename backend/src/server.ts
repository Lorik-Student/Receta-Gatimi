import express from "express"
import type { Application } from "express"
import 'dotenv/config'
import cors from "cors"

import routes from "./routes.js";
import { errorHandler } from "./common/middleware/error-handler.middleware.js";

const HOSTNAME = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const app: Application = express();

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));
app.use(express.json())
app.use("/api", routes);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

export default app;