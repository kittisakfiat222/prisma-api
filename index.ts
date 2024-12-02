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




app.use(cors())

app.use(express.json());

app.get("/users" , getUsersAll);
app.get("/users/:id" , getUserbyID)

app.post("/login", login);
app.post("/register" , register);

app.get("/isAdmin", authenticateJWT, isAdmin);

app.get("/check-s", authenticateJWT, checkAdmin);

app.put("/manageuser/:id", ManageUserById);
app.delete("/manageuser/:id", DeleteUserById);

app.get('/allpd',getAllProducts);
app.post('/checkout' , createOrder)
app.get('/orders', getOrders); 


app.get('/products', productController.getAllProducts);
app.get('/products/:id', productController.getProductById);
app.post('/products', productController.createProduct);
app.put('/products/:id', productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);

app.get('/reports/summary',getSalesSummary);
app.get('/reports/top-products',getTopProducts);
app.get('/reports/top-categories', getTopCategories);

// Category routes
app.get('/categoriesPD', productController.getAllCategories);
app.post('/categoriesPD', productController.createCategory);


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



// app.post("/login", login);
// app.post("/register" , register)

// app.get('/users', getUsersAll)
// app.get('/users/:userId', getUserbyID)
// app.post('/manageuser',ManageUserById)
 




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// app.listen(5001, function () {
//   console.log('CORS-enabled web server listening on port 80')
// })

// app.use("/auth", authRoutes);
// app.use("/users", userRoutes);

// // Error handler
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//     console.error(err.stack);
//     res.status(500).json({
//         status: "error",
//         message: "Internal server error",
//     });
// });

// // Start Server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });