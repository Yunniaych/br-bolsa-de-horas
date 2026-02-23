import { Router } from "express";
import estadosController from "../controllers/estados.controller";
import { requireAuth } from "../middleware/rbac.middleware";

const router = Router();

router.get("/iniciativas", requireAuth, estadosController.getEstadosIniciativa);
router.get("/bolsas", requireAuth, estadosController.getEstadosBolsa);

export default router;
