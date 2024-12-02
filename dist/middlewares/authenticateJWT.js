"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const authenticateJWT = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Expect "Bearer <token>"
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Access denied. No token provided.",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user data to the request object
        next();
    }
    catch (err) {
        res.status(403).json({
            status: "error",
            message: "Invalid or expired token.",
        });
    }
};
exports.authenticateJWT = authenticateJWT;
