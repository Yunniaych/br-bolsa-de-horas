import { Router } from "express";
import bolsasController from "../controllers/bolsas.controller";
import { requireAuth, requireAdmin } from "../middleware/rbac.middleware";

const router = Router();

// Rutas de lectura (ambos roles)
router.get("/", requireAuth, bolsasController.getAll.bind(bolsasController));
router.get(
  "/:id",
  requireAuth,
  bolsasController.getById.bind(bolsasController),
);

// Rutas de escritura (solo admin)
router.post("/", requireAdmin, bolsasController.create.bind(bolsasController));
router.put(
  "/:id",
  requireAdmin,
  bolsasController.update.bind(bolsasController),
);
router.delete(
  "/:id",
  requireAdmin,
  bolsasController.delete.bind(bolsasController),
);

export default router;
