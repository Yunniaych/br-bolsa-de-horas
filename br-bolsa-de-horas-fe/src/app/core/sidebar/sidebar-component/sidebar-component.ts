import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarItem } from '../sidebar';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar-component',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss',
})
export class SidebarComponent {
  item = input<SidebarItem | null>(null);
  sidebarService = inject(SidebarService);

  handleClick() {
    const currentItem = this.item();
    if (currentItem?.action) {
      currentItem.action();
    }
    this.sidebarService.close();
  }
}
