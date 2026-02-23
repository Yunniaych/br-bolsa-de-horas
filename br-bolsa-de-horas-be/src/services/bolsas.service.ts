import prisma from "../config/database";

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
    fechaInicio: Date;
    fechaFin: Date;
    horasContratadas: number;
    mandayContratados: number;
    idEstado: number;
  }) {
    return prisma.bolsaHoras.create({
      data,
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
      fechaInicio: Date;
      fechaFin: Date;
      horasContratadas: number;
      mandayContratados: number;
      idEstado: number;
    }>,
  ) {
    // Verificar que existe
    await this.getById(id);

    return prisma.bolsaHoras.update({
      where: { idBolsa: id },
      data,
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
