import express from "express"
import type { Application } from "express"
import 'dotenv/config'

import routes from "./routes/index.js";

const HOSTNAME = process.env.HOST || 'localhost'; //nese process.env.HOST nuk definohet, shkon default ne localhost
const PORT = Number(process.env.PORT) || 5000;  //nese process.env.PORT nuk definohet, shkon default ne 5000
const app: Application = express();

app.use(express.json())
app.use("/api", routes);


app.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

export default app;