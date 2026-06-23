import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { estaLogueadoGuard } from './guards/estaLogueadoGuard';
import { noEstaLogueadoGuard } from './guards/no-esta-logueado-guard';
import { esAdminGuard } from './guards/es-admin-guard';

export const routes: Routes = 
[
    {
        path: "inicio",
        component: Inicio,
        canActivate: [noEstaLogueadoGuard]
    },
    {
        path: "perfil",
        loadComponent: () => import("./pages/perfil/perfil").then(m => m.Perfil),
        canActivate: [noEstaLogueadoGuard],
    },
    {
        path: "perfil/:id",
        loadComponent: () => import("./pages/perfil/perfil").then(m => m.Perfil),
        canActivate: [noEstaLogueadoGuard],
    },
    {
        path: "crear",
        loadComponent: () => import("./pages/publicacion/publicaciones").then(m => m.Publicacion),
        canActivate: [noEstaLogueadoGuard],
    },
    {
        path: "registro",
        loadComponent: () => import("./pages/sesion/registro/registro").then(m => m.Registro),
        canActivate: [estaLogueadoGuard]
    },
    {
        path: "login",
        loadComponent: () => import("./pages/sesion/login/login").then(m => m.Login),
        canActivate: [estaLogueadoGuard]
    },
    {
        path: "usuarios",
        loadComponent: () => import("./pages/usuarios/usuarios").then(m => m.Usuarios),
        canActivate: [noEstaLogueadoGuard, esAdminGuard]
    },
    {
        path: "estadisticas",
        loadComponent: () => import("./pages/estadisticas/estadisticas").then(m => m.Estadisticas),
        canActivate: [noEstaLogueadoGuard, esAdminGuard]
    },
    {
        path: "",
        redirectTo: "inicio",
        pathMatch: "full"
    },
    {
        path: "**",
        redirectTo: "inicio",
        pathMatch: "full"
    }
];
