import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Estado = {
  idEstado: number;
  descripcion: string;
};

@Injectable({ providedIn: 'root' })
export class EstadosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/estados`;

  private _cacheIniciativas: Estado[] | null = null;
  private _cacheBolsas: Estado[] | null = null;

  getEstadosIniciativa(): Observable<Estado[]> {
    if (this._cacheIniciativas) {
      return of(this._cacheIniciativas);
    }
    return new Observable<Estado[]>((observer) => {
      this.http.get<Estado[]>(`${this.apiUrl}/iniciativas`).subscribe(
        (estados) => {
          this._cacheIniciativas = estados;
          observer.next(estados);
          observer.complete();
        },
        (err) => observer.error(err),
      );
    });
  }

  getEstadosBolsa(): Observable<Estado[]> {
    if (this._cacheBolsas) {
      return of(this._cacheBolsas);
    }
    return new Observable<Estado[]>((observer) => {
      this.http.get<Estado[]>(`${this.apiUrl}/bolsas`).subscribe(
        (estados) => {
          this._cacheBolsas = estados;
          observer.next(estados);
          observer.complete();
        },
        (err) => observer.error(err),
      );
    });
  }
}
