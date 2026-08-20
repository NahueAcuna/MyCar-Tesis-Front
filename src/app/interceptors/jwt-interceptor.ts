import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

/** Verifica si el JWT guardado está expirado decodificando su payload */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // `exp` está en segundos, Date.now() en milisegundos
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Si no se puede parsear, lo consideramos inválido
  }
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.getToken();
  const router = inject(Router);

  let clonedRequest = req;

  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const tokenActual = authService.getToken();

        // Solo cerrar sesión si el token está realmente expirado o ausente.
        // Si el token sigue siendo válido, el 401 es por otra razón (permisos,
        // endpoint específico, etc.) y NO debemos destruir la sesión.
        if (!tokenActual || isTokenExpired(tokenActual)) {
          console.warn('[JWT Interceptor] Token expirado o ausente. Cerrando sesión...');
          authService.logout();
          router.navigate(['/login']);
        } else {
          console.warn('[JWT Interceptor] 401 recibido pero el token sigue vigente. No se cierra sesión.');
        }
      }
      return throwError(() => error);
    })
  );
};