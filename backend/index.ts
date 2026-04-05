import express from "express"
import type { Application } from "express"
import 'dotenv/config'
import router from "./routes/index.js";

const HOSTNAME = process.env.HOST;
const PORT = Number(process.env.PORT);
const app: Application = express();

app.use(express.json())
app.use(router);


app.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

export default app;