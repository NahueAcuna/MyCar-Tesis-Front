import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const toast = inject(ToastService);

  if (authService.isLoggedIn()) {
    return true;
  }else{
    toast.warning('Tiene que estar registrado en la página.');
    return false;
  }
};
