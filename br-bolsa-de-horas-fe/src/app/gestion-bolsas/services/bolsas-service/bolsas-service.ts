import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface BolsaHoras {
  idBolsa: number;
  nombreBolsa: string;
  fechaInicio: Date;
  fechaFin: Date;
  horasContratadas: number;
  mandayContratados: number;
  idEstado: number;
  estado?: { idEstado: number; descripcion: string };
}

@Injectable({
  providedIn: 'root',
})
export class BolsasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bolsas`;

  getBolsas(): Observable<BolsaHoras[]> {
    return this.http.get<BolsaHoras[]>(this.apiUrl);
  }

  getBolsaById(idBolsa: number): Observable<BolsaHoras> {
    return this.http.get<BolsaHoras>(`${this.apiUrl}/${idBolsa}`);
  }

  postBolsa(nuevaBolsa: BolsaHoras): Observable<BolsaHoras> {
    return this.http.post<BolsaHoras>(this.apiUrl, nuevaBolsa);
  }

  updateBolsa(updatedBolsa: BolsaHoras): Observable<BolsaHoras> {
    return this.http.put<BolsaHoras>(
      `${this.apiUrl}/${updatedBolsa.idBolsa}`,
      updatedBolsa,
    );
  }

  deleteBolsa(idBolsa: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idBolsa}`);
  }
}
