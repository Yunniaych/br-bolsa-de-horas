import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iniciativaModel, totales } from '../../core/models/iniciativa-model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IniciativaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/iniciativas`;
  private totalesUrl = `${environment.apiUrl}/totales`;

  getIniciativas(): Observable<iniciativaModel[]> {
    return this.http.get<iniciativaModel[]>(this.apiUrl);
  }

  postIniciativa(
    nuevaIniciativa: iniciativaModel,
  ): Observable<iniciativaModel> {
    return this.http.post<iniciativaModel>(this.apiUrl, nuevaIniciativa);
  }

  deleteIniciativa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateIniciativa(
    updatedIniciativa: iniciativaModel,
  ): Observable<iniciativaModel> {
    return this.http.put<iniciativaModel>(
      `${this.apiUrl}/${updatedIniciativa.id}`,
      updatedIniciativa,
    );
  }

  getIniciativaById(id: number): Observable<iniciativaModel> {
    return this.http.get<iniciativaModel>(`${this.apiUrl}/${id}`);
  }

  getTotales(): Observable<totales> {
    return this.http.get<totales>(`${this.totalesUrl}`);
  }

  /**
   * Obtener totales calculados en tiempo real para un rango de fechas.
   * @param fechaInicio Fecha inicio (YYYY-MM-DD). Opcional: si falta, el backend infiere el registro más antiguo.
   * @param fechaFin    Fecha fin (YYYY-MM-DD). Opcional: si falta, el backend infiere la fecha actual.
   */
  getTotalesPorFecha(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<totales> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<totales>(`${this.totalesUrl}/por-fecha`, { params });
  }

  getHorasPorMes(): Observable<{ mes: string; horas: number }[]> {
    return this.http.get<{ mes: string; horas: number }[]>(
      `${this.apiUrl}/horas-por-mes`,
    );
  }
}
