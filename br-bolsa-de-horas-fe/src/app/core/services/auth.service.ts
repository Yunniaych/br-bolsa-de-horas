import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keycloak = inject(KeycloakService);

  /**
   * Obtener información del usuario autenticado
   */
  async getUserProfile(): Promise<KeycloakProfile | null> {
    try {
      return await this.keycloak.loadUserProfile();
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.keycloak.isLoggedIn();
  }

  /**
   * Verificar si el usuario tiene rol de admin
   */
  isAdmin(): boolean {
    return this.keycloak.isUserInRole('admin');
  }

  /**
   * Verificar si el usuario tiene rol de user
   */
  isUser(): boolean {
    return this.keycloak.isUserInRole('user');
  }

  /**
   * Obtener token de acceso
   */
  getToken(): string {
    return this.keycloak.getKeycloakInstance().token || '';
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await this.keycloak.logout(window.location.origin);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Obtener nombre del usuario desde el token
   */
  getUserName(): string {
    try {
      const keycloakInstance = this.keycloak.getKeycloakInstance();
      const tokenParsed = keycloakInstance.tokenParsed;

      if (!tokenParsed) {
        return 'Usuario';
      }

      // Intentar obtener el nombre completo del token
      const firstName = tokenParsed['given_name'] || tokenParsed['name'];
      const lastName = tokenParsed['family_name'];
      const email = tokenParsed['email'];
      const username = tokenParsed['preferred_username'];

      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      if (firstName) {
        return firstName;
      }
      if (email) {
        return email;
      }
      return username || 'Usuario';
    } catch (error) {
      console.error('Error getting user name from token:', error);
      return 'Usuario';
    }
  }

  /**
   * Obtener email del usuario desde el token
   */
  getUserEmail(): string {
    try {
      const keycloakInstance = this.keycloak.getKeycloakInstance();
      const tokenParsed = keycloakInstance.tokenParsed;
      return tokenParsed?.['email'] || '';
    } catch (error) {
      console.error('Error getting user email from token:', error);
      return '';
    }
  }
}
