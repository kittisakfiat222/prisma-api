import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT , isAdmin } from "../middlewares/authenticateJWT";
const prisma = new PrismaClient();

// Get all categories
export const getAllCategories = [
    authenticateJWT,  async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    return res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch categories' });
  }
}];

// Create a new category
export const createCategory = [
    authenticateJWT,  async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Category name is required' });
  }

  try {
    const newCategory = await prisma.category.create({ data: { name } });
    return res.status(201).json({ status: 'success', data: newCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to create category' });
  }
}];

// Update a category
export const updateCategory = [
    authenticateJWT,  async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    return res.status(200).json({ status: 'success', data: updatedCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to update category' });
  }
}];

// Delete a category
export const deleteCategory = [
    authenticateJWT,  async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete category' });
  }
}];
