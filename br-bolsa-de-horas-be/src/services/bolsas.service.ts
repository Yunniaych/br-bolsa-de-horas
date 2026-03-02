import prisma from "../config/database";
import { parseLocalDate } from "../utils/date.utils";

export class BolsasService {
  /**
   * Obtener todas las bolsas con su estado
   */
  async getAll() {
    return prisma.bolsaHoras.findMany({
      include: {
        estado: true,
      },
      orderBy: {
        fechaInicio: "desc",
      },
    });
  }

  /**
   * Obtener bolsa por ID
   */
  async getById(id: number) {
    const bolsa = await prisma.bolsaHoras.findUnique({
      where: { idBolsa: id },
      include: {
        estado: true,
      },
    });

    if (!bolsa) {
      throw new Error("Bolsa no encontrada");
    }

    return bolsa;
  }

  /**
   * Crear nueva bolsa
   */
  async create(data: {
    nombreBolsa: string;
    fechaInicio: string;
    fechaFin: string;
    horasContratadas: number;
    mandayContratados: number;
    idEstado: number;
  }) {
    return prisma.bolsaHoras.create({
      data: {
        ...data,
        fechaInicio: parseLocalDate(data.fechaInicio),
        fechaFin: parseLocalDate(data.fechaFin),
      },
      include: {
        estado: true,
      },
    });
  }

  /**
   * Actualizar bolsa
   */
  async update(
    id: number,
    data: Partial<{
      nombreBolsa: string;
      fechaInicio: string;
      fechaFin: string;
      horasContratadas: number;
      mandayContratados: number;
      idEstado: number;
    }>,
  ) {
    // Verificar que existe
    await this.getById(id);

    // Convertir strings de fecha a Date para Prisma
    const prismaData: any = { ...data };
    if (typeof prismaData.fechaInicio === "string") {
      prismaData.fechaInicio = parseLocalDate(prismaData.fechaInicio);
    }
    if (typeof prismaData.fechaFin === "string") {
      prismaData.fechaFin = parseLocalDate(prismaData.fechaFin);
    }

    return prisma.bolsaHoras.update({
      where: { idBolsa: id },
      data: prismaData,
      include: {
        estado: true,
      },
    });
  }

  /**
   * Eliminar bolsa
   */
  async delete(id: number) {
    // Verificar que existe
    await this.getById(id);

    return prisma.bolsaHoras.delete({
      where: { idBolsa: id },
    });
  }
}

export default new BolsasService();
