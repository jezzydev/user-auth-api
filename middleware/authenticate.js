import { AuthenticationError, AuthorizationError } from "../utils/errors.js";
import jwt from "jsonwebtoken";
import pool from "../db/database.js";

export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.get("Authorization")?.split(" ")[1];

        if (!token) {
            throw new AuthenticationError("Missing access token");
        }

        let user;
        try {
            user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            throw new AuthenticationError("Invalid or expired token");
        }

        const result = await pool.query(
            "SELECT token_version FROM users WHERE id = $1",
            [user.sub],
        );

        if (
            result.rows.length === 0 ||
            result.rows[0].token_version !== user.token_version
        ) {
            throw new AuthenticationError("Invalid token");
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export const adminOnly = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            throw new AuthorizationError("Access denied");
        }

        next();
    } catch (error) {
        next(error);
    }
};
