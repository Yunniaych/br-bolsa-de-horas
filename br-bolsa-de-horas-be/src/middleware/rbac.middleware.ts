import { Request, Response, NextFunction } from "express";

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        roles: string[];
        name: string;
      };
    }
  }
}

/**
 * Middleware para verificar que el usuario tiene al menos uno de los roles requeridos
 * @param roles - Array de roles permitidos
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("Verificando roles requeridos:", roles);

    if (!req.user) {
      console.log("✗ No hay usuario en la petición");
      return res.status(401).json({
        error: "Unauthorized",
        message: "No se encontró información de usuario",
      });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some((role) => userRoles.includes(role));

    console.log("Roles del usuario:", userRoles);
    console.log("¿Tiene rol requerido?", hasRequiredRole);

    if (!hasRequiredRole) {
      console.log("✗ Acceso denegado - rol insuficiente");
      return res.status(403).json({
        error: "Forbidden",
        message: `Se requiere uno de los siguientes roles: ${roles.join(", ")}`,
        userRoles: userRoles,
      });
    }

    console.log("✓ Acceso permitido");
    return next();
  };
};

/**
 * Middleware para verificar que el usuario tiene el rol de administrador
 */
export const requireAdmin = requireRole(["admin"]);

/**
 * Middleware para verificar que el usuario está autenticado (admin o user)
 */
export const requireAuth = requireRole(["admin", "user"]);
