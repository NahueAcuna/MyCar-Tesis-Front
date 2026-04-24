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
  descriptionPreview(text:string| undefined){
    if(!text){
      return ''
    }
    const words = text?.split(' ');
    let i = 0
    let description: string = '';
    while(i < words?.length && i< 4){
      description = description + words.at(i) + ' '
      i++
    }
    return description.trim() + '...'
  }

}
