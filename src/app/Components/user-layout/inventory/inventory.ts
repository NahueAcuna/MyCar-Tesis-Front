import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../../models/PublicationResponse';
import { PublicationService } from '../../../services/publication-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {

  isSearchShowed: Boolean = false;

  publications: PublicationResponse[] = [];
  filteredPublications: PublicationResponse[] = [];

  mades: string[] = [];
  models: string[] = [];

  precioMinimo: number = 0;
  precioMaximo: number = 50000;

  // --- VARIABLES DE PAGINACIÓN ---
  currentPage: number = 1; 
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
<<<<<<< Updated upstream
    this.minPrice = new FormControl(0);
    this.maxPrice = new FormControl(50000);
    this.minKm = new FormControl('');
    this.maxKm = new FormControl('');
=======
    this.anio = new FormControl('', [Validators.min(1950), Validators.max(2026)]);
    this.minPrice = new FormControl(0, [Validators.min(0)]);
    this.maxPrice = new FormControl(1000000, [Validators.min(0)]);
    this.minKm = new FormControl('', [Validators.min(0)]);
    this.maxKm = new FormControl('', [Validators.min(0)]);
>>>>>>> Stashed changes

    this.filtersForm = new FormGroup({
      made: this.made,
      model: this.model,
      anio: this.anio, 
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minKm: this.minKm,
      maxKm: this.maxKm
    }, { validators: this.rangoKmValidator });
  }

  ngOnInit(): void {
    this.getPublications();
  }

  // --- VALIDADOR PERSONALIZADO ---
  rangoKmValidator(control: AbstractControl): ValidationErrors | null {
    const min = control.get('minKm')?.value;
    const max = control.get('maxKm')?.value;
  
    if (min !== null && max !== null && min !== '' && max !== '') {
      if (min > max) {
        return { rangoInvalido: true };
      }
    }
    return null;
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
      this.currentPage = 1; 
      return;
    }

    this.filteredPublications = this.publications.filter(pub => {
      const fullAutoName = `${pub.auto.marca} ${pub.auto.modelo}`.toLowerCase();
      return fullAutoName.includes(query);
    });
    
    this.currentPage = 1; 
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

      if (filters.minKm != null && filters.minKm !== "" && car.km < filters.minKm) {
        return false;
      }
      if (filters.anio != null && filters.anio !== "" && car.anio < filters.anio) {
        return false;
      }

      if (filters.maxKm != null && filters.maxKm !== "" && car.km > filters.maxKm) {
        return false;
      }
      return true;
    });
    
    this.currentPage = 1;
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
    this.precioMinimo = 0;
    this.precioMaximo = 1000000;
    this.filteredPublications = [...this.publications];
    this.currentPage = 1; 
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

<<<<<<< Updated upstream
=======
  // --- LÓGICA DE FAVORITOS ---
  cargarFavoritos() {
    this.profileService.getFavoritos().subscribe({
      next: (data) => {
        this.misFavoritosIds = data.map((pub: any) => Number(pub.id));
      },
      error: (err) => console.error("Error al cargar favoritos", err)
    });
  }

  toggleFavorito(idPublicacion: any) {
    const id = Number(idPublicacion);
    const yaEraFavorito = this.misFavoritosIds.includes(id);

    if (yaEraFavorito) {
      this.misFavoritosIds = this.misFavoritosIds.filter(favId => favId !== id);
    } else {
      this.misFavoritosIds = [...this.misFavoritosIds, id];
    }

    this.profileService.toggleFavorito(id).subscribe({
      next: () => console.log("¡Favorito actualizado en la BD!"),
      error: (err) => {
        console.error("Error al modificar favorito, revirtiendo...", err);
        if (yaEraFavorito) {
          this.misFavoritosIds = [...this.misFavoritosIds, id];
        } else {
          this.misFavoritosIds = this.misFavoritosIds.filter(favId => favId !== id);
        }
      }
    });
  }

  esFavorito(idPublicacion: any): boolean {
    return this.misFavoritosIds.includes(Number(idPublicacion));
  }
>>>>>>> Stashed changes
}