import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller";
import { requireAuth, requireAdmin } from "../middleware/rbac.middleware";

const router = Router();

// Obtener totales (ambos roles)
router.get(
  "/totales",
  requireAuth,
  dashboardController.getTotales.bind(dashboardController),
);

// Recalcular totales manualmente (solo admin)
router.post(
  "/recalcular-totales",
  requireAdmin,
  dashboardController.recalcularTotales.bind(dashboardController),
);

export default router;
