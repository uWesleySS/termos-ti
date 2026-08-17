import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Termo } from '../models/termo';

@Injectable({
  providedIn: 'root'
})
export class TermoApiService {
  private readonly apiUrl = 'http://localhost:3000/termos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Termo[]> {
    return this.http.get<Termo[]>(this.apiUrl);
  }

  criar(termo: Termo): Observable<Termo> {
    return this.http.post<Termo>(this.apiUrl, termo);
  }
}