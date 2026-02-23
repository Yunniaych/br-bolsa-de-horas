import { Component, inject } from '@angular/core';
import { SidebarComponent } from './sidebar-component/sidebar-component';
import { SidebarService } from '../services/sidebar.service';
import { AuthService } from '../services/auth.service';

export type SidebarItem = {
  nombre: string;
  icono: string;
  ruta?: string;
  action?: () => void;
};

@Component({
  selector: 'app-sidebar',
  imports: [SidebarComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);

  sidebaritems: SidebarItem[] = [
    {
      nombre: 'Dashboard',
      icono: 'icons/dashboard.svg',
      ruta: '/dashboard',
    },
    {
      nombre: 'Iniciativas',
      icono: 'icons/iniciative.svg',
      ruta: '/iniciativas',
    },
    {
      nombre: 'Gestión de Bolsas',
      icono: 'icons/bolsas.svg',
      ruta: '/gestion-bolsas',
    },
  ];

  logoutItem: SidebarItem = {
    nombre: 'Cerrar Sesión',
    icono: 'icons/exit.svg',
    action: () => this.authService.logout(),
  };
}
