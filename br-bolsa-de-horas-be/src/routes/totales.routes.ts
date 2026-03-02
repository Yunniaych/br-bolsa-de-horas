import { Router } from "express";
import totalesController from "../controllers/totales.controller";
import { requireAuth, requireAdmin } from "../middleware/rbac.middleware";

const router = Router();

// GET /api/totales — obtener totales globales (ambos roles)
router.get(
  "/",
  requireAuth,
  totalesController.getTotales.bind(totalesController),
);

// GET /api/totales/por-fecha — totales filtrados por rango de fechas (ambos roles)
router.get(
  "/por-fecha",
  requireAuth,
  totalesController.getTotalesPorFecha.bind(totalesController),
);

// POST /api/totales/recalcular — forzar recálculo manual (solo admin)
router.post(
  "/recalcular",
  requireAdmin,
  totalesController.recalcularTotales.bind(totalesController),
);

export default router;
