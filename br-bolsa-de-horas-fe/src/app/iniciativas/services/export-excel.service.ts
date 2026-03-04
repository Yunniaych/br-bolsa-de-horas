import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { totales } from '../../core/models/iniciativa-model';
import { IniciativaService } from './iniciativa-service';
import { environment } from '../../../environments/environment';

Chart.register(...registerables, ChartDataLabels);

export interface ExportFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  /** Totales ya cargados en pantalla — se usan para el chart y se evita re-calcular con otro endpoint */
  totalesParaChart?: totales;
}

@Injectable({
  providedIn: 'root',
})
export class ExportExcelService {
  private http = inject(HttpClient);
  private iniciativaService = inject(IniciativaService);
  private exportUrl = `${environment.apiUrl}/export/excel`;

  /**
   * Genera y descarga el reporte Excel.
   * @param filtros { fechaDesde: 'YYYY-MM-DD', fechaHasta: 'YYYY-MM-DD' }
   */
  async exportar(filtros: ExportFiltros): Promise<void> {
    // 1. Totales para el chart — usar los ya cargados en pantalla para que
    //    coincidan exactamente con la gráfica visible (mismo endpoint que el dashboard).
    let totalesData: totales;
    if (filtros.totalesParaChart) {
      totalesData = filtros.totalesParaChart;
    } else if (filtros.fechaDesde || filtros.fechaHasta) {
      totalesData = await firstValueFrom(
        this.iniciativaService.getTotalesPorFecha(
          filtros.fechaDesde,
          filtros.fechaHasta,
        ),
      );
    } else {
      totalesData = await firstValueFrom(this.iniciativaService.getTotales());
    }

    // 2. Generar imagen del doughnut chart
    const chartImage = await this.generateChartImage(totalesData);

    // 3. POST al backend — fechas opcionales
    const body: Record<string, unknown> = { chartImage };
    if (filtros.fechaDesde) body['fechaDesde'] = filtros.fechaDesde;
    if (filtros.fechaHasta) body['fechaHasta'] = filtros.fechaHasta;

    const blob = await firstValueFrom(
      this.http.post(this.exportUrl, body, { responseType: 'blob' }),
    );

    // 4. Descargar el archivo con nombre reporte_bolsa_horas_DD_MM_YYYY.xlsx
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const filename = `reporte_bolsa_horas_${dd}_${mm}_${yyyy}.xlsx`;

    this.downloadBlob(blob, filename);
  }

  // ──────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────────────────────

  /**
   * Genera un doughnut chart con Chart.js en un canvas oculto
   * y devuelve el base64 de la imagen (sin prefijo data:image/png;base64,).
   */
  private generateChartImage(data: totales): Promise<string> {
    return new Promise((resolve, reject) => {
      // Canvas oculto fuera del viewport
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 380;
      canvas.style.position = 'absolute';
      canvas.style.top = '-9999px';
      canvas.style.left = '-9999px';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        document.body.removeChild(canvas);
        reject(new Error('No se pudo obtener el contexto 2D del canvas'));
        return;
      }

      const horasDisponibles = data.horasDisponibles ?? 0;
      const horasConsumidas = data.horasConsumidas ?? 0;
      const horasAprobadasDisponibles = data.horasAprobadasDisponibles ?? 0;
      const total =
        horasDisponibles + horasConsumidas + horasAprobadasDisponibles;

      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [
            'Horas Disponibles',
            'Horas Consumidas',
            'Horas Aprobadas Disponibles',
          ],
          datasets: [
            {
              data: [
                horasDisponibles,
                horasConsumidas,
                horasAprobadasDisponibles,
              ],
              backgroundColor: ['#264D72', '#F7941F', '#01AFF1'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 },
              },
            },
            tooltip: { enabled: false },
            datalabels: {
              color: '#fff',
              font: {
                size: 14,
                weight: 'bold' as const,
              },
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderRadius: 4,
              padding: { top: 2, bottom: 2, left: 4, right: 4 },
              formatter: (value: number) => {
                if (!total || total === 0) return '0.0%';
                return `${((value / total) * 100).toFixed(1)}%`;
              },
            },
          },
        },
      });

      // Esperar 300ms para asegurar el renderizado completo
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          // Extraer solo el base64 sin el prefijo data:image/png;base64,
          const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
          chart.destroy();
          document.body.removeChild(canvas);
          resolve(base64);
        } catch (err) {
          chart.destroy();
          document.body.removeChild(canvas);
          reject(err);
        }
      }, 300);
    });
  }

  /** Descarga un Blob como archivo. */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Limpiar después de un breve delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 200);
  }
}
