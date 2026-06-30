import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { estaLogueadoGuard } from './guards/estaLogueadoGuard';
import { noEstaLogueadoGuard } from './guards/no-esta-logueado-guard';
import { esAdminGuard } from './guards/es-admin-guard';
import { CargandoPage } from './pages/cargando/cargando';

export const routes: Routes =
[
    // Ruta raíz: pantalla de carga que valida el token y redirige
    {
        path: "",
        component: CargandoPage,
    },
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
        // Página de detalle de publicación
        path: "detalle/:id",
        loadComponent: () => import("./pages/detalle/detalle").then(m => m.DetallePage),
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
        path: "**",
        redirectTo: "",
        pathMatch: "full"
    }
];
