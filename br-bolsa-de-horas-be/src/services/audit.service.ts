import prisma from "../config/database";

export interface AuditLogPayload {
  keycloak_user_id: string;
  email: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  table_name: string;
  record_id?: string;
  old_values?: object | null;
  new_values?: object | null;
  status?: "EXITOSO" | "FALLIDO";
}

/**
 * Registra una entrada en la tabla audit_log.
 * No lanza errores: si falla la escritura, solo lo imprime en consola
 * para que el flujo principal del controller no se interrumpa.
 */
export async function createAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        keycloakUserId: payload.keycloak_user_id,
        email: payload.email,
        accion: payload.action,
        tabla: payload.table_name,
        registroId: payload.record_id ?? null,
        valorViejo: (payload.old_values as object) ?? undefined,
        valorNuevo: (payload.new_values as object) ?? undefined,
        estatus: payload.status ?? "EXITOSO",
      },
    });
  } catch (err) {
    console.error("[AuditLog] Error al escribir log de auditoría:", err);
  }
}
