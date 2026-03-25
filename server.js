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

const app = express();
const PORT = process.env.PORT || 8000;

testConnection().catch((err) => {
    console.log("Failed connecting to the database.", err);
    process.exit(1);
});

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
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

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);

app.use("/", (req, res, next) => {
    res.status(404).json({ message: "Route not found." });
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
