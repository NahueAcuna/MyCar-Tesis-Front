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
}
