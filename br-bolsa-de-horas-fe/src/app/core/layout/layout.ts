import { Component, inject } from '@angular/core';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-layout',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  sidebarService = inject(SidebarService);
}
