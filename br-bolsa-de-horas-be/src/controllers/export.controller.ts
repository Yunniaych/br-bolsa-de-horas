import { Request, Response, NextFunction } from "express";
import exportService from "../services/export.service";

export class ExportController {
  /**
   * POST /api/export/excel
   * Body: { fechaDesde?: string, fechaHasta?: string, chartImage: string }
   * Ambas fechas son opcionales — si no se proveen se exportan todos los datos.
   */
  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { fechaDesde, fechaHasta, chartImage } = req.body as {
        fechaDesde?: string;
        fechaHasta?: string;
        chartImage?: string;
      };

      const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

      if (fechaDesde && !ISO_DATE.test(fechaDesde)) {
        res
          .status(400)
          .json({ error: "fechaDesde debe tener formato YYYY-MM-DD" });
        return;
      }
      if (fechaHasta && !ISO_DATE.test(fechaHasta)) {
        res
          .status(400)
          .json({ error: "fechaHasta debe tener formato YYYY-MM-DD" });
        return;
      }
      if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        res
          .status(400)
          .json({ error: "fechaDesde no puede ser mayor que fechaHasta" });
        return;
      }

      const buffer = await exportService.generateExcel(
        fechaDesde,
        fechaHasta,
        chartImage ?? "",
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader("Content-Disposition", "attachment; filename=reporte.xlsx");
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export default new ExportController();

