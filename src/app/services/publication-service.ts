import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PublicationResponse } from '../models/PublicationResponse';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  
  readonly url = 'http://localhost:8080/publicacion';

  constructor(private http: HttpClient) {}
  
  getPublicationById(id : string){
    return this.http.get<PublicationResponse>(`${this.url}/${id}`);
  }
  getPublications(){
    return this.http.get<PublicationResponse[]>(`${this.url}/tienda`);
  }
  getUserPublications(){
    return this.http.get<PublicationResponse[]>(`${this.url}/usados`)
  }
  createPublication(publicacion: import('../models/PublicationRequest').PublicationRequest, files: File[]) {
    const formData = new FormData();
    formData.append('publicacion', JSON.stringify(publicacion));
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    return this.http.post<PublicationResponse>(`${this.url}/crearPublicacion`, formData);
  }
}
