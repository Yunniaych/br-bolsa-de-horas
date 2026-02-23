import { Request, Response, NextFunction } from "express";
import totalesService from "../services/totales.service";

export class DashboardController {
  /**
   * GET /api/dashboard/totales
   */
  async getTotales(_req: Request, res: Response, next: NextFunction) {
    try {
      const totales = await totalesService.getTotales();
      res.json(totales);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/dashboard/recalcular-totales
   * Endpoint manual para forzar recálculo de totales
   * (normalmente se hace automáticamente con triggers)
   */
  async recalcularTotales(_req: Request, res: Response, next: NextFunction) {
    try {
      const totales = await totalesService.recalcular();
      res.json(totales);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
