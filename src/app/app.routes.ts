import { Routes } from '@angular/router';
import { Home } from './Components/user-layout/home/home';
import { PublicationDetail } from './pages/publication-detail/publication-detail';
import { PublicationForm } from './pages/publication-form/publication-form';

export const routes: Routes = [
    {path:'', component:Home},
    {path:'vender', component:PublicationForm},
    {path:'publicacion/:id', component:PublicationDetail}
];
