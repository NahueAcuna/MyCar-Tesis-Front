import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../../models/PublicationResponse';
import { PublicationService } from '../../../services/publication-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
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

  filtersForm: FormGroup;

  made: FormControl;
  model: FormControl;
  minPrice: FormControl;
  maxPrice: FormControl;
  minKm: FormControl;
  maxKm: FormControl;


  constructor(private publicationService: PublicationService, public router : Router){
    this.made = new FormControl('');
    this.model = new FormControl('');
    this.minPrice = new FormControl(0);
    this.maxPrice = new FormControl(50000);
    this.minKm = new FormControl('');
    this.maxKm = new FormControl('');

    this.filtersForm = new FormGroup({
      made: this.made,
      model: this.model,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minKm: this.minKm,
      maxKm: this.maxKm
    })
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
applyFilters() {
  const filters = this.filtersForm.value;

  this.filteredPublications = this.publications.filter(p => {
    const car = p.auto;

    if (filters.made && car.marca.toLowerCase() !== filters.made.toLowerCase()) {
      return false; 
    }
   
    if (filters.model && car.modelo.toLowerCase() !== filters.model.toLowerCase()) {
      return false;
    }
    
    if (filters.minPrice != null && car.precio < filters.minPrice) {
      console.log(filters.minPrice)
      console.log("auto: " + car.precio)

      return false;
    }
    
    if (filters.maxPrice != null && car.precio > filters.maxPrice) {
      console.log("hola")

      return false;
    }

    if (filters.minKm != null && car.km < filters.minKm) {
      console.log("hola")
      return false;
    }

    if (filters.maxKm != null && filters.maxKm != "" && car.km > filters.maxKm) {
      console.log("hola")
      return false;
    }
    return true; 
  });
  console.log(this.filteredPublications)
}

}