import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login-page/login.component';
import { AdminComponent } from './features/admin/pages/admin-page/admin.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { 
        path: 'login', 
        component: LoginComponent 
    },
    { 
        path: 'admin', 
        component: AdminComponent,
        canActivate: [authGuard]  // Protected route - requires authentication
    },
    { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
    },
    { 
        path: '**', 
        redirectTo: 'login' 
    },
];
