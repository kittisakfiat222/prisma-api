import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT , isAdmin } from "../../middlewares/authenticateJWT";
const prisma = new PrismaClient();

// GET /products - Get all products
export const getAllProducts = [
  authenticateJWT, async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true, // Include category details if needed
      },
    });
    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products.',
    });
  }
}
];

// GET /products/:id - Get a product by ID
export const getProductById = [
  authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true, // Include category details if needed
      },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: `Product with ID ${id} not found.`,
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product.',
    });
  }
}];

// POST /products - Create a new product
export const createProduct = [
  authenticateJWT, async (req: Request, res: Response) => {
  const { name, description, price, stock, barcode, categoryId } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        barcode,
        categoryId,
      },
    });
    return res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create product.',
    });
  }
}];

// PUT /products/:id - Update a product
export const updateProduct = [
  authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, barcode, categoryId } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price,
        stock,
        barcode,
        categoryId,
      },
    });
    return res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update product.',
    });
  }
}];

// DELETE /products/:id - Delete a product
export const deleteProduct = [
  authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const deletedProduct = await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({ message: `Product with ID ${id} deleted successfully.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete product.',
    });
  }
}];

// GET /categories - Get all categories
export const getAllCategories = [
  authenticateJWT, async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    return res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories.',
    });
  }
}];

// POST /categories - Create a new category
export const createCategory = [
  authenticateJWT, async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const newCategory = await prisma.category.create({
      data: { name },
    });
    return res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create category.',
    });
  }
}];

// Export the functions for use in your routes
export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
};
