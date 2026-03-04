import cron from "node-cron";
import prisma from "../config/database";

/**
 * Cron job para actualizar el estado de las bolsas diariamente
 * Se ejecuta todos los días a medianoche hora de Santo Domingo (UTC-4)
 *
 * IMPORTANTE: El contenedor Docker corre en UTC.
 * Medianoche SD (UTC-4) = 04:00 UTC → expresión: '0 4 * * *'
 * NO se usa la opción timezone de node-cron porque en Docker puede
 * no tener las tzdata disponibles y silenciosamente usar UTC.
 *
 * Llama a la función de PostgreSQL: actualizar_estado_bolsa()
 */
export const iniciarCronActualizarEstadoBolsa = () => {
  // 04:00 UTC = 00:00 America/Santo_Domingo (UTC-4)
  cron.schedule(
    "0 4 * * *",
    async () => {
      const timestamp = new Date().toLocaleString("es-DO", {
        timeZone: "America/Santo_Domingo",
      });
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
    },
  );

  console.log(
    "✓ Cron job configurado: actualizar_estado_bolsa (todos los días a 00:00 SD / 04:00 UTC)",
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
