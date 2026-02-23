import { Component, inject, OnInit, signal } from '@angular/core';
import { SidebarService } from '../services/sidebar.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
  userName = signal<string>('Usuario');

  ngOnInit() {
    // getUserName ahora es síncrono
    this.userName.set(this.authService.getUserName());
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
