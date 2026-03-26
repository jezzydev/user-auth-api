import express from "express";
const router = express.Router();
import {
    isValidUser,
    isValidEmail,
    isValidPassword,
} from "../utils/userValidation.js";
import bcrypt from "bcrypt";
import pool from "../db/database.js";
import { AuthenticationError, AuthorizationError } from "../utils/errors.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
//import { RedisStore } = from 'rate-limit-redis'; //need to install pkg
import {
    generateAccessToken,
    generateRefreshToken,
} from "../utils/tokenGen.js";
import { authenticateToken } from "../middleware/authenticate.js";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 30, //TODO: change to 3
    keyGenerator: (req) =>
        req.body.email?.toLowerCase().trim() || ipKeyGenerator(req),
    message: "Too many login attempts. Please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // store: new RedisStore({ client: redisClient }), //if using RedisStore
});

const REFRESH_PATH = "/api/auth/refresh";

const cookieSettings = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //use 'strict' for same orgiin
    path: REFRESH_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieSettings = {
    httpOnly: true,
    path: REFRESH_PATH,
};

//Create a new user
router.post("/register", async (req, res, next) => {
    try {
        isValidUser(req.body);

        //Increase salt round to 12-14 in production for better security.
        const hash = await bcrypt.hash(req.body.password, 10);
        const query =
            "INSERT INTO users (email, password_hash, name, bdate, role) VALUES ($1, $2, $3, $4, $5) returning email, created_at";
        const result = await pool.query(query, [
            req.body.email,
            hash,
            req.body.name,
            req.body.bdate,
            "user", //role is user by default
        ]);

        res.status(201).json({
            message: "New user created.",
            user: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
});

//Find user by email
//Limit login attempts to protect against brute-force attacks where bots repeatedly guess username and passwords.
router.post("/login", limiter, async (req, res, next) => {
    try {
        isValidEmail(req.body.email);
        isValidPassword(req.body.password);

        const query =
            "SELECT id, email, password_hash, token_version, role FROM users WHERE email = $1";
        const result = await pool.query(query, [req.body.email]);

        if (result.rows.length === 0) {
            throw new AuthenticationError("Invalid email or password.");
        }

        const passwordMatched = await bcrypt.compare(
            req.body.password,
            result.rows[0].password_hash,
        );

        if (!passwordMatched) {
            throw new AuthenticationError("Invalid email or password.");
        }

        const user = {
            id: result.rows[0].id,
            email: result.rows[0].email,
            role: result.rows[0].role,
        };

        const newRefreshToken = generateRefreshToken(user);
        const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");
        const expirationDate = new Date(jwt.decode(newRefreshToken).exp * 1000);
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(
                "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
                [user.id, newRefreshTokenHash, expirationDate],
            );

            const updateVersionResult = await client.query(
                "UPDATE users SET token_version = token_version + 1 WHERE id = $1 returning token_version",
                [user.id],
            );
            await client.query("COMMIT");

            user.token_version = updateVersionResult.rows[0].token_version;
            const accessToken = generateAccessToken(user);

            res.cookie("refreshToken", newRefreshToken, cookieSettings);

            return res.json({
                message: "Login successful.",
                access_token: accessToken,
            });
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            await client.release();
        }
    } catch (error) {
        next(error);
    }
});

//Refresh token
router.post("/refresh", async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new AuthenticationError("Missing refresh token");
        }

        let user;

        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
            );
            user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            };
        } catch (error) {
            throw new AuthorizationError("Invalid or expired token");
        }

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");
        const getRefreshTokenResults = await pool.query(
            "SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2",
            [user.id, refreshTokenHash],
        );

        //Refresh token doesn't exist or already revoked; Potential theft. Revoke all active refresh tokens of the user.
        if (
            getRefreshTokenResults.rows.length === 0 ||
            getRefreshTokenResults.rows[0].revoked_at
        ) {
            await revokeAllUserTokens(user.id);
            res.clearCookie("refreshToken", clearCookieSettings);
            throw new AuthenticationError("Invalid token");
        }

        const newRefreshToken = generateRefreshToken(user);
        const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");
        const expirationDate = new Date(jwt.decode(newRefreshToken).exp * 1000);
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(
                "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
                [user.id, newRefreshTokenHash, expirationDate],
            );
            await client.query(
                `UPDATE refresh_tokens 
                SET revoked_at = $1
                WHERE user_id = $2 AND token_hash = $3`,
                [new Date(), user.id, refreshTokenHash],
            );
            const updateVersionResult = await client.query(
                `UPDATE users SET token_version = token_version + 1 WHERE id = $1 returning token_version`,
                [user.id],
            );
            await client.query("COMMIT");

            user.token_version = updateVersionResult.rows[0].token_version;
            const accessToken = generateAccessToken(user);

            res.cookie("refreshToken", newRefreshToken, cookieSettings);

            return res.json({
                message: "Refresh token generated",
                access_token: accessToken,
            });
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            await client.release();
        }
    } catch (error) {
        next(error);
    }
});

//Logout
router.post("/logout", authenticateToken, async (req, res, next) => {
    try {
        await revokeAllUserTokens(req.user.sub);
        res.clearCookie("refreshToken", clearCookieSettings);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

//Change password
router.post("/change-password", authenticateToken, async (req, res, next) => {
    try {
        isValidEmail(req.body.email);
        isValidPassword(req.body.password, true);
        isValidPassword(req.body.oldPassword);

        const query =
            "SELECT id, email, password_hash FROM users WHERE id = $1";
        const result = await pool.query(query, [req.user.sub]);

        if (result.rows.length !== 0) {
            const passwordMatched = await bcrypt.compare(
                req.body.oldPassword,
                result.rows[0].password_hash,
            );

            if (passwordMatched) {
                const hash = await bcrypt.hash(req.body.password, 10);
                const queryUpdatePwd =
                    "UPDATE users SET password_hash = $1 WHERE id = $2";
                await pool.query(queryUpdatePwd, [hash, req.user.sub]);
                await revokeAllUserTokens(req.user.sub);
                res.clearCookie("refreshToken", clearCookieSettings);
                return res.json({ message: "Password changed successfully." });
            }
        }

        throw new AuthenticationError(
            "Password change failed. Invalid email or password.",
        );
    } catch (error) {
        next(error);
    }
});

async function revokeAllUserTokens(userId) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query(
            "UPDATE refresh_tokens SET revoked_at = $1 WHERE user_id = $2 AND revoked_at IS NULL",
            [new Date(), userId],
        );
        await client.query(
            "UPDATE users SET token_version = token_version + 1 WHERE id = $1",
            [userId],
        );
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        await client.release();
    }
}

export default router;
