import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../../models/PublicationResponse';
import { PublicationService } from '../../../services/publication-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  imports: [FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit{

  isSearchShowed: Boolean = false;

  publications: PublicationResponse[] = [];
  filteredPublications: PublicationResponse[] = [];

  mades: string[] = [];
  models: string[] = [];

  precioMinimo: number = 0;
  precioMaximo: number = 50000;

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private publicationService: PublicationService, public router : Router){

  }

  ngOnInit(): void {
    this.getPublications()
  }

  getPublications(){
  this.publicationService.getPublications().subscribe({
    next: (data) => {
      this.publications = data;
      this.filteredPublications = data; 
      data.forEach(p =>{
       this.mades.push(p.auto.marca);
       this.models.push(p.auto.modelo);
      })
    }
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

  switchSearchView(){
    this.isSearchShowed = !this.isSearchShowed;

    if (this.isSearchShowed) {
      // Usamos un setTimeout para darle tiempo a que termine la animacion 
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100); 
    }
  }

  carDetail(id: number){
    this.router.navigate(['publicacion', id])
  }

  onSearch(event: any) {
  const query = event.target.value.toLowerCase().trim();

  if (!query) {
    this.filteredPublications = [...this.publications];
    return;
  }

  this.filteredPublications = this.publications.filter(pub => {
    const fullAutoName = `${pub.auto.marca} ${pub.auto.modelo}`.toLowerCase(); 
    return fullAutoName.includes(query);
  });
}
actualizarMinimo(event: any) {
  this.precioMinimo = Number(event.target.value);

}

actualizarMaximo(event: any) {
  this.precioMaximo = Number(event.target.value);
}

}