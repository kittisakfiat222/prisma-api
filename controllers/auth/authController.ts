import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// JWT secret and expiry time
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES_IN = "1h"; // Token expires in 1 hour

// Login Function
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      message: "Username and password are required",
    });
  }

  try {
    // Find user by username
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      // { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, fname, lname, email, tel, avatar, password } = req.body;

    // Validate input fields
    if (!username || !fname || !lname || !email || !tel || !password) {
      return res.status(400).json({
        status: "error",
        message: "All fields (username, fname, lname, email, tel, password) are required.",
      });
    }

    // Check if the username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Username or email already taken.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username,
        fname,
        lname,
        email,
        tel,
        avatar,
        password: hashedPassword, // Save the hashed password
        role: "User", // Default role for new users
      },
    });

    // Send response
    return res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        username: newUser.username,
        fname: newUser.fname,
        lname: newUser.lname,
        email: newUser.email,
        tel: newUser.tel,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};



