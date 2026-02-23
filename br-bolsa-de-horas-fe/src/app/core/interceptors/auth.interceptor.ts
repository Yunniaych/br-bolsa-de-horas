import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(KeycloakService);

  // URLs que no necesitan autenticación
  const excludedUrls = ['/assets', '/health', '/icons'];
  const shouldExclude = excludedUrls.some((url) => req.url.includes(url));

  if (shouldExclude) {
    return next(req);
  }

  // Obtener el token de Keycloak desde la instancia
  const keycloakInstance = keycloak.getKeycloakInstance();
  const token = keycloakInstance.token;

  // token debug logs removed

  // Si hay token, clonar la request y agregar el header Authorization
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    // auth header debug log removed
    return next(authReq);
  }
  // no-token debug log removed
  return next(req);
};
