import express from "express";
import { dbconnect } from "./database/dbconnect.js";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import route from './Routes/Autorouter.cjs';

const app = express();

dotenv.config({ path: "./config/config.env" });
dbconnect();
// app.use('/auth', AuthRouter);

app.use('/auth', route);
app.use(bodyParser.json());
app.use(cors());

export default app;
