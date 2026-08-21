import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }else{
    toast.warning('Tiene que estar registrado en la página.');
    // Si router.navigated es false, significa que escribió la URL a mano o refrescó.
    // Como no tiene "página anterior", lo mandamos al home para que no vea la pantalla negra.
    if (!router.navigated) {
      router.navigate(['/']);
    }

    // Al retornar false, bloqueamos el acceso a la ruta protegida
    return false;
  }
};
