import { Component, ElementRef, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../models/PublicationResponse';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PublicationService } from '../../services/publication-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../Components/user-layout/header/header';

@Component({
  selector: 'app-marketplace',
  imports: [CommonModule,ReactiveFormsModule,Header],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css',
})
export class Marketplace {

  isSearchShowed: Boolean = false;

  publications: PublicationResponse[] = [];
  filteredPublications: PublicationResponse[] = [];

  mades: string[] = [];
  models: string[] = [];

  precioMinimo: number = 0;
  precioMaximo: number = 50000;

  // --- VARIABLES DE PAGINACIÓN ---
  currentPage: number = 1; // Cambiado a 1 para que arranque en la primer página
  itemsPerPage: number = 6;

  // --- GETTERS DE PAGINACIÓN ---
  get totalPages(): number {
    return Math.ceil(this.filteredPublications.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return this.currentPage * this.itemsPerPage;
  }

  @ViewChild('searchInput') searchInput!: ElementRef;

  filtersForm: FormGroup;

  made: FormControl;
  model: FormControl;
  anio: FormControl;
  minPrice: FormControl;
  maxPrice: FormControl;
  minKm: FormControl;
  maxKm: FormControl;

  constructor(private publicationService: PublicationService, public router: Router) {
    this.made = new FormControl('');
    this.model = new FormControl('');
    this.anio = new FormControl('');
    this.minPrice = new FormControl(0);
    this.maxPrice = new FormControl(50000);
    this.minKm = new FormControl('');
    this.maxKm = new FormControl('');

    this.filtersForm = new FormGroup({
      made: this.made,
      model: this.model,
       anio: this.anio,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minKm: this.minKm,
      maxKm: this.maxKm
    });
  }

  ngOnInit(): void {
    this.getPublications();
  }

  getPublications() {
    this.publicationService.getPublications().subscribe({
      next: (data) => {
        this.publications = data;
        this.filteredPublications = data;
        
        data.forEach(p => {
          // Si la marca NO está en el arreglo, la agrego
          if (!this.mades.includes(p.auto.marca)) {
            this.mades.push(p.auto.marca);
          }
          
          // Si el modelo NO está en el arreglo, lo agrego
          if (!this.models.includes(p.auto.modelo)) {
            this.models.push(p.auto.modelo);
          }
        });
      }
    });
  }

  descriptionPreview(text: string | undefined) {
    if (!text) {
      return '';
    }
    const words = text?.split(' ');
    let i = 0
    let description: string = '';
    while (i < words?.length && i < 4) {
      description = description + words.at(i) + ' ';
      i++;
    }
    return description.trim() + '...';
  }

  switchSearchView() {
    this.isSearchShowed = !this.isSearchShowed;

    if (this.isSearchShowed) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    }
  }

  carDetail(id: number) {
    this.router.navigate(['publicacion', id]);
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase().trim();

    if (!query) {
      this.filteredPublications = [...this.publications];
      this.currentPage = 1; // Volvemos a la página 1
      return;
    }

    this.filteredPublications = this.publications.filter(pub => {
      const fullAutoName = `${pub.auto.marca} ${pub.auto.modelo}`.toLowerCase();
      return fullAutoName.includes(query);
    });
    
    this.currentPage = 1; // Volvemos a la página 1 al buscar
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
        return false;
      }

      if (filters.maxPrice != null && car.precio > filters.maxPrice) {
        return false;
      }

      if (filters.minKm != null && car.km < filters.minKm) {
        return false;
      }

      if (filters.maxKm != null && filters.maxKm != "" && car.km > filters.maxKm) {
        return false;
      }
      return true;
    });
    
    this.currentPage = 1; // Volvemos a la página 1 al filtrar
  }

  filterCleaner() {
    this.filtersForm.reset({
      made: '',
      model: '',
      minPrice: 0,
      maxPrice: 50000,
      minKm: '',
      maxKm: ''
    });
    this.filteredPublications = [...this.publications];
    this.currentPage = 1; // Volvemos a la página 1 al limpiar
  }

  // --- FUNCIONES DE BOTONES DE PAGINACIÓN ---
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
