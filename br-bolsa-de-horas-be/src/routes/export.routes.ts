import { Router } from "express";
import exportController from "../controllers/export.controller";
import { requireAuth } from "../middleware/rbac.middleware";

const router = Router();

// POST /api/export/excel — genera y descarga el reporte Excel (autenticado)
router.post(
  "/excel",
  requireAuth,
  exportController.exportExcel.bind(exportController),
);

export default router;
