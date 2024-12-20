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
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      // Step 1: คำนวณผลรวมของจำนวนสินค้าต่อ productId
      const topProducts = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 10,
      });

      // Step 2: คำนวณราคาสินค้ารวมจากการคูณ quantity * price จาก product
      const products = await Promise.all(
        topProducts.map(async (item) => {
          // ดึงข้อมูลราคาจากตาราง product
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          // ตรวจสอบให้มั่นใจว่า product ไม่เป็น null
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          // ป้องกันการคูณกับ quantity ที่เป็น null หรือ undefined
          const quantity = item._sum.quantity ?? 0;

          // คำนวณ totalSales โดยการคูณจำนวนสินค้าที่ขายกับราคาของสินค้านั้นๆ
          const totalSales = product.price * quantity;

          return {
            product,
            totalQuantity: quantity,
            totalSales: totalSales,
          };
        })
      );

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching top products" });
    }
  },
];
// export const getTopProducts = [
//   authenticateJWT,
//   async (req: Request, res: Response) => {
//     try {
//       // Step 1: รวมยอดขาย (quantity * price) ต่อตัว productId
//       const topProducts = await prisma.orderItem.groupBy({
//         by: ["productId"],
//         _sum: {
//           quantity: true, // รวมจำนวนสินค้า
//           price: true,    // รวมราคาสินค้า
//         },
//         orderBy: {
//           _sum: {
//             quantity: "desc", // เรียงตามจำนวนสินค้าขาย
//           },
//         },
//         take: 10,
//       });

//       // Step 2: คำนวณยอดขายรวมจากข้อมูล quantity และ price
//       const products = await Promise.all(
//         topProducts.map(async (item) => {
//           // ดึงข้อมูลสินค้า
//           const product = await prisma.orderItem.findUnique({
//             where: { id: item.productId },
//           });

//           // ตรวจสอบให้มั่นใจว่า product ไม่เป็น null
//           if (!product) {
//             throw new Error(`Product with ID ${item.productId} not found`);
//           }

//           // คำนวณ totalSales
//           const quantity = item._sum?.quantity ?? 0;
//           const pricePerUnit = item._sum?.price ?? 0;
//           const totalSales = item._sum?.price;

//           return {
//             product,
//             totalQuantity: quantity,
//             totalSales: totalSales,
//           };
//         })
//       );

//       res.status(200).json(products);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Error fetching top products" });
//     }
//   },
// ];



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
