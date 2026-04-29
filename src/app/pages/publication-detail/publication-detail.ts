import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationService } from '../../services/publication-service';
import { PublicationResponse } from '../../models/PublicationResponse';
import { CommonModule } from '@angular/common';
import { Header } from '../../Components/user-layout/header/header';
import { Footer } from '../../Components/footer/footer';

@Component({
  selector: 'app-publication-detail',
  imports: [CommonModule, Header, Footer],
  templateUrl: './publication-detail.html',
  styleUrl: './publication-detail.css',
})
export class PublicationDetail implements OnInit{
  
  publicationSelected!: PublicationResponse;
  selectedImage: string = '';
  transformStyle: string = 'scale(1)';
  transformOrigin: string = 'center';

  constructor(public publicationService: PublicationService, private route: ActivatedRoute, public router: Router){}

  ngOnInit(): void {
    const idPublication = this.route.snapshot.params['id']
    this.getPublicationById(idPublication);
  }

  onMouseMove(event: MouseEvent){
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.transformOrigin = `${x}% ${y}%`;
    this.transformStyle = 'scale(1.8)';
  }

  onMouseLeave(){
    this.transformStyle = 'scale(1)';
    this.transformOrigin = 'center';
  }

  goBack(){
    this.router.navigate(['/']);  //despues tengo que acomadar esto para que vuelva a la pagina de publicaciones, no al home.
  }

  getPublicationById(id: string){
    this.publicationService.getPublicationById(id).subscribe({
      next: (data) => {this.publicationSelected = data; this.selectedImage = data.auto.imagenesUrl[0];},
      error: () => alert('Se produjo un error al mostrar la lista de publicaciones.')
    })
  }
}
