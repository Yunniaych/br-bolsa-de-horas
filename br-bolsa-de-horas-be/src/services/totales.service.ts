import prisma from "../config/database";

export class TotalesService {
  /**
   * Obtener totales globales (siempre hay un solo registro en la tabla)
   */
  async getTotales() {
    const totales = await prisma.totales.findFirst();

    if (!totales) {
      throw new Error("No se encontraron totales en la base de datos");
    }

    // Convertir Decimal a number para JSON
    return {
      mandayReservadas: Number(totales.mandayReservadas || 0),
      horasReservadas: Number(totales.horasReservadas || 0),
      mandayConsumidas: Number(totales.mandayConsumidas || 0),
      horasConsumidas: Number(totales.horasConsumidas || 0),
      mandayAprobadasDisponibles: Number(
        totales.mandayAprobadasDisponibles || 0,
      ),
      horasAprobadasDisponibles: Number(totales.horasAprobadasDisponibles || 0),
      bolsaHorasContratadas: Number(totales.bolsaHorasContratadas || 0),
      bolsaMandayContratados: Number(totales.bolsaMandayContratados || 0),
      horasDisponibles: Number(totales.horasDisponibles || 0),
      mandayDisponibles: Number(totales.mandayDisponibles || 0),
    };
  }

  /**
   * Recalcular totales manualmente (llama a la función de PostgreSQL)
   */
  async recalcular() {
    await prisma.$executeRaw`SELECT recalcular_totales()`;
    return this.getTotales();
  }

  /**
   * Calcular totales en tiempo real para un rango de fechas.
   *
   * - Iniciativas: fecha_aprobada dentro del rango [inicio, fin].
   * - Bolsas: vigencia se solapa con el rango (fechaInicio <= fin Y fechaFin >= inicio).
   *           No se filtra por estado — una bolsa Caducada que estaba activa en el
   *           rango consultado sí aporta sus horas contratadas.
   * - Si solo se pasa inicio, fin se infiere como la fecha actual.
   * - Si solo se pasa fin, inicio se infiere como la fecha del registro más antiguo.
   */
  async getTotalesPorFecha(inicio?: Date, fin?: Date) {
    // Inferir fecha de fin → hoy si no se proporcionó
    const fechaFin: Date = fin ?? new Date();

    // Inferir fecha de inicio → registro más antiguo de cada tabla
    let fechaInicio: Date;
    if (inicio) {
      fechaInicio = inicio;
    } else {
      // Buscar fecha mínima de bolsas e iniciativas
      const [minBolsa, minIniciativa] = await Promise.all([
        prisma.bolsaHoras.findFirst({ orderBy: { fechaInicio: "asc" } }),
        prisma.iniciativa.findFirst({ orderBy: { fechaAprobada: "asc" } }),
      ]);

      const candidates: Date[] = [];
      if (minBolsa?.fechaInicio) candidates.push(new Date(minBolsa.fechaInicio));
      if (minIniciativa?.fechaAprobada)
        candidates.push(new Date(minIniciativa.fechaAprobada));

      fechaInicio =
        candidates.length > 0
          ? new Date(Math.min(...candidates.map((d) => d.getTime())))
          : new Date(0);
    }

    // Sumar campos de iniciativa cuya fecha_aprobada cae dentro del rango
    const iniciativas = await prisma.iniciativa.findMany({
      where: {
        fechaAprobada: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      select: {
        mandayReservadas: true,
        horasReservadas: true,
        mandayConsumidos: true,
        horasConsumidas: true,
        mandayAprobadasDisponibles: true,
        horasAprobadasDisponibles: true,
      },
    });

    const sum = (arr: any[], field: string): number =>
      arr.reduce((acc: number, row: any) => acc + Number(row?.[field] || 0), 0);

    const mandayReservadas = sum(iniciativas, "mandayReservadas");
    const horasReservadas = sum(iniciativas, "horasReservadas");
    const mandayConsumidas = sum(iniciativas, "mandayConsumidos");
    const horasConsumidas = sum(iniciativas, "horasConsumidas");
    const mandayAprobadasDisponibles = sum(
      iniciativas,
      "mandayAprobadasDisponibles",
    );
    const horasAprobadasDisponibles = sum(
      iniciativas,
      "horasAprobadasDisponibles",
    );

    // Sumar bolsas cuya vigencia se solapa con el rango (sin filtro de estado)
    const bolsas = await prisma.bolsaHoras.findMany({
      where: {
        fechaInicio: { lte: fechaFin },
        fechaFin: { gte: fechaInicio },
      },
      select: {
        horasContratadas: true,
        mandayContratados: true,
      },
    });

    const bolsaHorasContratadas = bolsas.reduce(
      (acc, b) => acc + Number(b.horasContratadas || 0),
      0,
    );
    const bolsaMandayContratados = bolsas.reduce(
      (acc, b) => acc + Number(b.mandayContratados || 0),
      0,
    );

    return {
      mandayReservadas,
      horasReservadas,
      mandayConsumidas,
      horasConsumidas,
      mandayAprobadasDisponibles,
      horasAprobadasDisponibles,
      bolsaHorasContratadas,
      bolsaMandayContratados,
      horasDisponibles: bolsaHorasContratadas - horasReservadas,
      mandayDisponibles: bolsaMandayContratados - mandayReservadas,
    };
  }
}

export default new TotalesService();
