import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT , isAdmin } from "../middlewares/authenticateJWT";
const prisma = new PrismaClient();

// Get daily, monthly, and all-time sales summaries
export const getSalesSummary = [
    authenticateJWT,  async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Daily summary
    const dailySummary = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    // Monthly summary
    const monthlySummary = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    // All-time summary
    const allTimeSummary = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    res.status(200).json({
      daily: {
        totalSales: dailySummary._sum.total || 0,
        orderCount: dailySummary._count.id || 0,
      },
      monthly: {
        totalSales: monthlySummary._sum.total || 0,
        orderCount: monthlySummary._count.id || 0,
      },
      allTime: {
        totalSales: allTimeSummary._sum.total || 0,
        orderCount: allTimeSummary._count.id || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sales summary" });
  }
}];

// Get most-sold products
export const getTopProducts = [
    authenticateJWT,  async (req: Request, res: Response) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const products = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          product,
          totalQuantity: item._sum.quantity,
          totalSales: item._sum.price,
        };
      })
    );

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching top products" });
  }
}];

// Get most-sold categories
export const getTopCategories = [
    authenticateJWT, async (req: Request, res: Response) => {
  try {
    const topCategories = await prisma.$queryRaw`
      SELECT c.id, c.name, SUM(oi.quantity) AS totalQuantity, SUM(oi.price) AS totalSales
      FROM Category c
      INNER JOIN Product p ON c.id = p.categoryId
      INNER JOIN OrderItem oi ON p.id = oi.productId
      GROUP BY c.id, c.name
      ORDER BY totalQuantity DESC
      LIMIT 10;
    `;

    res.status(200).json(topCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching top categories" });
  }
}];
