// path: src/app/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { JsonResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private url = environment.APIURL;

  // Los headers se manejarán en un interceptor

  delete(query: string, params: any = {}) {
    return this.http.delete<JsonResponse>(`${this.url}${query}`, { params });
  }

  post(query: string, body: any = {}) {
    return this.http.post<JsonResponse>(`${this.url}${query}`, body);
  }

  put(query: string, body: any) {
    return this.http.put<JsonResponse>(`${this.url}${query}`, body);
  }

  get(query: string, params: any = {}) {
    return this.http.get<JsonResponse>(`${this.url}${query}`, { params });
  }
}
