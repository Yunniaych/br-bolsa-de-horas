import { Request, Response, NextFunction } from "express";
import iniciativaService from "../services/iniciativas.service";
import { createAuditLog } from "../services/audit.service";

const TABLE = "iniciativa";

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

      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "CREATE",
        table_name: TABLE,
        record_id: String(iniciativa.id),
        new_values: iniciativa,
      });

      res.status(201).json(iniciativa);
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
   * PUT /api/iniciativas/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const data = req.body;

      if (data.fechaAprobada) {
        data.fechaAprobada = new Date(data.fechaAprobada);
      }

      // Obtener registro anterior antes de modificar
      const oldRecord = await iniciativaService.getById(id);
      const updated = await iniciativaService.update(id, data);

      await createAuditLog({
        ...(req.auditUser ?? { keycloak_user_id: "", email: "" }),
        action: "UPDATE",
        table_name: TABLE,
        record_id: String(id),
        old_values: oldRecord,
        new_values: updated,
      });

      res.json(updated);
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
   * DELETE /api/iniciativas/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);

      // Obtener registro antes de eliminar
      const oldRecord = await iniciativaService.getById(id);
      await iniciativaService.delete(id);

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
