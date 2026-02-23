import { Request, Response, NextFunction } from "express";
import iniciativaService from "../services/iniciativas.service";

export class IniciativaController {
  /**
   * GET /api/iniciativas
   */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const iniciativas = await iniciativaService.getAll();
      res.json(iniciativas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/iniciativas/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const iniciativa = await iniciativaService.getById(id);
      res.json(iniciativa);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/iniciativas
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        fechaAprobada: new Date(req.body.fechaAprobada),
      };
      const iniciativa = await iniciativaService.create(data);
      res.status(201).json(iniciativa);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/iniciativas/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const data = req.body;

      if (data.fechaAprobada) {
        data.fechaAprobada = new Date(data.fechaAprobada);
      }

      const iniciativa = await iniciativaService.update(id, data);
      res.json(iniciativa);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/iniciativas/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await iniciativaService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/iniciativas/horas-por-mes
   */
  async getHorasPorMes(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await iniciativaService.getHorasPorMes();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default new IniciativaController();
