import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Cliente JWKS para obtener las claves públicas de Keycloak
const keycloakUrl = process.env.KEYCLOAK_URL || "http://localhost:8080";
const keycloakRealm = process.env.KEYCLOAK_REALM || "bolsa-horas";

const client = jwksClient({
  jwksUri: `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 86400000, // 24 horas
});

// Función para obtener la clave pública
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(
    header.kid,
    (err: Error | null, key?: jwksClient.SigningKey) => {
      if (err) {
        callback(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    },
  );
}

// Middleware para validar el token JWT
export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Extraer el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("✗ No se encontró token Bearer en la petición");
      console.log("  Authorization header:", authHeader);
      res.status(401).json({
        error: "Unauthorized",
        message: "No se proporcionó token de autenticación",
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    console.log(
      "Token recibido (primeros 50 chars):",
      token.substring(0, 50) + "...",
    );
    console.log("Token length:", token.length);

    // Validar el token
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        // No validar issuer porque el frontend usa localhost:8080 y el backend usa keycloak:8080
        // issuer: `${keycloakUrl}/realms/${keycloakRealm}`,
      },
      (err: jwt.VerifyErrors | null, decoded: any): void => {
        if (err) {
          console.log("✗ Error validando token:", err.message);
          res.status(401).json({
            error: "Unauthorized",
            message: "Token inválido o expirado",
          });
          return;
        }

        // Extraer información del usuario del token
        (req as any).user = {
          id: decoded.sub,
          email: decoded.email,
          username: decoded.preferred_username,
          roles: decoded.realm_access?.roles || [],
          name: decoded.name,
        };

        console.log("✓ Usuario autenticado:", {
          username: (req as any).user.username,
          roles: (req as any).user.roles,
        });

        next();
      },
    );
  } catch (error) {
    console.error("Error en middleware de validación de token:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error al validar el token",
    });
  }
};
