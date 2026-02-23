import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { DashboardPage } from './dashboard/dashboard-page/dashboard-page';
import { IniciativasPage } from './iniciativas/iniciativas-page/iniciativas-page';
import { GestionBolsasPage } from './gestion-bolsas/gestion-bolsas-page/gestion-bolsas-page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPage },
      { path: 'iniciativas', component: IniciativasPage },
      { path: 'gestion-bolsas', component: GestionBolsasPage },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
