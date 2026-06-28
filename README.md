# TP #2 - Red Social

Trabajo Práctico Nº2 de la materia **Programación IV** (4º Cuatrimestre - Tecnicatura Universitaria en Programación, UTN Avellaneda).

## Alumno

**Alejandro Voutsina Labrin**

## Deploy

🔗 [alejandro-voutsina-tp-2-prog-4-2026.vercel.app](https://alejandro-voutsina-tp-2-prog-4-2026.vercel.app/)

## Tecnologías utilizadas

### Frontend (Angular)

- **Angular**

### Backend (NestJS + Node)

- **NestJS**
- **Mongoose (Mongo Atlas)**: persistencia en MongoDB para usuarios y publicaciones.
- **JWT (JSON Web Token)**: autenticación/autorización; sesión basada en token.
- **Cloudinary**: almacenamiento de imágenes (avatar y fotos de publicaciones) y guardado de sus URLs en MongoDB.

## Descripción por sprint

### Sprint #1

Puesta en marcha de los proyectos base de Angular (frontend) y NestJS (backend), con deploy inicial en hosting. Se implementaron las pantallas de **Registro**, **Login**, **Publicaciones** y **Mi Perfil**, con navegación entre componentes y favicon propio. En el backend se crearon los módulos de **Autenticación**, **Usuarios** y **Publicaciones**, junto con las rutas de registro y login: validación de datos, encriptado de contraseña y generación/verificación contra la base de datos.

### Sprint #2

Desarrollo de la página de **Publicaciones**, con listado ordenable por fecha o por cantidad de "me gusta", paginación, posibilidad de dar/quitar "me gusta" y eliminar las publicaciones propias. Se completó el componente **Mi Perfil**, mostrando los datos del usuario y sus últimas 3 publicaciones. En el backend se implementó el CRUD de publicaciones (alta, listado con filtros/ordenamiento/paginación y baja lógica) y el sistema de "me gusta".

### Sprint #3

Página de **detalle de publicación**, con sus comentarios paginados (carga inicial limitada + botón "cargar más"), posibilidad de comentar y editar comentarios propios (marcando que fueron editados). Se agregó la pantalla de **carga inicial** que valida el token contra el backend, y el manejo de sesión a nivel aplicación: renovación de token mediante modal antes del vencimiento y redirección al login ante un error 401. En el backend se sumaron las rutas de comentarios (alta, edición y listado paginado/ordenado) y las rutas de autenticación **autorizar** y **refrescar** para validar y renovar el JWT.

### Sprint #4

Funcionalidades de **administrador**: baja de publicaciones de cualquier usuario, y un nuevo **dashboard de usuarios** para listar, crear, habilitar y deshabilitar cuentas. Se incorporó también el **dashboard de estadísticas**, con gráficos variados (publicaciones y comentarios por usuario/tiempo), soporte **PWA**, y la creación de pipes y directivas propias. En el backend se desarrolló el módulo de **Usuarios** (con validación de rol administrador) y el módulo de **Estadísticas**, exponiendo las rutas necesarias para alimentar los gráficos.

### Sprint #5 - Recuperatorio

Se permitió acceder al **perfil de otros usuarios** haciendo clic en su nombre o foto, manteniendo las acciones de administrador disponibles. Se reemplazó la paginación tradicional de publicaciones por **scroll infinito**. Se sumaron nuevas estadísticas: cantidad de inicios de sesión por usuario, visitas al propio perfil por parte de otros usuarios, y "me gusta" otorgados por día, junto con la lógica de backend correspondiente.

### Sprint #6 - Fecha de final

Se agregó la posibilidad de **guardar/quitar publicaciones** de favoritos, con su correspondiente pantalla de **Guardados**, y de **compartir publicaciones** con otros usuarios, junto con la pantalla de **Compartidos** para ver lo recibido y quién lo compartió. Se incorporaron dos nuevos criterios de ordenamiento (por cantidad de veces guardada y por cantidad de veces compartida), con su respectiva lógica en el backend.
