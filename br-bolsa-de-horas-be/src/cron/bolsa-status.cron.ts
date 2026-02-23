import cron from "node-cron";
import prisma from "../config/database";

/**
 * Cron job para actualizar el estado de las bolsas diariamente
 * Se ejecuta todos los días a medianoche (00:00)
 *
 * Llama a la función de PostgreSQL: actualizar_estado_bolsa()
 * que actualiza los estados según los días de preaviso configurados
 */
export const iniciarCronActualizarEstadoBolsa = () => {
  // Ejecutar todos los días a medianoche
  // Formato: segundo minuto hora día mes día-semana
  // '0 0 * * *' = a las 00:00 todos los días
  cron.schedule("0 0 * * *", async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Ejecutando cron: actualizar_estado_bolsa`);

    try {
      // Ejecutar la función de PostgreSQL
      await prisma.$executeRaw`SELECT actualizar_estado_bolsa()`;

      console.log(
        `[${timestamp}] ✓ Cron ejecutado exitosamente: actualizar_estado_bolsa`,
      );
    } catch (error) {
      console.error(
        `[${timestamp}] ✗ Error al ejecutar cron actualizar_estado_bolsa:`,
        error,
      );
    }
  });

  console.log(
    "✓ Cron job configurado: actualizar_estado_bolsa (todos los días a 00:00)",
  );
};

/**
 * Ejecutar manualmente la actualización (útil para testing)
 */
export const ejecutarActualizacionManual = async () => {
  try {
    console.log("Ejecutando actualización manual de estado de bolsas...");
    await prisma.$executeRaw`SELECT actualizar_estado_bolsa()`;
    console.log("✓ Actualización manual completada exitosamente");
  } catch (error) {
    console.error("✗ Error en actualización manual:", error);
    throw error;
  }
};
