import { Routes } from '@angular/router';
import { Home } from './Components/user-layout/home/home';
import { PublicationDetail } from './pages/publication-detail/publication-detail';


export const routes: Routes = [
    {path:'', component:Home},
    {path:'publication/:id', component:PublicationDetail}
];
