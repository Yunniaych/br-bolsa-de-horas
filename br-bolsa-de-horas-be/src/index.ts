import dotenv from "dotenv";
import { createApp } from "./app";
import { iniciarCronActualizarEstadoBolsa } from "./cron/bolsa-status.cron";
import prisma from "./config/database";

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Crear aplicación Express
const app = createApp();

// Función de inicio del servidor
const start = async () => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log("✓ Conectado a PostgreSQL");

    // Iniciar cron jobs
    iniciarCronActualizarEstadoBolsa();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("");
      console.log("====================================");
      console.log("  Bolsa de Horas - Backend API");
      console.log("====================================");
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Server running on port: ${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log("====================================");
      console.log("");
    });
  } catch (error) {
    console.error("✗ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);

  try {
    await prisma.$disconnect();
    console.log("✓ Desconectado de PostgreSQL");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error durante el cierre:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Iniciar servidor
start();
