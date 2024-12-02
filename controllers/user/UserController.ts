import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticateJWT , isAdmin } from "../../middlewares/authenticateJWT";

const prisma = new PrismaClient();

// Get all users
export const getUsersAll =   async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    return res.status(200).json({users : users});
};

// Get user by ID
export const getUserbyID =  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        
    });

    if (!user) {
        return res.status(404).json({
            status: "error",
            message: "User not found.",
        });
    }

    return res.status(200).json({ user  : user});
};

// Update user
export const ManageUserById = [
    authenticateJWT,  // Step 1: Authenticate JWT
    isAdmin,          // Step 2: Check if user is an admin
    async (req: Request, res: Response) => {
        const {id} = req.params;
        const { username, password, email, tel, role, fname, lname } = req.body;
  
      // Only hash password if it's provided
      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  
      try {
        const updatedUser = await prisma.user.update({
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
  
        return res.status(200).json(updatedUser);
      } catch (err) {
        return res.status(200).status(500).json({
          status: "error",
          message: "An error occurred while updating the user.",
        });
      }
    },
  ];

  export const DeleteUserById = [
    authenticateJWT,  // Step 1: Authenticate JWT
    isAdmin,          // Step 2: Check if user is an admin
    async (req: Request, res: Response) => {
      const { id } = req.params;
  
      try {
        // Delete the user by their ID
        const deletedUser = await prisma.user.delete({
          where: { id: Number(id) },
        });
  
        return res.status(200).json({
          status: "success",
          message: `User with ID ${id} has been deleted.`,
          deletedUser,
        });
      } catch (err) {
        return res.status(500).json({
          status: "error",
          message: "An error occurred while deleting the user.",
        });
      }
    },
  ];
