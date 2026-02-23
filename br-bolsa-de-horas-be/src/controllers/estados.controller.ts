import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

class EstadosController {
  async getEstadosIniciativa(_req: Request, res: Response, next: NextFunction) {
    try {
      const estados = await prisma.estadoIniciativa.findMany({
        orderBy: { idEstado: "asc" },
      });
      res.json(estados);
    } catch (error) {
      next(error);
    }
  }

  async getEstadosBolsa(_req: Request, res: Response, next: NextFunction) {
    try {
      const estados = await prisma.estadoBolsa.findMany({
        orderBy: { idEstado: "asc" },
      });
      res.json(estados);
    } catch (error) {
      next(error);
    }
  }
}

export default new EstadosController();
