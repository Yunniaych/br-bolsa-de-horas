// Extiende el tipo Request de Express para incluir el contexto de auditoría
// que el auditContext middleware adjunta tras decodificar el JWT de Keycloak.

declare global {
  namespace Express {
    interface Request {
      auditUser?: {
        keycloak_user_id: string;
        email: string;
      };
    }
  }
}

export {};
