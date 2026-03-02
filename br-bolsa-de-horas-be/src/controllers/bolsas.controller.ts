import { Request, Response, NextFunction } from "express";
import bolsasService from "../services/bolsas.service";
import { createAuditLog } from "../services/audit.service";

const TABLE = "bolsa_horas";

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

      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "CREATE",
        table_name: TABLE,
        record_id: String(bolsa.idBolsa),
        new_values: bolsa,
      });

      res.status(201).json(bolsa);
    } catch (error) {
      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "CREATE",
        table_name: TABLE,
        status: "FALLIDO",
      });
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

      // Obtener registro anterior antes de modificar
      const oldRecord = await bolsasService.getById(id);
      const bolsa = await bolsasService.update(id, data);

      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "UPDATE",
        table_name: TABLE,
        record_id: String(id),
        old_values: oldRecord,
        new_values: bolsa,
      });

      res.json(bolsa);
    } catch (error) {
      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "UPDATE",
        table_name: TABLE,
        record_id: String(req.params.id),
        status: "FALLIDO",
      });
      next(error);
    }
  }

  /**
   * DELETE /api/bolsas/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);

      // Obtener registro antes de eliminar
      const oldRecord = await bolsasService.getById(id);
      await bolsasService.delete(id);

      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "DELETE",
        table_name: TABLE,
        record_id: String(id),
        old_values: oldRecord,
      });

      res.status(204).send();
    } catch (error) {
      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "DELETE",
        table_name: TABLE,
        record_id: String(req.params.id),
        status: "FALLIDO",
      });
      next(error);
    }
  }
}

export default new BolsasController();
