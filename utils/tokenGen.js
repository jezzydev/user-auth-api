import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            token_version: user.token_version,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "10m",
        },
    );
};

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        },
    );
};
