import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  onLogin() {
    // Redirijir a keycloak
    this.redirectToDashboard();
  }

  redirectToDashboard() {
    window.location.href = '/dashboard';
  }
}
