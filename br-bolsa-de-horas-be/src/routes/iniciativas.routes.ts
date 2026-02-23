import { Router } from "express";
import iniciativaController from "../controllers/iniciativas.controller";
import { requireAuth, requireAdmin } from "../middleware/rbac.middleware";

const router = Router();

// Ruta para horas por mes (debe ir antes de /:id para evitar conflictos)
router.get(
  "/horas-por-mes",
  requireAuth,
  iniciativaController.getHorasPorMes.bind(iniciativaController),
);

// Rutas de lectura (ambos roles)
router.get(
  "/",
  requireAuth,
  iniciativaController.getAll.bind(iniciativaController),
);
router.get(
  "/:id",
  requireAuth,
  iniciativaController.getById.bind(iniciativaController),
);

// Rutas de escritura (solo admin)
router.post(
  "/",
  requireAdmin,
  iniciativaController.create.bind(iniciativaController),
);
router.put(
  "/:id",
  requireAdmin,
  iniciativaController.update.bind(iniciativaController),
);
router.delete(
  "/:id",
  requireAdmin,
  iniciativaController.delete.bind(iniciativaController),
);

export default router;
