import { Request , Response , NextFunction } from "express"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs';
import { login ,register } from "./controllers/auth/authController"; // Import the login function
import { getUsersAll , getUserbyID, ManageUserById, DeleteUserById } from "./controllers/user/UserController";
import { authenticateJWT , checkAdmin, isAdmin } from "./middlewares/authenticateJWT";
import productController, { getAllProducts } from "./controllers/product/productController";
import { createOrder, getOrders } from "./controllers/order/orderController";
import { getSalesSummary, getTopCategories, getTopProducts } from "./controllers/reportController";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "./controllers/categoryController";
import { createPaymentType, deletePaymentType, getAllPaymentTypes, updatePaymentType } from "./controllers/paymentTypeController";



var express = require('express')
var cors = require('cors')
var app = express()
const port = 5000;
const prisma = new PrismaClient()




// CORS middleware
app.use(cors({
  origin: process.env.SERVER_URL,  // Set allowed origin URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Body parser middleware
app.use(express.json());

// Routes
app.get("/users", getUsersAll);
app.get("/users/:id", getUserbyID);
app.post("/login", login);
app.post("/register", register);
app.get("/isAdmin", authenticateJWT, isAdmin);
app.get("/check-s", authenticateJWT, checkAdmin);
app.put("/manageuser/:id", ManageUserById);
app.delete("/manageuser/:id", DeleteUserById);

app.get('/products', productController.getAllProducts);  // Ensure productController methods are exported properly
app.post('/checkout', createOrder);
app.get('/orders', getOrders);

app.get('/reports/summary', getSalesSummary);
app.get('/reports/top-products', getTopProducts);
app.get('/reports/top-categories', getTopCategories);

// Category routes
app.get('/categories', getAllCategories);
app.post('/categories', createCategory);
app.put('/categories/:id', updateCategory);
app.delete('/categories/:id', deleteCategory);

// Payment Type routes
app.get('/payment-types', getAllPaymentTypes);
app.post('/payment-types', createPaymentType);
app.put('/payment-types/:id', updatePaymentType);
app.delete('/payment-types/:id', deletePaymentType);

// Example of a protected route
app.get("/protected", authenticateJWT, (req: Request, res: Response) => {
  res.status(200).json({ message: "You have access to this protected route!" });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});