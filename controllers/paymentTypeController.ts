import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT , isAdmin } from "../middlewares/authenticateJWT";
const prisma = new PrismaClient();

// Get all payment types
export const getAllPaymentTypes = [
    authenticateJWT,  async (req: Request, res: Response) => {
  try {
    const paymentTypes = await prisma.paymentType.findMany();
    return res.status(200).json({ status: 'success', data: paymentTypes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch payment types' });
  }
}];

// Create a new payment type
export const createPaymentType = [
    authenticateJWT,  async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Payment type name is required' });
  }

  try {
    const newPaymentType = await prisma.paymentType.create({ data: { name, description } });
    return res.status(201).json({ status: 'success', data: newPaymentType });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to create payment type' });
  }
}];

// Update a payment type
export const updatePaymentType = [
    authenticateJWT,  async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedPaymentType = await prisma.paymentType.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });
    return res.status(200).json({ status: 'success', data: updatedPaymentType });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to update payment type' });
  }
}];

// Delete a payment type
export const deletePaymentType = [
    authenticateJWT,  async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.paymentType.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ status: 'success', message: 'Payment type deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete payment type' });
  }
}];
