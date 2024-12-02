"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Middleware to parse JSON bodies
var express = require('express');
var cors = require('cors');
var app = express();
const prisma = new client_1.PrismaClient();
// app.use(cors())
// app.use(express.json());
// app.post("/login", login);
// app.post("/register" , register)
// app.get('/users', getUsersAll)
// app.get('/users/:userId', getUserbyID)
// app.post('/manageuser',ManageUserById)
// app.listen(5001, function () {
//   console.log('CORS-enabled web server listening on port 80')
// })
app.use("/auth", authRoutes_1.default);
app.use("/users", userRoutes_1.default);
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: "error",
        message: "Internal server error",
    });
});
// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
