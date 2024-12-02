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
exports.ManageUserById = exports.getUserbyID = exports.getUsersAll = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Get all users
const getUsersAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    res.json(users);
});
exports.getUsersAll = getUsersAll;
// Get user by ID
const getUserbyID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield prisma.user.findUnique({
        where: { id: Number(id) },
    });
    if (!user) {
        return res.status(404).json({
            status: "error",
            message: "User not found.",
        });
    }
    res.json(user);
});
exports.getUserbyID = getUserbyID;
// Update user
const ManageUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username, password, email, tel, role, fname, lname } = req.body;
    const hashedPassword = password ? yield bcryptjs_1.default.hash(password, 10) : undefined;
    const updatedUser = yield prisma.user.update({
        where: { id: Number(id) },
        data: {
            username,
            password: hashedPassword,
            email,
            tel,
            role,
            fname,
            lname,
        },
    });
    res.json(updatedUser);
});
exports.ManageUserById = ManageUserById;
