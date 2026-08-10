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
import { InboxComponent } from './pages/inbox/inbox';
import { MyFavorites } from './pages/my-favorites/my-favorites';
import { MyReservations } from './pages/my-reservations/my-reservations';
import { ProfileAdmin } from './pages/profile-admin/profile-admin';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'vender', component: PublicationForm, canActivate: [authGuard] },
    { path: 'marketplace', component: Marketplace},
    { path: 'publicacion/:id', component: PublicationDetail, canActivate: [authGuard] },
    { path: 'registro', component: Register },
    { path: 'login', component: Login },
    { path: 'chats', component: InboxComponent },
    { path: 'perfil', component: Profile, canActivate: [authGuard] },
    { path: 'perfil-admin', component: ProfileAdmin, canActivate: [adminGuard] },
    { path: 'mis-publicaciones', component: MyPosts, canActivate: [authGuard] },
    { path: 'mis-favoritos', component: MyFavorites, canActivate: [authGuard] },
    { path: 'mis-reservas', component: MyReservations, canActivate: [authGuard] },
    { path: 'gestionar', component: GestionAdmin, canActivate: [adminGuard] }
];
