import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT Secret (use an environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Access denied. Token not found.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
    
    req.body.user = decoded; // Attach decoded user data to req.body instead of req.user
    next();
  } catch (err) {
    return res.status(403).json({
      status: "error",
      message: "Invalid or expired token.",
    });
  }
};


// New API to check if the logged-in user is an admin
export const checkAdmin = (req: Request, res: Response) => {
  // Check if the user role is present in the decoded token
  const role = req.body.user?.role;

  if (role === "Admin") {
    return res.status(200).json({
      message: "User is an admin.",
      role: role, // Display role

    });
  }

  return res.status(200).json({
    message: "User is not an admin.",
    role: role, // Display role

  });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Assuming the role is attached in the token as 'req.user.role'
  if (req.body.user?.role !== "Admin") {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }
  next();
};