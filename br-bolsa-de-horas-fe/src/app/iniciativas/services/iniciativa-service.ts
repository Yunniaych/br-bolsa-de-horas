import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iniciativaModel, totales } from '../../core/models/iniciativa-model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IniciativaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/iniciativas`;

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
    return this.http.get<totales>(`${environment.apiUrl}/dashboard/totales`);
  }

  getHorasPorMes(): Observable<{ mes: string; horas: number }[]> {
    return this.http.get<{ mes: string; horas: number }[]>(
      `${this.apiUrl}/horas-por-mes`,
    );
  }
}
