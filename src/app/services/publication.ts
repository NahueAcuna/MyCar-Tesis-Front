import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Publication {
  
  readonly url = 'http://localhost:8080/publication';

  constructor(private http: HttpClient) {}
  
  getPublicationById(id : string){
    return this.http.get(`${this.url}/${id}`);
  }
}
