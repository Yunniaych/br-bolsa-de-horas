import {
  Component,
  input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { totales } from '../../../core/models/iniciativa-model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-graficas',
  templateUrl: './graficas.html',
  styleUrls: ['./graficas.scss'],
})
export class Graficas implements AfterViewInit {
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  pieChartData = input<totales | null>();
  lineChartData = input<{ mes: string; horas: number }[] | null>();

  private chart?: Chart;
  private lineChart?: Chart;

  constructor() {
    effect(() => {
      const currentData = this.pieChartData();
      const lineData = this.lineChartData();
      // debug logs removed

      if (currentData) {
        if (this.chart) {
          this.updateChartData(currentData);
        } else if (this.pieChartCanvas?.nativeElement) {
          this.createPieChart(currentData);
        }
      }

      if (lineData) {
        if (this.lineChart) {
          this.lineChart.data.labels = lineData.map((d) => d.mes);
          (this.lineChart.data.datasets[0].data as number[]) = lineData.map(
            (d) => d.horas,
          );
          this.lineChart.update();
        } else if (this.lineChartCanvas?.nativeElement && lineData.length > 0) {
          this.createLineChart(lineData);
        }
      }
    });
  }

  ngAfterViewInit() {
    const currentData = this.pieChartData();
    // debug logs removed
    if (
      currentData &&
      this.pieChartCanvas &&
      this.pieChartCanvas.nativeElement
    ) {
      this.createPieChart(currentData);
    }
    const lineData = this.lineChartData();
    // debug logs removed
    if (
      lineData &&
      lineData.length > 0 &&
      this.lineChartCanvas &&
      this.lineChartCanvas.nativeElement
    ) {
      this.createLineChart(lineData);
    }
  }

  hasData(): boolean {
    const pieData = this.pieChartData();
    const lineData = this.lineChartData();

    const hasPieData =
      pieData &&
      ((pieData.horasDisponibles ?? 0) !== 0 ||
        (pieData.horasConsumidas ?? 0) !== 0 ||
        (pieData.horasAprobadasDisponibles ?? 0) !== 0);
    if (!hasPieData && (!lineData || lineData.length === 0)) {
      return false;
    }
    // Mostrar mensaje si todos los valores son cero
    const allPieZero =
      pieData &&
      (pieData.horasDisponibles ?? 0) === 0 &&
      (pieData.horasConsumidas ?? 0) === 0 &&
      (pieData.horasAprobadasDisponibles ?? 0) === 0;
    const allLineZero =
      lineData &&
      lineData.length > 0 &&
      lineData.every((d) => (d.horas ?? 0) === 0);
    if (allPieZero && (allLineZero || !lineData || lineData.length === 0))
      return false;
    return true;
  }

  createPieChart(totales: totales) {
    if (!this.pieChartCanvas || !this.pieChartCanvas.nativeElement) return;
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      try {
        this.chart.destroy();
      } catch (e) {
        console.warn('[graficas] error destroying existing pie chart', e);
      }
      this.chart = undefined;
    }

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: [
          'Horas Disponibles',
          'Horas Consumidas',
          'Horas Aprobadas Disponibles',
        ],
        datasets: [
          {
            data: [
              totales.horasDisponibles,
              totales.horasConsumidas,
              totales.horasAprobadasDisponibles,
            ],
            backgroundColor: [
              '#01AFF1',
              '#F7941F',
              '#264D72',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = (context.label as string) || '';
                const raw = (context.parsed as any) ?? 0;
                const value =
                  typeof raw === 'number' ? raw : Number((raw as any).y ?? raw);
                const total = ((context.dataset.data as any[]) || []).reduce(
                  (a: number, b: any) => a + (Number(b) || 0),
                  0,
                );
                if (!total || total === 0)
                  return `${label}: ${Number(value).toFixed(2)} hrs (0.0%)`;
                const percentage = ((Number(value) / total) * 100).toFixed(1);
                return `${label}: ${Number(value).toFixed(2)} hrs (${percentage}%)`;
              },
            },
          },
          datalabels: {
            color: '#fff',
            font: {
              size: 16,
              weight: 'bold' as const,
            },
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            formatter: (value: number, context: any) => {
              const total = (
                context.chart.data.datasets[0].data as number[]
              ).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
              if (!total || total === 0) return '0.0%';
              const percentage = ((Number(value) / total) * 100).toFixed(1);
              return `${percentage}%`;
            },
          },
        },
      },
    };

    // debug logs removed
    this.chart = new Chart(ctx, config);
    try {
      this.chart.update();
    } catch (e) {
      console.warn('[graficas] pie chart update error', e);
    }
  }

  updateChartData(totales: totales) {
    if (!this.chart) return;
    const data = [
      totales.horasDisponibles,
      totales.horasConsumidas,
      totales.horasAprobadasDisponibles,
    ];
    // debug logs removed
    this.chart.data.datasets[0].data = data as any;
    try {
      this.chart.update();
    } catch (e) {
      console.warn('[graficas] updateChartData error', e);
    }
  }

  createLineChart(monthlyData: { mes: string; horas: number }[]) {
    if (!this.lineChartCanvas || !this.lineChartCanvas.nativeElement) return;
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.lineChart) {
      try {
        this.lineChart.destroy();
      } catch (e) {
        console.warn('[graficas] error destroying existing line chart', e);
      }
      this.lineChart = undefined;
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: monthlyData.map((d) => d.mes),
        datasets: [
          {
            label: 'Horas Reservadas',
            data: monthlyData.map((d) => d.horas),
            borderColor: '#264D72',
            backgroundColor: 'rgba(38, 77, 114, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#264D72',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              padding: 15,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const parsed = context.parsed as any;
                const val =
                  parsed && (parsed.y ?? parsed) ? (parsed.y ?? parsed) : 0;
                const value = Number(val) || 0;
                return `${context.dataset.label}: ${value.toFixed(2)} hrs`;
              },
            },
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Horas',
              font: {
                size: 14,
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    // debug logs removed
    this.lineChart = new Chart(ctx, config);
    try {
      this.lineChart.update();
    } catch (e) {
      console.warn('[graficas] line chart update error', e);
    }
  }

  // debug helper removed
}
