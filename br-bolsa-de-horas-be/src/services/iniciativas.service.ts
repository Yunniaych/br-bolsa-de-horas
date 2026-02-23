import prisma from "../config/database";

export class IniciativaService {
  /**
   * Obtener todas las iniciativas con su estado
   */
  async getAll() {
    return prisma.iniciativa.findMany({
      include: {
        estado: true,
      },
      orderBy: {
        fechaAprobada: "desc",
      },
    });
  }

  /**
   * Obtener iniciativa por ID
   */
  async getById(id: number) {
    const iniciativa = await prisma.iniciativa.findUnique({
      where: { id },
      include: {
        estado: true,
      },
    });

    if (!iniciativa) {
      throw new Error("Iniciativa no encontrada");
    }

    return iniciativa;
  }

  /**
   * Crear nueva iniciativa
   */
  async create(data: {
    nombre: string;
    fechaAprobada: Date;
    idEstado?: number;
    estado?: string;
    mandayReservadas?: number;
    horasReservadas?: number;
    mandayConsumidos?: number;
    horasConsumidas?: number;
    mandayAprobadasDisponibles?: number;
    horasAprobadasDisponibles?: number;
    manDayReserva?: number;
    HorasReservadas?: number;
    ManDayConsumidos?: number;
    HorasConsumidas?: number;
  }) {
    // Si viene estado como string, buscar su ID
    let estadoId = data.idEstado;
    if (!estadoId && data.estado) {
      const estadoRecord = await prisma.estadoIniciativa.findUnique({
        where: { descripcion: data.estado },
      });
      if (!estadoRecord) {
        throw new Error(`Estado "${data.estado}" no encontrado`);
      }
      estadoId = estadoRecord.idEstado;
    }

    if (!estadoId) {
      throw new Error("Debe proporcionar idEstado o estado");
    }

    return prisma.iniciativa.create({
      data: {
        nombre: data.nombre,
        fechaAprobada: data.fechaAprobada,
        idEstado: estadoId,
        mandayReservadas: data.mandayReservadas || data.manDayReserva || 0,
        horasReservadas: data.horasReservadas || data.HorasReservadas || 0,
        mandayConsumidos: data.mandayConsumidos || data.ManDayConsumidos || 0,
        horasConsumidas: data.horasConsumidas || data.HorasConsumidas || 0,
        mandayAprobadasDisponibles: data.mandayAprobadasDisponibles || 0,
        horasAprobadasDisponibles: data.horasAprobadasDisponibles || 0,
      },
      include: {
        estado: true,
      },
    });
  }

  /**
   * Actualizar iniciativa
   */
  async update(
    id: number,
    data: Partial<{
      nombre: string;
      fechaAprobada: Date;
      idEstado: number;
      estado: string;
      mandayReservadas: number;
      horasReservadas: number;
      mandayConsumidos: number;
      horasConsumidas: number;
      mandayAprobadasDisponibles: number;
      horasAprobadasDisponibles: number;
      manDayReserva: number;
      HorasReservadas: number;
      ManDayConsumidos: number;
      HorasConsumidas: number;
    }>,
  ) {
    // Verificar que existe
    await this.getById(id);

    // Si viene estado como string, buscar su ID
    let estadoId = data.idEstado;
    if (!estadoId && data.estado) {
      const estadoRecord = await prisma.estadoIniciativa.findUnique({
        where: { descripcion: data.estado },
      });
      if (!estadoRecord) {
        throw new Error(`Estado "${data.estado}" no encontrado`);
      }
      estadoId = estadoRecord.idEstado;
    }

    const updateData: any = {
      nombre: data.nombre,
      fechaAprobada: data.fechaAprobada,
    };

    if (estadoId) {
      updateData.idEstado = estadoId;
    }

    // Mapear campos con diferentes nombres
    if (
      data.mandayReservadas !== undefined ||
      data.manDayReserva !== undefined
    ) {
      updateData.mandayReservadas = data.mandayReservadas ?? data.manDayReserva;
    }
    if (
      data.horasReservadas !== undefined ||
      data.HorasReservadas !== undefined
    ) {
      updateData.horasReservadas = data.horasReservadas ?? data.HorasReservadas;
    }
    if (
      data.mandayConsumidos !== undefined ||
      data.ManDayConsumidos !== undefined
    ) {
      updateData.mandayConsumidos =
        data.mandayConsumidos ?? data.ManDayConsumidos;
    }
    if (
      data.horasConsumidas !== undefined ||
      data.HorasConsumidas !== undefined
    ) {
      updateData.horasConsumidas = data.horasConsumidas ?? data.HorasConsumidas;
    }
    if (data.mandayAprobadasDisponibles !== undefined) {
      updateData.mandayAprobadasDisponibles = data.mandayAprobadasDisponibles;
    }
    if (data.horasAprobadasDisponibles !== undefined) {
      updateData.horasAprobadasDisponibles = data.horasAprobadasDisponibles;
    }

    return prisma.iniciativa.update({
      where: { id },
      data: updateData,
      include: {
        estado: true,
      },
    });
  }

  /**
   * Eliminar iniciativa
   */
  async delete(id: number) {
    // Verificar que existe
    await this.getById(id);

    return prisma.iniciativa.delete({
      where: { id },
    });
  }

  /**
   * Obtener horas por mes (últimos 6 meses)
   * Para la gráfica de línea
   */
  async getHorasPorMes() {
    const hoy = new Date();
    const seiseMesesAtras = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);

    // Obtener iniciativas de los últimos 6 meses
    const iniciativas = await prisma.iniciativa.findMany({
      where: {
        fechaAprobada: {
          gte: seiseMesesAtras,
        },
      },
      select: {
        fechaAprobada: true,
        horasReservadas: true,
      },
    });

    // Agrupar por mes
    const mesesNombres = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const resultados: { mes: string; horas: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const iniciativasDelMes = iniciativas.filter((ini: any) => {
        const fechaAprob = new Date(ini.fechaAprobada);
        return (
          fechaAprob.getFullYear() === fecha.getFullYear() &&
          fechaAprob.getMonth() === fecha.getMonth()
        );
      });

      const totalHoras = iniciativasDelMes.reduce(
        (sum: number, ini: any) => sum + Number(ini.horasReservadas || 0),
        0,
      );

      resultados.push({
        mes: mesesNombres[fecha.getMonth()],
        horas: totalHoras,
      });
    }

    return resultados;
  }
}

export default new IniciativaService();
