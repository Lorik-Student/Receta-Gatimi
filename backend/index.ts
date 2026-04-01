import express from "express"
import type { Request, Response, Application } from "express"
import db from "./config/db.js"
import 'dotenv/config'

const HOSTNAME = process.env.HOST;
const PORT = Number(process.env.PORT);
const app: Application = express();
app.use(express.json())

app.get('/', async (req: Request, res: Response) => {
  console.log(`"/" fetched`);
  res.send("Server is running");
});

app.get('/test_db', async (req: Request, res: Response) => {
  try {
    const con = await db.getConnection();
    console.log("Successful connection to database");
    con.release();

    res.json({ message: "DB connection successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

export default app;