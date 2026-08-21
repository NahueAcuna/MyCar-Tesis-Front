import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PublicationResponse } from '../../models/PublicationResponse';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PublicationService } from '../../services/publication-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../Components/user-layout/header/header';
import { ProfileService } from '../../services/profile-service';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css',
})
export class Marketplace implements OnInit {

  isSearchShowed: Boolean = false;

  publications: PublicationResponse[] = [];
  filteredPublications: PublicationResponse[] = [];

  mades: string[] = [];
  models: string[] = [];

  precioMinimo: number = 0;
  precioMaximo: number = 1000000;

  miEmail: string = '';
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

  constructor(private publicationService: PublicationService, public router: Router, private profileService: ProfileService, private authService: AuthService, private toast: ToastService) {
    this.made = new FormControl('');
    this.model = new FormControl('');
    
    // Rango de años
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
    }, { validators: [this.rangoKmValidator, this.rangoAnioValidator] });
  }

  ngOnInit(): void {
    this.getPublications();

    if(this.authService.isLoggedIn()){
      this.cargarFavoritos();

      const usuarioActual = this.authService.getUser();
      if (usuarioActual && usuarioActual.email) {
        this.miEmail = usuarioActual.email;
      }
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
    // ATENCIÓN: Acá usamos getUserPublications() como lo tenías originalmente en Marketplace
    this.publicationService.getUserPublications().subscribe({
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

  switchSearchView() {
    this.isSearchShowed = !this.isSearchShowed;

    if (this.isSearchShowed) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    }
  }

  carDetail(id: number) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['publicacion', id], { queryParams: { origen: 'marketplace' } }));
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

  getImageUrl(url: string): string {
    if (!url){
      return 'assets/no-image.png';
    }

    if (url.startsWith('http')) {
      return url;
    }

    return 'http://localhost:8080' + url;
  }

  // --- MÉTODOS DE FAVORITOS ---
  cargarFavoritos() {
    this.profileService.getFavoritos().subscribe({
      next: (data) => {
        this.misFavoritosIds = data.map((pub: any) => Number(pub.id));
      },
      error: (err) => console.error("Error al cargar favoritos", err)
    });
  }

  toggleFavorito(idPublicacion: number) {
    
    if (!this.authService.isLoggedIn()) {
      this.toast.warning('Tiene que estar registrado en la página para agregar a favoritos.');
      return;
    }
    
    const id = Number(idPublicacion);
    const yaEraFavorito = this.misFavoritosIds.includes(id);

    if (yaEraFavorito) {
      this.misFavoritosIds = this.misFavoritosIds.filter(favId => favId !== id);
    } else {
      this.misFavoritosIds = [...this.misFavoritosIds, id];
    }

    this.profileService.toggleFavorito(idPublicacion).subscribe({
      next: () => {
        console.log("Favorito guardado en BD con éxito");
      },
      error: (err) => {
        console.error("Error al modificar favorito, revirtiendo color...", err);
        if (yaEraFavorito) {
          this.misFavoritosIds = [...this.misFavoritosIds, id];
        } else {
          this.misFavoritosIds = this.misFavoritosIds.filter(favId => favId !== id);
        }
      }
    });
  }

  esFavorito(idPub: any): boolean {
    return this.misFavoritosIds.includes(Number(idPub));
  }
}