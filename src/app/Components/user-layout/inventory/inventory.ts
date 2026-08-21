import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../../models/PublicationResponse';
import { PublicationService } from '../../../services/publication-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-inventory',
  standalone: true,
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
  precioMaximo: number = 1000000;
  
  miEmail: string = '';

  // --- ARRAY DE FAVORITOS ---
  misFavoritosIds: number[] = [];

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
  minAnio: FormControl;
  maxAnio: FormControl;
  minPrice: FormControl;
  maxPrice: FormControl;
  minKm: FormControl;
  maxKm: FormControl;

  constructor(private publicationService: PublicationService, public router: Router, public profileService: ProfileService, private authService: AuthService) {
    this.made = new FormControl('');
    this.model = new FormControl('');
    // Reemplazamos 'anio' por un rango
    this.minAnio = new FormControl('', [Validators.min(1950), Validators.max(2026)]);
    this.maxAnio = new FormControl('', [Validators.min(1950), Validators.max(2026)]);
    
    this.minPrice = new FormControl(0, [Validators.min(0)]);
    this.maxPrice = new FormControl(1000000, [Validators.min(0)]);
    this.minKm = new FormControl('', [Validators.min(0)]);
    this.maxKm = new FormControl('', [Validators.min(0)]);

    this.filtersForm = new FormGroup({
      made: this.made,
      model: this.model,
      minAnio: this.minAnio, 
      maxAnio: this.maxAnio, 
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minKm: this.minKm,
      maxKm: this.maxKm
    }, { validators: [this.rangoKmValidator, this.rangoAnioValidator] }); // Agregamos ambos validadores
  }

  ngOnInit(): void {
    this.getPublications();
    this.cargarFavoritos();
    
    const usuarioActual = this.authService.getUser();
    if (usuarioActual && usuarioActual.email) {
      this.miEmail = usuarioActual.email;
    }
  }

  // --- VALIDADORES PERSONALIZADOS ---
  rangoKmValidator(control: AbstractControl): ValidationErrors | null {
    const min = control.get('minKm')?.value;
    const max = control.get('maxKm')?.value;
  
    if (min !== null && max !== null && min !== '' && max !== '') {
      if (min > max) {
        return { rangoKmInvalido: true };
      }
    }
    return null;
  }

  rangoAnioValidator(control: AbstractControl): ValidationErrors | null {
    const min = control.get('minAnio')?.value;
    const max = control.get('maxAnio')?.value;
  
    if (min !== null && max !== null && min !== '' && max !== '') {
      if (min > max) {
        return { rangoAnioInvalido: true };
      }
    }
    return null;
  }

  getPublications() {
    this.publicationService.getPublications().subscribe({
      next: (data) => {
        this.publications = data;
        this.filteredPublications = data;
        
        // Limpiamos los arrays para evitar basura
        this.mades = [];
        this.models = [];

        data.forEach(p => {
          const marcaLimpia = p.auto.marca.trim();
          const modeloLimpio = p.auto.modelo.trim();

          // Evitar marcas duplicadas por mayúsculas o espacios
          const marcaExiste = this.mades.some(m => m.toLowerCase() === marcaLimpia.toLowerCase());
          if (!marcaExiste && marcaLimpia !== '') {
            this.mades.push(marcaLimpia);
          }
          
          // Evitar modelos duplicados
          const modeloExiste = this.models.some(m => m.toLowerCase() === modeloLimpio.toLowerCase());
          if (!modeloExiste && modeloLimpio !== '') {
            this.models.push(modeloLimpio);
          }
        });

        // Ordenamos alfabéticamente
        this.mades.sort();
        this.models.sort();
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

  getImageUrl(url: string): string {
    if (!url) return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8080' + url;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%231a1a1a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20fill%3D%22%23ff8c00%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3ESin%20Imagen%3C%2Ftext%3E%3C%2Fsvg%3E';
    img.onerror = null;
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
    const url = this.router.serializeUrl(this.router.createUrlTree(['publicacion', id]));
    window.open(url, '_blank');
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

      // --- FILTRO DE RANGO DE AÑO ---
      if (filters.minAnio != null && filters.minAnio !== "" && car.anio < filters.minAnio) {
        return false;
      }
      if (filters.maxAnio != null && filters.maxAnio !== "" && car.anio > filters.maxAnio) {
        return false;
      }

      // --- FILTRO DE KILOMETRAJE ---
      if (filters.minKm != null && filters.minKm !== "" && car.km < filters.minKm) {
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
      minAnio: '',
      maxAnio: '',
      minPrice: 0,
      maxPrice: 1000000,
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
}