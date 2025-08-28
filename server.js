import express from "express";
import dotenv from "dotenv";
import routes from "./src/routes/index.js";
import { startSchedulers } from "./src/jobs/scheduler.js";
import cookieParser from "cookie-parser";
import zohoRoutes from "./src/routes/zohoRoutes.js";
import cors from "cors";
dotenv.config();

const app = express();

console.log(" process.env.CLIENT_URL", process.env.CLIENT_URL)
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); 
app.use(express.json());
app.use(cookieParser()); 

// Public API
app.use("/", routes);
app.use("/api/zoho-routes", zohoRoutes);



startSchedulers().catch((e) => console.error("Scheduler start error:", e.message));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
