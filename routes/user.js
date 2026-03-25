import express from "express";
import pool from "../db/database.js";
import { adminOnly } from "../middleware/authenticate.js";

const router = express.Router();

//Return all users
router.get("/", adminOnly, async (req, res, next) => {
    try {
        const query =
            "SELECT id, email, name, bdate, role, created_at FROM users ORDER BY created_at ASC";
        const result = await pool.query(query);

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

//Return user profile
router.get("/me", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, email, name, bdate, role, created_at FROM users WHERE id = $1",
            [req.user.sub],
        );

        res.json({ profile: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

export default router;
