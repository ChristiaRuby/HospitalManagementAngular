import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'about', loadComponent: () => import('./about/about.component').then(m => m.AboutComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'inpatients',
    loadChildren: () => import('./features/inpatients/inpatients.module').then(m => m.InpatientsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredFeature: 'inpatients' }
  },
  {
    path: 'outpatients',
    loadChildren: () => import('./features/outpatients/outpatients.module').then(m => m.OutpatientsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredFeature: 'outpatients' }
  },
  {
    path: 'channeling',
    loadChildren: () => import('./features/channeling/channeling.module').then(m => m.ChannelingModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredFeature: 'channeling' }
  },
  {
    path: 'payments',
    loadChildren: () => import('./features/payments/payments.module').then(m => m.PaymentsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredFeature: 'payments' }
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredFeature: 'reports' }
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }