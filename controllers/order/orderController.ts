// File: controllers/ordersController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns-tz';
import { toZonedTime } from 'date-fns-tz';
import { authenticateJWT , isAdmin } from "../../middlewares/authenticateJWT";
const prisma = new PrismaClient();

// Create a new order


const timezone = 'Asia/Bangkok'; // โซนเวลาของไทย
export const createOrder = [
  authenticateJWT,
  async (req: Request, res: Response) => {
    const { items, id: userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No items provided.",
      });
    }

    try {
      const productIds = items.map((item: any) => item.id);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const insufficientStock = items.filter((item: any) => {
        const product = products.find((p) => p.id === item.id);
        return product && product.stock < item.quantity;
      });

      if (insufficientStock.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Insufficient stock for some items.",
          insufficientStock,
        });
      }

      const total = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      // แปลงเวลาเป็นโซนเวลาที่ต้องการก่อนบันทึกลงในฐานข้อมูล
      const currentDateTimeInTimeZone = toZonedTime(new Date(), timezone);

      const order = await prisma.order.create({
        data: {
          total,
          user: {
            connect: { id: parseInt(userId) },
          },
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          createdAt: currentDateTimeInTimeZone, // บันทึกเวลาในโซนเวลาที่ต้องการ
          updatedAt: currentDateTimeInTimeZone, // บันทึกเวลาในโซนเวลาที่ต้องการ
        },
        include: { items: true },
      });

      await Promise.all(
        items.map((item: any) =>
          prisma.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      // ส่งค่ากลับโดยไม่ต้องแปลงเวลา เพราะบันทึกไปแล้ว
      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "error",
        message: "Failed to create order.",
      });
    }
  },
];
// export const createOrder = [
//   authenticateJWT,
//   async (req: Request, res: Response) => {
//     const { items, id: userId } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "No items provided.",
//       });
//     }

//     try {
//       // ตรวจสอบว่า stock เพียงพอสำหรับสินค้าทั้งหมดใน order
//       const productIds = items.map((item: any) => item.id);
//       const products = await prisma.product.findMany({
//         where: { id: { in: productIds } },
//       });

//       const insufficientStock = items.filter((item: any) => {
//         const product = products.find((p) => p.id === item.id);
//         return product && product.stock < item.quantity;
//       });

//       if (insufficientStock.length > 0) {
//         return res.status(400).json({
//           status: "error",
//           message: "Insufficient stock for some items.",
//           insufficientStock,
//         });
//       }

//       // Calculate the total price of the order
//       const total = items.reduce(
//         (sum: number, item: any) => sum + item.price * item.quantity,
//         0
//       );

//       // Create an order with the associated items
//       const order = await prisma.order.create({
//         data: {
//           total,
//           user: {
//             connect: { id: parseInt(userId) },
//           },
//           items: {
//             create: items.map((item: any) => ({
//               productId: item.id,
//               quantity: item.quantity,
//               price: item.price,
//             })),
//           },
//         },
//         include: { items: true },
//       });

//       // Update product stock
//       await Promise.all(
//         items.map((item: any) =>
//           prisma.product.update({
//             where: { id: item.id },
//             data: { stock: { decrement: item.quantity } }, // ตัด stock ตามจำนวนที่ซื้อ
//           })
//         )
//       );

//       return res.status(201).json(order); // Return the created order with items
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         status: "error",
//         message: "Failed to create order.",
//       });
//     }
//   },
// ];

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