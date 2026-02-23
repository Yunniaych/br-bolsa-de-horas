import { inject } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Guard para verificar que el usuario está autenticado
 */
export const authGuard = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Promise<boolean> => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = await keycloak.isLoggedIn();

  if (!isLoggedIn) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url,
    });
    return false;
  }

  return true;
};

/**
 * Guard para verificar que el usuario tiene el rol de admin
 */
export const adminGuard = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Promise<boolean> => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = await keycloak.isLoggedIn();

  if (!isLoggedIn) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url,
    });
    return false;
  }

  const hasAdminRole = keycloak.isUserInRole('admin');

  if (!hasAdminRole) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
