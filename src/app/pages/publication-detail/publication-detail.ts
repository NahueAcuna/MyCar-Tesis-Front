import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicationService } from '../../services/publication-service';
import { PublicationResponse } from '../../models/PublicationResponse';

@Component({
  selector: 'app-publication-detail',
  imports: [],
  templateUrl: './publication-detail.html',
  styleUrl: './publication-detail.css',
})
export class PublicationDetail implements OnInit{
  
  publicationSelected!: PublicationResponse;

  constructor(public publicationService: PublicationService, private route: ActivatedRoute){}

  ngOnInit(): void {
    const idPublication = this.route.snapshot.params['id']
    this.getPublicationById(idPublication);
  }

  getPublicationById(id: string){
    this.publicationService.getPublicationById(id).subscribe({
      next: (data) => {this.publicationSelected = data},
      error: () => alert('Se produjo un error al mostrar la lista de publicaciones.')
    })
  }
}
