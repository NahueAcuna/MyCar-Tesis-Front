import { Routes } from '@angular/router';
import { Home } from './Components/user-layout/home/home';
import { PublicationDetail } from './pages/publication-detail/publication-detail';
import { PublicationForm } from './pages/publication-form/publication-form';
import { Register } from './pages/register/register';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'vender', component: PublicationForm },
    { path: 'publicacion/:id', component: PublicationDetail },
    { path: 'registro', component: Register }
];
