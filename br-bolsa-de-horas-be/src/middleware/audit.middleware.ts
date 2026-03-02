import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware global de contexto de auditoría.
 * Decodifica el JWT (sin verificar — Keycloak ya lo validó en jwt.middleware)
 * y expone req.auditUser con el keycloak_user_id y email del usuario.
 */
export const auditContext = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    const decoded = jwt.decode(token) as {
      sub?: string;
      email?: string;
    } | null;

    if (decoded) {
      req.auditUser = {
        keycloak_user_id: decoded.sub ?? "",
        email: decoded.email ?? "",
      };
    }
  }

  next();
};
