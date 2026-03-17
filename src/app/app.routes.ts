import { Routes } from '@angular/router';
import { Login } from './core/auth/login';
import { Admin } from './admin/admin';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
    { 
        path: 'login', 
        component: Login 
    },
    { 
        path: 'admin', 
        component: Admin,
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
