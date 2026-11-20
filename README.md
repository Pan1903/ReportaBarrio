# ReportaBarrio

Plataforma ciudadana para reportar problemas del barrio. Proyecto de aula de Tecnologías Web (Ingeniería de Sistemas, Universidad Simón Bolívar) asociado al ODS 11.

La interfaz usa una estética de videojuego táctico, con paleta roja y oscura.

## Integrantes

- Diego Alejandro Tovar Guerrero
- Samuel David Hernández Pinedo

## Descripción

ReportaBarrio permite a los vecinos registrar problemas de su barrio (vías, alumbrado, residuos, agua, espacio público y seguridad vial), consultarlos, filtrarlos por categoría y barrio, y ver estadísticas por categoría y por estado. El servidor está hecho con Node.js y Express, sin base de datos: los reportes viven en un arreglo en memoria y se pierden al apagar el servidor.

Restricciones del proyecto: sin base de datos, sin React y sin frameworks CSS.

## ODS elegido

**ODS 11: Ciudades y comunidades sostenibles.** Busca ciudades y asentamientos humanos inclusivos, seguros, resilientes y sostenibles.

La aplicación contribuye a tres metas:

- **Meta 11.1 (acceso a servicios básicos):** las categorías de agua y alcantarillado, alumbrado público y vías permiten reportar fallas en servicios esenciales.
- **Meta 11.3 (participación ciudadana):** cualquier vecino puede reportar, consultar y filtrar los problemas de su barrio, lo que deja un registro común para priorizar y dar seguimiento.
- **Meta 11.6 (impacto ambiental urbano):** la categoría de residuos y basuras documenta la acumulación de desechos y las zonas verdes afectadas.

Categorías de reporte: Vías y huecos, Alumbrado público, Residuos y basuras, Agua y alcantarillado, Espacio público y zonas verdes, Seguridad vial.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación y ejecución

```bash
npm install
npm run dev
```

`npm run dev` inicia el servidor con nodemon (recarga automática). Para ejecutarlo sin nodemon usa `npm start`.

La consola muestra `Servidor en http://localhost:3000`. El puerto se puede cambiar con la variable de entorno `PORT`.

## Estructura del proyecto

```
reportabarrio/
├── package.json
├── index.js            Servidor Express: rutas, validación y datos en memoria
├── README.md
└── public/
    ├── index.html      Página de inicio
    ├── reportar.html   Formulario de reporte
    ├── estilos.css     Estilos (flex, grid y media queries)
    └── img/
```

Las vistas Reportes y Estadísticas no son archivos estáticos: las genera el servidor con plantillas de JavaScript.

## Rutas del servidor

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Página de inicio (estática) |
| GET | `/reportar.html` | Formulario de reporte (estático) |
| GET | `/reportes` | Listado de reportes en tarjetas; filtros opcionales `?categoria=...&barrio=...` |
| POST | `/reportes` | Recibe el formulario (`req.body`), valida, guarda con estado "Pendiente" y redirige a `/reportes`. Responde 400 con mensaje si falta un campo o hay un dato inválido |
| GET | `/estadisticas` | Conteo de reportes por categoría y por estado |
| GET | cualquier otra | Página 404 |

Valores de `categoria`: `vias`, `alumbrado`, `residuos`, `agua`, `espacio`, `seguridad`.

Barrios admitidos: Centro, El Prado, Boston, Alto Prado, Ciudad Jardín y Rebolo.

Ejemplos de filtros:

- `/reportes?categoria=alumbrado`
- `/reportes?categoria=residuos&barrio=Centro`

## Campos de cada reporte

`id`, `titulo`, `categoria`, `barrio`, `descripcion`, `urgencia` (baja, media o alta), `contacto` (correo), `fecha` y `estado` (inicial: "Pendiente").

## Links
Repositorio:https://github.com/Pan1903/ReportaBarrio
App: https://reporta-barrio.vercel.app/
