"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = exports.authenticateJWT = exports.register = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
// Secret key for JWT (use env variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES_IN = "1h"; // Token expires in 1 hour
// Login Function
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                status: "error",
                message: "Username and password are required",
            });
        }
        // Find user by username
        const user = yield prisma.user.findFirst({
            where: { username },
        });
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid username or password",
            });
        }
        // Validate password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Invalid username or password",
            });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
// Register Function
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, fname, lname, email, tel, avatar, password } = req.body;
        const role = "User";
        // Validate input fields
        if (!username || !fname || !lname || !email || !tel || !password) {
            return res.status(400).json({
                status: "error",
                message: "All fields (username, fname, lname, email, tel, password) are required.",
            });
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid email format.",
            });
        }
        // Check if the username or email already exists
        const existingUser = yield prisma.user.findFirst({
            where: { OR: [{ username }, { email }] },
        });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "Username or email already taken.",
            });
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create the new user
        const newUser = yield prisma.user.create({
            data: {
                username,
                fname,
                lname,
                email,
                tel,
                avatar,
                password: hashedPassword, // Save the hashed password
                role,
            },
        });
        return res.status(201).json({
            status: "success",
            message: "User registered successfully.",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error.",
        });
    }
});
exports.register = register;
// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            status: "error",
            message: "Access denied. No token provided.",
        });
    }
    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Access denied. Token not found.",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded; // Attach the decoded token payload (user data) to `req.user`
        next();
    }
    catch (err) {
        return res.status(403).json({
            status: "error",
            message: "Invalid or expired token.",
        });
    }
};
exports.authenticateJWT = authenticateJWT;
// Middleware to authorize admin role
const authorizeAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        return res.status(403).json({
            status: "error",
            message: "Access denied. Insufficient permissions.",
        });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
