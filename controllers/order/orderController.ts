// File: controllers/ordersController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT , isAdmin } from "../../middlewares/authenticateJWT";
const prisma = new PrismaClient();

// Create a new order
export const createOrder = [
    authenticateJWT, async (req: Request, res: Response) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No items provided.',
      });
    }

    try {
      // Calculate the total price of the order
      const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      const userId = req.body.id;
      // Create an order with the associated items
      const order = await prisma.order.create({
        data: {
          total, // Store the total in the order
          user: { // Provide the user object
            connect: { id: parseInt(userId)}, // Connect the user by id
          },
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,  
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      return res.status(201).json(order); // Return the created order with items
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create order.',
      });
    }
  }
];

export const getOrders = [
  authenticateJWT,  async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            fname: true,
            lname: true, // Include user details
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true, // Include product details in items
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Optional: sort orders by latest first
      },
    });

    return res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders.',
    });
  }
}
];