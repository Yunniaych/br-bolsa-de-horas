import { Request, Response, NextFunction } from "express";

/**
 * Middleware global de manejo de errores
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Error:", err);

  // Error de Prisma
  if (err.code && err.code.startsWith("P")) {
    return res.status(400).json({
      error: "Database Error",
      message: "Error en la operación de base de datos",
      code: err.code,
    });
  }

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message,
    });
  }

  // Error de Keycloak
  if (err.message && err.message.includes("Access denied")) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Acceso denegado",
    });
  }

  // Error genérico
  return res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Ha ocurrido un error inesperado",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Ruta ${req.method} ${req.path} no encontrada`,
  });
};
