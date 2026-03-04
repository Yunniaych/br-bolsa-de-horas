import ExcelJS from "exceljs";
import prisma from "../config/database";
import totalesService from "./totales.service";
import { parseLocalDate } from "../utils/date.utils";

// ──────────────── Paleta de colores ────────────────
const COLOR = {
  primary: "264D72",
  secondary: "01AFF1",
  tertiary: "F7941F",
  primaryLight: "F0F9FF",
  secondaryLight: "E6F7FF",
  white: "FFFFFF",
  grayText: "666666",
  black: "000000",
  // Estados iniciativa  (mismos colores que el frontend)
  estadoAutorizado:   "F59E0B",  // amber-500
  estadoCompletado:   "22C55E",  // green-500
  estadoDetenido:     "EF4444",  // red-500
  estadoEnDesarrollo: "3B82F6",  // blue-500
  estadoHold:         "6B7280",  // gray-500
  // Estados bolsa
  estadoActiva:   "22C55E",
  estadoProxima:  "F59E0B",
  estadoCaducada: "EF4444",
};

function borderAll(): Partial<ExcelJS.Borders> {
  const side: ExcelJS.BorderStyle = "thin";
  return {
    top: { style: side, color: { argb: "FFCCCCCC" } },
    left: { style: side, color: { argb: "FFCCCCCC" } },
    bottom: { style: side, color: { argb: "FFCCCCCC" } },
    right: { style: side, color: { argb: "FFCCCCCC" } },
  };
}

function argb(hex: string): string {
  return `FF${hex.toUpperCase()}`;
}

function estadoIniciativaColor(descripcion: string | undefined): string | null {
  switch (descripcion) {
    case "Autorizado Iniciar": return COLOR.estadoAutorizado;
    case "Completado":         return COLOR.estadoCompletado;
    case "Detenido":           return COLOR.estadoDetenido;
    case "En Desarrollo":      return COLOR.estadoEnDesarrollo;
    case "HOLD":               return COLOR.estadoHold;
    default:                   return null;
  }
}

function estadoBolsaColor(descripcion: string | undefined): string | null {
  switch (descripcion) {
    case "Activa":            return COLOR.estadoActiva;
    case "Próxima a Caducar": return COLOR.estadoProxima;
    case "Caducada":          return COLOR.estadoCaducada;
    default:                  return null;
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  return `${pad(dt.getUTCDate())}/${pad(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}`;
}

/** Escribe la cabecera estándar (filas 1-3) en una hoja. */
function writeSheetHeader(
  sheet: ExcelJS.Worksheet,
  fechaDesde: string | undefined,
  fechaHasta: string | undefined,
  lastColLetter: string,
  titulo: string,
) {
  // Fecha/hora actual en UTC-4 (America/Santo_Domingo)
  const now = new Date();
  const sdOptions: Intl.DateTimeFormatOptions = {
    timeZone: "America/Santo_Domingo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const parts = new Intl.DateTimeFormat("es-DO", sdOptions).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const generadoStr = `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;

  let periodoStr: string;
  if (fechaDesde && fechaHasta) {
    periodoStr = `Período: ${fechaDesde} al ${fechaHasta}`;
  } else if (fechaHasta) {
    periodoStr = `Período: hasta el ${fechaHasta}`;
  } else if (fechaDesde) {
    periodoStr = `Período: desde el ${fechaDesde}`;
  } else {
    periodoStr = "Período: completo";
  }

  sheet.getRow(1).height = 28;
  const titleCell = sheet.getCell("A1");
  titleCell.value = titulo;
  titleCell.font = { name: "Calibri", bold: true, size: 16, color: { argb: argb(COLOR.primary) } };
  titleCell.alignment = { vertical: "middle" };
  sheet.mergeCells(`A1:${lastColLetter}1`);

  const periodCell = sheet.getCell("A2");
  periodCell.value = periodoStr;
  periodCell.font = { italic: true, size: 11, color: { argb: argb(COLOR.grayText) } };
  sheet.mergeCells(`A2:${lastColLetter}2`);

  const genCell = sheet.getCell("A3");
  genCell.value = `Generado el: ${generadoStr}`;
  genCell.font = { italic: true, size: 10, color: { argb: argb(COLOR.grayText) } };
  sheet.mergeCells(`A3:${lastColLetter}3`);
}

export class ExportService {
  async generateExcel(
    fechaDesde: string | undefined,
    fechaHasta: string | undefined,
    chartImageBase64: string,
  ): Promise<Buffer> {
    // ── 1. Datos ──────────────────────────────────────────────────────────
    const fechaInicio = fechaDesde ? parseLocalDate(fechaDesde) : undefined;
    const fechaFin    = fechaHasta ? parseLocalDate(fechaHasta) : undefined;

    const iniciativas = await prisma.iniciativa.findMany({
      where: {
        ...(fechaInicio || fechaFin
          ? {
              fechaAprobada: {
                ...(fechaInicio ? { gte: fechaInicio } : {}),
                ...(fechaFin   ? { lte: fechaFin }    : {}),
              },
            }
          : {}),
      },
      include: { estado: true },
      orderBy: { id: "asc" },
    });

    const totales = await totalesService.getTotalesPorFecha(
      fechaDesde,
      fechaHasta,
    );

    // Bolsas: solapamiento con rango si hay fechas, todas si no
    const bolsas = await prisma.bolsaHoras.findMany({
      where: {
        ...(fechaInicio || fechaFin
          ? {
              ...(fechaInicio ? { fechaFin:    { gte: fechaInicio } } : {}),
              ...(fechaFin   ? { fechaInicio: { lte: fechaFin }    } : {}),
            }
          : {}),
      },
      include: { estado: true },
      orderBy: { fechaInicio: "desc" },
    });

    // ── 2. Workbook ───────────────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    const pageSetup: Partial<ExcelJS.PageSetup> = {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    };

    // ═══════════════════════════════════════════════════════════════════════
    //  HOJA 1 — INICIATIVAS
    // ═══════════════════════════════════════════════════════════════════════
    const sheet = workbook.addWorksheet("Iniciativas", { pageSetup });

    writeSheetHeader(sheet, fechaDesde, fechaHasta, "J", "Reporte de Iniciativas");

    // ── 4. Tabla de Iniciativas (desde fila 5) ────────────────────────────
    const INICIATIVAS_HEADER_ROW = 5;
    const headerRow = sheet.getRow(INICIATIVAS_HEADER_ROW);
    headerRow.height = 20;

    const iniciativasHeaders = [
      "ID",
      "Nombre",
      "Fecha Aprobada",
      "Estado",
      "Man Days Reservados",
      "Horas Reservadas",
      "Man Days Consumidos",
      "Horas Consumidas",
      "Man Days Aprobados Disp.",
      "Horas Aprobadas Disp.",
    ];

    iniciativasHeaders.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = {
        bold: true,
        color: { argb: argb(COLOR.white) },
        size: 10,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: argb(COLOR.primary) },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderAll();
    });

    iniciativas.forEach((ini) => {
      const estadoDesc  = ini.estado?.descripcion ?? "";
      const estadoColor = estadoIniciativaColor(estadoDesc);

      const row = sheet.addRow([
        ini.id,
        ini.nombre,
        formatDate(ini.fechaAprobada),
        estadoDesc,
        Number(ini.mandayReservadas ?? 0),
        Number(ini.horasReservadas ?? 0),
        Number(ini.mandayConsumidos ?? 0),
        Number(ini.horasConsumidas ?? 0),
        Number(ini.mandayAprobadasDisponibles ?? 0),
        Number(ini.horasAprobadasDisponibles ?? 0),
      ]);
      row.height = 18;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = borderAll();
        cell.alignment = { vertical: "middle" };
        if (colNumber > 1) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
      });

      // Alternate row fill
      const rowIndex = row.number;
      if ((rowIndex - INICIATIVAS_HEADER_ROW) % 2 === 0) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: argb(COLOR.primaryLight) },
          };
        });
      }

      // Color de estado (columna 4)
      if (estadoColor) {
        const estadoCell = row.getCell(4);
        estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(estadoColor) } };
        estadoCell.font = { bold: true, color: { argb: argb(COLOR.white) }, size: 10 };
        estadoCell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });

    // ── 5. Tabla Resumen de Totales ───────────────────────────────────────
    const lastDataRow = sheet.lastRow?.number ?? INICIATIVAS_HEADER_ROW;
    const RESUMEN_TITLE_ROW = lastDataRow + 3;

    // Título del resumen
    const resumenTitleCell = sheet.getCell(`A${RESUMEN_TITLE_ROW}`);
    resumenTitleCell.value = "Resumen de Totales";
    resumenTitleCell.font = {
      bold: true,
      size: 13,
      color: { argb: argb(COLOR.primary) },
    };
    sheet.mergeCells(`A${RESUMEN_TITLE_ROW}:C${RESUMEN_TITLE_ROW}`);

    // Header resumen
    const RESUMEN_HEADER_ROW = RESUMEN_TITLE_ROW + 1;
    const resumenHeaders = ["Concepto", "Man Days", "Horas"];
    resumenHeaders.forEach((h, i) => {
      const cell = sheet.getCell(RESUMEN_HEADER_ROW, i + 1);
      cell.value = h;
      cell.font = {
        bold: true,
        color: { argb: argb(COLOR.white) },
        size: 11,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: argb(COLOR.primary) },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderAll();
    });

    // Filas del resumen
    const resumenRows: Array<{
      concepto: string;
      mandays: number;
      horas: number;
      bold?: boolean;
      bgColor?: string;
      textColor?: string;
    }> = [
      {
        concepto: "Consumidos",
        mandays: totales.mandayConsumidas,
        horas: totales.horasConsumidas,
      },
      {
        concepto: "Aprobados Disponibles",
        mandays: totales.mandayAprobadasDisponibles,
        horas: totales.horasAprobadasDisponibles,
      },
      {
        concepto: "Reservados",
        mandays: totales.mandayReservadas,
        horas: totales.horasReservadas,
        bold: true,
        bgColor: COLOR.secondaryLight,
      },
      {
        concepto: "Disponibles",
        mandays: totales.mandayDisponibles,
        horas: totales.horasDisponibles,
      },
      {
        concepto: "Contratados",
        mandays: totales.bolsaMandayContratados,
        horas: totales.bolsaHorasContratadas,
        bold: true,
        bgColor: COLOR.primary,
        textColor: COLOR.white,
      },
    ];

    resumenRows.forEach((rowData, idx) => {
      const rowNum = RESUMEN_HEADER_ROW + 1 + idx;
      const cells = [rowData.concepto, rowData.mandays, rowData.horas];
      cells.forEach((val, i) => {
        const cell = sheet.getCell(rowNum, i + 1);
        cell.value = val;
        cell.font = {
          bold: rowData.bold ?? false,
          color: { argb: argb(rowData.textColor ?? COLOR.black) },
          size: 10,
        };
        if (rowData.bgColor) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: argb(rowData.bgColor) },
          };
        }
        cell.alignment = {
          horizontal: i === 0 ? "left" : "right",
          vertical: "middle",
        };
        cell.border = borderAll();
      });
    });

    // ── 6. Imagen del chart ───────────────────────────────────────────────
    const CHART_START_ROW = RESUMEN_HEADER_ROW + resumenRows.length + 1 + 2; // 2 filas de espacio

    if (chartImageBase64) {
      const imageId = workbook.addImage({
        base64: chartImageBase64,
        extension: "png",
      });

      sheet.addImage(imageId, {
        tl: { col: 0, row: CHART_START_ROW - 1 },
        ext: { width: 480, height: 320 },
      });
    }

    // ── 7. Ajuste de ancho de columnas ────────────────────────────────────
    const colWidths = [6, 36, 16, 24, 22, 18, 22, 18, 26, 24];
    colWidths.forEach((w, i) => {
      sheet.getColumn(i + 1).width = w;
    });

    // ═══════════════════════════════════════════════════════════════════════
    //  HOJA 2 — BOLSAS DE HORAS
    // ═══════════════════════════════════════════════════════════════════════
    const sheetBolsas = workbook.addWorksheet("Bolsas de Horas", { pageSetup });

    writeSheetHeader(sheetBolsas, fechaDesde, fechaHasta, "G", "Bolsas de Horas");

    const BOLSAS_HEADER_ROW = 5;
    const bolsasHeaderRow = sheetBolsas.getRow(BOLSAS_HEADER_ROW);
    bolsasHeaderRow.height = 20;

    const bolsasHeaders = [
      "ID",
      "Nombre Bolsa",
      "Fecha Inicio",
      "Fecha Fin",
      "Man Days Contratados",
      "Horas Contratadas",
      "Estado",
    ];

    bolsasHeaders.forEach((h, i) => {
      const cell = bolsasHeaderRow.getCell(i + 1);
      cell.value = h;
      cell.font  = { bold: true, color: { argb: argb(COLOR.white) }, size: 10 };
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: argb(COLOR.primary) } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderAll();
    });

    bolsas.forEach((bolsa) => {
      const estadoDesc  = bolsa.estado?.descripcion ?? "";
      const estadoColor = estadoBolsaColor(estadoDesc);

      const row = sheetBolsas.addRow([
        bolsa.idBolsa,
        bolsa.nombreBolsa,
        formatDate(bolsa.fechaInicio),
        formatDate(bolsa.fechaFin),
        Number(bolsa.mandayContratados ?? 0),
        Number(bolsa.horasContratadas ?? 0),
        estadoDesc,
      ]);
      row.height = 18;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border    = borderAll();
        cell.alignment = { vertical: "middle" };
        if (colNumber === 5 || colNumber === 6) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
      });

      // Alternate row fill
      const isAlt = (row.number - BOLSAS_HEADER_ROW) % 2 === 0;
      if (isAlt) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(COLOR.primaryLight) } };
        });
      }

      // Color de estado (columna 7)
      if (estadoColor) {
        const estadoCell = row.getCell(7);
        estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(estadoColor) } };
        estadoCell.font = { bold: true, color: { argb: argb(COLOR.white) }, size: 10 };
        estadoCell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });

    // Ajuste de ancho columnas bolsas
    [6, 36, 16, 16, 22, 18, 22].forEach((w, i) => {
      sheetBolsas.getColumn(i + 1).width = w;
    });

    // ── 8. Generar buffer ─────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export default new ExportService();
