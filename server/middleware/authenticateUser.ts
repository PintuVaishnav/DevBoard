// server/middleware/authenticateUser.ts
import { Request, Response, NextFunction } from "express";

export function authenticateUser(req: any, _res: Response, next: NextFunction) {
  // Only mock user in development mode
  if (process.env.NODE_ENV === "development" && !req.user) {
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
