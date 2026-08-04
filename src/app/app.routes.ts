import { Routes } from '@angular/router';
import { Home } from './Components/user-layout/home/home';
import { PublicationDetail } from './pages/publication-detail/publication-detail';
import { PublicationForm } from './pages/publication-form/publication-form';
import { Register } from './pages/register/register';
import { GestionAdmin } from './pages/gestion-admin/gestion-admin';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { MyPosts } from './pages/my-posts/my-posts';
import { Profile } from './pages/profile/profile';
import { Marketplace } from './pages/marketplace/marketplace';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'vender', component: PublicationForm, canActivate: [authGuard] },
    { path: 'marketplace', component: Marketplace},
    { path: 'publicacion/:id', component: PublicationDetail, canActivate: [authGuard] },
    { path: 'registro', component: Register },
    { path: 'login', component: Login },
    { path: 'perfil', component: Profile, canActivate: [authGuard] },
    { path: 'mis-publicaciones', component: MyPosts, canActivate: [authGuard] },
    { path: 'gestionar', component: GestionAdmin, canActivate: [adminGuard] }
];
