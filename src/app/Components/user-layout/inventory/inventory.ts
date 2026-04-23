import { Component, OnInit } from '@angular/core';
import { PublicationResponse } from '../../../models/PublicationResponse';
import { PublicationService } from '../../../services/publication-service';

@Component({
  selector: 'app-inventory',
  imports: [],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit{

  publications: PublicationResponse[] = [];
  constructor(private publicationService: PublicationService){

  }

  ngOnInit(): void {
    this.getPublications()
  }

  getPublications(){
    this.publicationService.getPublications().subscribe({
      next:(data) =>{this.publications = data
        console.log(data)
      },
      error:(e) => {console.log(e)}
    })
  }

}
