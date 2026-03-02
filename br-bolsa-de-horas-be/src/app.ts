import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { validateToken } from "./middleware/jwt.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { auditContext } from "./middleware/audit.middleware";

// Importar rutas
import iniciativasRoutes from "./routes/iniciativas.routes";
import bolsasRoutes from "./routes/bolsas.routes";

import dashboardRoutes from "./routes/totales.routes";
import estadosRoutes from "./routes/estados.routes";

export const createApp = (): Application => {
  const app = express();

  // ============================
  // MIDDLEWARES GLOBALES
  // ============================

  // Seguridad
  app.use(helmet());

  // CORS
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Logging
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Contexto de auditoría: extrae keycloak_user_id y email del JWT
  app.use(auditContext);

  // ============================
  // RUTAS DE SALUD
  // ============================

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  app.get("/", (_req, res) => {
    res.json({
      message: "Bolsa de Horas API",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        iniciativas: "/api/iniciativas",
        bolsas: "/api/bolsas",
        totales: "/api/totales",
      },
    });
  });

  // ============================
  // RUTAS DE API (PROTEGIDAS)
  // ============================

  // Todas las rutas de API requieren autenticación JWT
  app.use("/api", validateToken);

  // Rutas específicas
  app.use("/api/iniciativas", iniciativasRoutes);
  app.use("/api/bolsas", bolsasRoutes);
  app.use("/api/totales", dashboardRoutes);
  app.use("/api/estados", estadosRoutes);

  // ============================
  // MANEJO DE ERRORES
  // ============================

  // 404 - Ruta no encontrada
  app.use(notFoundHandler);

  // Error handler global
  app.use(errorHandler);

  return app;
};
