import { Request, Response, NextFunction } from "express";
import Keycloak from "keycloak-connect";
import session from "express-session";

// Configuración de sesión para Keycloak
export const sessionConfig = session({
  secret:
    process.env.SESSION_SECRET || "bolsa-horas-secret-change-in-production",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

// Inicializar Keycloak
const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || "bolsa-horas",
  "auth-server-url": process.env.KEYCLOAK_URL || "http://localhost:8080",
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT_ID || "bolsa-horas-backend",
  "bearer-only": true,
  "confidential-port": 0,
};

export const keycloak = new Keycloak({}, keycloakConfig);

// Middleware para proteger rutas
export const protect = keycloak.protect();

// Middleware para extraer información del usuario del token
export const extractUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const grant = (req as any).kauth?.grant;

    if (grant && grant.access_token) {
      const token = grant.access_token;
      const content = token.content;

      // Extraer información del usuario
      (req as any).user = {
        id: content.sub,
        email: content.email,
        username: content.preferred_username,
        roles: content.realm_access?.roles || [],
        name: content.name,
      };

      console.log("✓ Usuario autenticado:", {
        username: (req as any).user.username,
        roles: (req as any).user.roles,
      });
    } else {
      console.log("✗ No se encontró token en la petición");
    }

    next();
  } catch (error) {
    console.error("Error extracting user from token:", error);
    next();
  }
};
