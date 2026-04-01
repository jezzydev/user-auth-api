import express from "express";
import helmet from "helmet";
import compression from "compression";
import authRoutes from "./routes/userAuth.js";
import userRoutes from "./routes/user.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./middleware/logger.js";
import { testConnection } from "./db/database.js";
import cookieParser from "cookie-parser";
import { authenticateToken } from "./middleware/authenticate.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

testConnection().catch((err) => {
    console.log("Failed connecting to the database.", err);
    process.exit(1);
});

app.use(
    cors({
        origin: process.env.BASE_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    }),
);
app.use(express.json());
app.use(logger);
app.use(cookieParser());
app.use(
    helmet({
        hsts: process.env.NODE_ENV === "production" ? undefined : false,
        contentSecurityPolicy:
            process.env.NODE_ENV === "production" ? undefined : false,
        // contentSecurityPolicy: {
        // directives: {
        //     ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        //     upgradeInsecureRequests: null, // remove this directive
        // }
    }),
);

app.use(compression());
app.use(express.static(path.join(__dirname, "public", "dist")));

//API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);

//404 for unknown API routes
app.use("/api", (req, res, next) => {
    res.status(404).json({ message: "Route not found." });
});

//catch-all for frontend routes - must be last before error handler
app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//always last
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
