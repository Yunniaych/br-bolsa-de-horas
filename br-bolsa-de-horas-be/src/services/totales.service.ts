import prisma from "../config/database";

export class TotalesService {
  /**
   * Obtener totales (siempre hay un solo registro)
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
}

export default new TotalesService();
