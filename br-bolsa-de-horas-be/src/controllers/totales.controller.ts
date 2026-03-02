import { Request, Response, NextFunction } from "express";
import totalesService from "../services/totales.service";

export class TotalesController {
  /**
   * GET /api/totales
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
   * POST /api/totales/recalcular
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

  /**
   * GET /api/totales/por-fecha?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
   * Calcula totales en tiempo real para un rango de fechas.
   * - Iniciativas: fecha_aprobada dentro del rango.
   * - Bolsas: vigencia se solapa con el rango (sin filtro de estado).
   * - Solo fecha_inicio → fecha_fin inferida como hoy.
   * - Solo fecha_fin → fecha_inicio inferida como el registro más antiguo.
   */
  async getTotalesPorFecha(req: Request, res: Response, next: NextFunction) {
    try {
      const { fecha_inicio, fecha_fin } = req.query as {
        fecha_inicio?: string;
        fecha_fin?: string;
      };

      if (!fecha_inicio && !fecha_fin) {
        res.status(400).json({
          error:
            "Debe proporcionar al menos fecha_inicio o fecha_fin (formato YYYY-MM-DD)",
        });
        return;
      }

      const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

      if (fecha_inicio && !ISO_DATE.test(fecha_inicio)) {
        res
          .status(400)
          .json({ error: "fecha_inicio debe tener formato YYYY-MM-DD" });
        return;
      }
      if (fecha_fin && !ISO_DATE.test(fecha_fin)) {
        res
          .status(400)
          .json({ error: "fecha_fin debe tener formato YYYY-MM-DD" });
        return;
      }

      if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
        res
          .status(400)
          .json({ error: "fecha_inicio no puede ser mayor que fecha_fin" });
        return;
      }

      const totales = await totalesService.getTotalesPorFecha(fecha_inicio, fecha_fin);
      res.json(totales);
    } catch (error) {
      next(error);
    }
  }
}

export default new TotalesController();
