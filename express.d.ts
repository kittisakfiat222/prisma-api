import { Request } from "express";

// Declare module to augment Express types
declare global {
  namespace Express {
    interface Request {
      user?: { 
        id: number;
        username: string;
        role: string;
      }; 
    }
  }
}