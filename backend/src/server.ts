import express from "express"
import type { Application } from "express"
import 'dotenv/config'

import routes from "./index.js";
import { errorHandler, notFoundHandler } from "./common/middleware/error-handler.middleware.js";

const HOSTNAME = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 5000;
const app: Application = express();

app.use(express.json())
app.use("/api", routes);
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use(notFoundHandler);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

export default app;