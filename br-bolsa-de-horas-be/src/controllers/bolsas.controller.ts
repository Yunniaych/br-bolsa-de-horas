import { Request, Response, NextFunction } from "express";
import bolsasService from "../services/bolsas.service";

export class BolsasController {
  /**
   * GET /api/bolsas
   */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const bolsas = await bolsasService.getAll();
      res.json(bolsas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bolsas/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const bolsa = await bolsasService.getById(id);
      res.json(bolsa);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bolsas
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        fechaInicio: new Date(req.body.fechaInicio),
        fechaFin: new Date(req.body.fechaFin),
      };
      const bolsa = await bolsasService.create(data);
      res.status(201).json(bolsa);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/bolsas/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const data = req.body;

      if (data.fechaInicio) {
        data.fechaInicio = new Date(data.fechaInicio);
      }
      if (data.fechaFin) {
        data.fechaFin = new Date(data.fechaFin);
      }

      const bolsa = await bolsasService.update(id, data);
      res.json(bolsa);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/bolsas/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await bolsasService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new BolsasController();
