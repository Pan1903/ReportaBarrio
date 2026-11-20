const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Archivos estáticos y lectura del cuerpo de los formularios
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Datos de apoyo
const CATEGORIAS = {
  vias: 'Vías y huecos',
  alumbrado: 'Alumbrado público',
  residuos: 'Residuos y basuras',
  agua: 'Agua y alcantarillado',
  espacio: 'Espacio público y zonas verdes',
  seguridad: 'Seguridad vial'
};
const BARRIOS = ['Centro', 'El Prado', 'Boston', 'Alto Prado', 'Ciudad Jardín', 'Rebolo'];
const ESTADOS = ['Pendiente', 'En proceso', 'Resuelto'];
const URGENCIAS = ['baja', 'media', 'alta'];

// Reportes en memoria
let siguienteId = 1;
const reportes = [];

function agregarReporte(datos) {
  reportes.push({
    id: siguienteId++,
    titulo: datos.titulo,
    categoria: datos.categoria,
    barrio: datos.barrio,
    descripcion: datos.descripcion,
    urgencia: datos.urgencia,
    contacto: datos.contacto,
    fecha: new Date().toLocaleDateString('es-CO'),
    estado: 'Pendiente'
  });
}

agregarReporte({ titulo: 'Hueco grande en la calle 45', categoria: 'vias', barrio: 'Centro', descripcion: 'Hueco de más de un metro que afecta el paso de vehículos.', urgencia: 'alta', contacto: 'vecino1@correo.com' });
agregarReporte({ titulo: 'Poste sin luz', categoria: 'alumbrado', barrio: 'El Prado', descripcion: 'Hace dos semanas no funciona la luminaria del parque.', urgencia: 'media', contacto: 'vecino2@correo.com' });
agregarReporte({ titulo: 'Basura acumulada en la esquina', categoria: 'residuos', barrio: 'Centro', descripcion: 'El camión no recoge las bolsas desde hace una semana.', urgencia: 'media', contacto: 'vecino3@correo.com' });

// Utilidades de HTML
function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function esTexto(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

// Plantilla base de las páginas generadas por el servidor
function plantilla(titulo, contenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} | ReportaBarrio</title>
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <header>
    <a id="logo" href="/">ReportaBarrio</a>
    <nav>
      <a href="/">Inicio</a>
      <a href="/reportar.html">Reportar</a>
      <a href="/reportes">Reportes</a>
      <a href="/estadisticas">Estadísticas</a>
    </nav>
  </header>
  <main>
${contenido}
  </main>
  <footer>
    <p>ReportaBarrio · Proyecto de aula de Tecnologías Web · ODS 11</p>
  </footer>
</body>
</html>`;
}

// GET /reportes: listado con filtros por categoría y barrio (req.query)
app.get('/reportes', (req, res) => {
  const { categoria, barrio } = req.query;

  let lista = reportes;
  if (categoria) {
    lista = lista.filter(r => r.categoria === categoria);
  }
  if (barrio) {
    lista = lista.filter(r => r.barrio.toLowerCase() === barrio.toLowerCase());
  }

  const opcionesCategoria = Object.keys(CATEGORIAS)
    .map(k => `<option value="${k}"${categoria === k ? ' selected' : ''}>${CATEGORIAS[k]}</option>`)
    .join('');
  const opcionesBarrio = BARRIOS
    .map(b => `<option value="${b}"${barrio === b ? ' selected' : ''}>${b}</option>`)
    .join('');

  let tarjetas;
  if (lista.length === 0) {
    tarjetas = '<p class="mensaje">No hay reportes que cumplan los filtros seleccionados.</p>';
  } else {
    tarjetas = '<div class="tarjetas">' + lista.map(r => `
      <article class="tarjeta">
        <h3>${escapar(r.titulo)}</h3>
        <p class="etiqueta">${CATEGORIAS[r.categoria]} · ${escapar(r.barrio)}</p>
        <p>${escapar(r.descripcion)}</p>
        <p><strong>Urgencia:</strong> ${r.urgencia}</p>
        <p><strong>Estado:</strong> ${r.estado}</p>
        <p><strong>Fecha:</strong> ${r.fecha}</p>
      </article>`).join('') + '</div>';
  }

  const contenido = `    <section>
      <h1>Reportes</h1>
      <form class="filtros" action="/reportes" method="GET">
        <label for="categoria">Categoría</label>
        <select id="categoria" name="categoria">
          <option value="">Todas</option>
          ${opcionesCategoria}
        </select>
        <label for="barrio">Barrio</label>
        <select id="barrio" name="barrio">
          <option value="">Todos</option>
          ${opcionesBarrio}
        </select>
        <button type="submit">Filtrar</button>
      </form>
      ${tarjetas}
    </section>`;

  res.send(plantilla('Reportes', contenido));
});

// POST /reportes: valida, guarda y redirige (req.body)
app.post('/reportes', (req, res) => {
  const { titulo, categoria, barrio, descripcion, urgencia, contacto } = req.body;
  const campos = { titulo, categoria, barrio, descripcion, urgencia, contacto };

  const faltantes = Object.keys(campos).filter(c => !esTexto(campos[c]));
  if (faltantes.length > 0) {
    const contenido = `    <section>
      <h1>No se pudo guardar el reporte</h1>
      <p class="mensaje error">Faltan campos obligatorios: ${faltantes.join(', ')}.</p>
      <p><a class="boton" href="/reportar.html">Volver al formulario</a></p>
    </section>`;
    return res.status(400).send(plantilla('Error', contenido));
  }

  if (!CATEGORIAS[categoria] || !URGENCIAS.includes(urgencia) || !BARRIOS.includes(barrio.trim())) {
    const contenido = `    <section>
      <h1>No se pudo guardar el reporte</h1>
      <p class="mensaje error">La categoría o la urgencia no son válidas.</p>
      <p><a class="boton" href="/reportar.html">Volver al formulario</a></p>
    </section>`;
    return res.status(400).send(plantilla('Error', contenido));
  }

  if (titulo.trim().length > 120 || descripcion.trim().length > 2000 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.trim())) {
    const contenido = `    <section>
      <h1>No se pudo guardar el reporte</h1>
      <p class="mensaje error">Revisa el correo y asegúrate de que el título tenga máximo 120 caracteres y la descripción máximo 2000.</p>
      <p><a class="boton" href="/reportar.html">Volver al formulario</a></p>
    </section>`;
    return res.status(400).send(plantilla('Error', contenido));
  }

  agregarReporte({
    titulo: titulo.trim(),
    categoria,
    barrio: barrio.trim(),
    descripcion: descripcion.trim(),
    urgencia,
    contacto: contacto.trim()
  });
  res.redirect('/reportes');
});

// GET /estadisticas: conteo por categoría y por estado
app.get('/estadisticas', (req, res) => {
  const filasCategoria = Object.keys(CATEGORIAS)
    .map(k => `<tr><td>${CATEGORIAS[k]}</td><td>${reportes.filter(r => r.categoria === k).length}</td></tr>`)
    .join('');
  const filasEstado = ESTADOS
    .map(e => `<tr><td>${e}</td><td>${reportes.filter(r => r.estado === e).length}</td></tr>`)
    .join('');

  const contenido = `    <section>
      <h1>Estadísticas</h1>
      <p>Total de reportes: <strong>${reportes.length}</strong></p>
      <div class="tarjetas">
        <article class="tarjeta">
          <h2>Por categoría</h2>
          <table>
            <thead><tr><th>Categoría</th><th>Reportes</th></tr></thead>
            <tbody>${filasCategoria}</tbody>
          </table>
        </article>
        <article class="tarjeta">
          <h2>Por estado</h2>
          <table>
            <thead><tr><th>Estado</th><th>Reportes</th></tr></thead>
            <tbody>${filasEstado}</tbody>
          </table>
        </article>
      </div>
    </section>`;

  res.send(plantilla('Estadísticas', contenido));
});

// 404 para rutas inexistentes
app.use((req, res) => {
  const contenido = `    <section>
      <h1>404 · Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <p><a class="boton" href="/">Ir al inicio</a></p>
    </section>`;
  res.status(404).send(plantilla('Página no encontrada', contenido));
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
