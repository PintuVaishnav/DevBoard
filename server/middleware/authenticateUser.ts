// server/middleware/authenticateUser.ts
import { Request, Response, NextFunction } from "express";

export function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    req.user = {
      id: "test-user-id",
      firstName: "Dev",
      lastName: "Tester",
      email: "dev@test.com",
      role: "Developer",
    };
  }
  next();
}