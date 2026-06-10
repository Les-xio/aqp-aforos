export const tours = {
  admin: {
    dashboard: [
      { element: '[data-tour="admin-dashboard-welcome"]', popover: { title: 'Bienvenida', description: 'Panel principal con información de acceso, estado del sistema y acceso rápido a los módulos.', side: 'bottom', align: 'start' } },
      { element: '[data-tour="admin-dashboard-kpis"]', popover: { title: 'Indicadores', description: 'Tarjetas con KPIs principales: total de turnos, usuarios activos, puntos de aforo y franjas completadas. Los datos cambian según el periodo seleccionado.', side: 'left', align: 'start' } },
      { element: '[data-tour="admin-dashboard-modules"]', popover: { title: 'Módulos del sistema', description: 'Acceso directo a cada módulo de administración. Pasa el mouse para vista previa de cada sección. Los módulos destacados tienen borde azul.', side: 'top', align: 'start' } },
    ],
    usuarios: [
      { element: '[data-tour="usuarios-header"]', popover: { title: 'Gestión de Usuarios', description: 'Panel para administrar usuarios del sistema. Puedes crear, editar, activar/desactivar cuentas.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="usuarios-form"]', popover: { title: 'Registro de usuario', description: 'Completa los datos del nuevo usuario. Usa el botón 🔍 para buscar datos desde DNI (RENIEC). Los campos con * son obligatorios.', side: 'left', align: 'start' } },
      { element: '[data-tour="usuarios-table"]', popover: { title: 'Lista de usuarios', description: 'Tabla con todos los usuarios registrados. Puedes filtrar, ordenar y editar cada usuario usando los botones de acción.', side: 'top', align: 'start' } },
    ],
    categorias: [
      { element: '[data-tour="categorias-header"]', popover: { title: 'Categorías de vehículos', description: 'Administra las categorías (ej: "Bus", "Camión"). Cada categoría agrupa subcategorías y tipos de vehículo.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="categorias-form"]', popover: { title: 'Nueva categoría', description: 'Registra una categoría con nombre y descripción. La categoría debe tener un nombre único en el sistema.', side: 'left', align: 'start' } },
      { element: '[data-tour="categorias-table"]', popover: { title: 'Lista de categorías', description: 'Tabla con todas las categorías. Cada fila muestra el nombre y cantidad de vehículos asociados.', side: 'top', align: 'start' } },
    ],
    subcategorias: [
      { element: '[data-tour="subcategorias-header"]', popover: { title: 'Subcategorías', description: 'Subdivisiones dentro de cada categoría (ej: "Bus urbano", "Bus interprovincial").', side: 'bottom', align: 'center' } },
      { element: '[data-tour="subcategorias-form"]', popover: { title: 'Registro', description: 'Crea subcategorías seleccionando la categoría padre y asignando un nombre descriptivo.', side: 'left', align: 'start' } },
      { element: '[data-tour="subcategorias-table"]', popover: { title: 'Listado', description: 'Visualiza todas las subcategorías agrupadas por categoría.', side: 'top', align: 'start' } },
    ],
    vehiculos: [
      { element: '[data-tour="vehiculos-header"]', popover: { title: 'Tipos de vehículo', description: 'Configura los tipos de vehículo que se contarán en campo. Cada tipo pertenece a una subcategoría.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="vehiculos-form"]', popover: { title: 'Nuevo tipo', description: 'Registra un tipo de vehículo con nombre, subcategoría y asignación de asientos (opcional).', side: 'left', align: 'start' } },
      { element: '[data-tour="vehiculos-table"]', popover: { title: 'Lista de tipos', description: 'Tabla con todos los tipos de vehículo. Puedes editar o eliminar según necesidad.', side: 'top', align: 'start' } },
    ],
    puntos: [
      { element: '[data-tour="puntos-header"]', popover: { title: 'Puntos de aforo', description: 'Gestiona las ubicaciones donde se realizan los aforos. Cada punto tiene coordenadas y una descripción.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="puntos-form"]', popover: { title: 'Nuevo punto', description: 'Registra un punto con nombre, ubicación (latitud/longitud) y dirección referencial.', side: 'left', align: 'start' } },
      { element: '[data-tour="puntos-table"]', popover: { title: 'Lista de puntos', description: 'Todos los puntos de aforo registrados. Usa el botón de mapa para ver la ubicación en Google Maps.', side: 'top', align: 'start' } },
    ],
    turnos: [
      { element: '[data-tour="turnos-header"]', popover: { title: 'Gestión de Turnos', description: 'Asigna turnos a los aforadores. Selecciona el aforador, fecha, hora de inicio y duración en horas.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="turnos-card"]', popover: { title: 'Asignar turno', description: 'Elige un aforador de la lista, define la fecha, hora de inicio y cantidad de horas. El sistema generará las franjas automáticamente (4 franjas por hora).', side: 'left', align: 'start' } },
      { element: '[data-tour="turnos-table"]', popover: { title: 'Historial', description: 'Historial de turnos generados. Cada turno puede estar pendiente (el aforador debe activarlo) o activo.', side: 'top', align: 'start' } },
    ],
    franjas: [
      { element: '[data-tour="franjas-header"]', popover: { title: 'Franjas por turno', description: 'Visualiza las franjas horarias generadas para cada turno. Cada franja dura 15 minutos.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="franjas-accordion"]', popover: { title: 'Turnos expandibles', description: 'Cada turno tiene un acordeón. Expándelo para ver todas las franjas asignadas con su estado (pendiente, en curso, completada, omitida).', side: 'left', align: 'start' } },
      { element: '[data-tour="franjas-modal"]', popover: { title: 'Detalle de franja', description: 'Al hacer clic en una franja, se abre un modal con la evidencia fotográfica, coordenadas GPS y enlace a Google Maps.', side: 'top', align: 'start' } },
    ],
    reportes: [
      { element: '[data-tour="reportes-header"]', popover: { title: 'Reportes y Exportación', description: 'Genera reportes de datos recolectados. Puedes exportar a CSV o XLSX.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="reportes-filters"]', popover: { title: 'Filtros', description: 'Filtra por punto de aforo, aforador y rango de fechas. Selecciona al menos un filtro antes de consultar.', side: 'left', align: 'start' } },
      { element: '[data-tour="reportes-tabs"]', popover: { title: 'Pestañas de datos', description: 'Subidas/Bajadas: muestra los datos de pasajeros que suben y bajan. Cola Vehicular: muestra datos de congestión vehicular.', side: 'top', align: 'start' } },
      { element: '[data-tour="reportes-export"]', popover: { title: 'Exportar', description: 'Botones para exportar los datos filtrados. CSV abre en Excel, XLSX es formato nativo de Excel.', side: 'left', align: 'start' } },
    ],
    buscar: [
      { element: '[data-tour="buscar-header"]', popover: { title: 'Búsqueda de datos', description: 'Busca y visualiza datos de aforo registrados. Puedes filtrar por tipo de vehículo, sentido, rango de fechas.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="buscar-filters"]', popover: { title: 'Filtros de búsqueda', description: 'Selecciona punto, sentido, tipo de vehículo y rango de fechas para refinar la búsqueda.', side: 'left', align: 'start' } },
      { element: '[data-tour="buscar-totals"]', popover: { title: 'Totales por tipo', description: 'Resumen visual con totales agrupados por tipo de vehículo. Incluye un total general al final.', side: 'top', align: 'start' } },
    ],
    auditoria: [
      { element: '[data-tour="auditoria-header"]', popover: { title: 'Auditoría de actividades', description: 'Registro cronológico de todas las acciones realizadas en el sistema: inicios de sesión, creación de usuarios, registro de datos, etc.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="auditoria-table"]', popover: { title: 'Registro de eventos', description: 'Cada fila muestra: usuario que realizó la acción, tipo de evento, detalle en formato JSON y fecha/hora. Los detalles expandidos muestran información completa.', side: 'top', align: 'start' } },
    ],
    sidebar: [
      { element: '[data-tour="sidebar"]', popover: { title: 'Barra lateral', description: 'Menú de navegación principal del panel de administración. El módulo activo se resalta con borde azul.', side: 'right', align: 'center' } },
    ],
  },

  aforador: {
    iniciarTurno: [
      { element: '[data-tour="iniciar-header"]', popover: { title: 'Inicio de Turno', description: 'Pantalla principal del aforador. Aquí inicias tu turno después de que el administrador lo haya asignado.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="iniciar-info"]', popover: { title: 'Información del turno', description: 'Muestra los datos del turno asignado: fecha, hora de inicio y duración. Si no hay turno pendiente, aparece un mensaje indicando que el administrador debe asignarte uno.', side: 'left', align: 'start' } },
      { element: '[data-tour="iniciar-activar"]', popover: { title: 'Activar turno', description: 'Selecciona el punto de aforo y sentido (subida/bajada) para activar tu turno. El botón está deshabilitado si no hay turno pendiente.', side: 'top', align: 'start' } },
    ],
    menu: [
      { element: '[data-tour="menu-header"]', popover: { title: 'Menú Principal', description: 'Panel principal del aforador. Desde aquí accedes a las franjas de tu turno activo.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="menu-buttons"]', popover: { title: 'Opciones de aforo', description: 'Selecciona el formato de aforo: Formato 1 para conteo vehicular y paradas (subidas/bajadas). Cada botón te lleva a la lista de franjas.', side: 'top', align: 'start' } },
    ],
    franjas: [
      { element: '[data-tour="franjas-timer"]', popover: { title: 'Temporizador', description: 'Muestra el tiempo restante de la franja actual. El color cambia: verde (mucho tiempo), amarillo (poco), rojo (últimos segundos). Cuando llega a 0, la franja se cierra automáticamente.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="franjas-list"]', popover: { title: 'Lista de franjas', description: 'Cada franja de 15 minutos. Las completadas aparecen en verde, la activa en azul, las pendientes en gris y las omitidas en rojo. Toca una franja pendiente para iniciar.', side: 'left', align: 'start' } },
    ],
    validar: [
      { element: '[data-tour="validar-header"]', popover: { title: 'Evidencia fotográfica', description: 'Toma una foto como evidencia del punto de aforo antes de comenzar el conteo. Esta foto se asocia a la franja.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="validar-info"]', popover: { title: 'Datos de la franja', description: 'Muestra el punto de aforo y sentido asignado. Verifica que coincida con tu ubicación actual.', side: 'left', align: 'start' } },
      { element: '#capturar-foto-btn', popover: { title: 'Capturar foto', description: 'Presiona este botón para tomar una foto con la cámara. La foto se guardará como evidencia de tu presencia en el punto.', side: 'top', align: 'center' } },
      { element: '[data-tour="validar-gps"]', popover: { title: 'Ubicación GPS', description: 'El sistema captura automáticamente tus coordenadas. Asegúrate de tener el GPS activado para una geolocalización precisa.', side: 'left', align: 'start' } },
    ],
    conteo: [
      { element: '[data-tour="conteo-header"]', popover: { title: 'Conteo vehicular', description: 'Registro en tiempo real del conteo de vehículos. Selecciona el tipo de vehículo y sentido cada vez que pase uno.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="conteo-timer"]', popover: { title: 'Tiempo restante', description: 'Temporizador de 15 minutos. Cuando llega a 0, el conteo se cierra automáticamente.', side: 'left', align: 'start' } },
      { element: '[data-tour="conteo-counter"]', popover: { title: 'Botones de conteo', description: 'Cada botón representa un tipo de vehículo (auto, bus, camión, etc.). Presiona el botón cada vez que pase un vehículo de ese tipo. El contador se actualiza al instante.', side: 'top', align: 'start' } },
    ],
    paradas: [
      { element: '[data-tour="paradas-header"]', popover: { title: 'Paradas y Colas', description: 'Registro de pasajeros que suben/bajan y medición de cola vehicular.', side: 'bottom', align: 'center' } },
      { element: '[data-tour="paradas-tabs"]', popover: { title: 'Pestañas', description: '"Paradas": registra subidas y bajadas de pasajeros por tipo de vehículo. "Cola vehícular": mide la congestión.', side: 'top', align: 'start' } },
      { element: '[data-tour="paradas-form"]', popover: { title: 'Registro de paradas', description: 'Selecciona el tipo de vehículo, ingresa cuántos suben, cuántos bajan y cuántos quedan insatisfechos. Los valores no pueden ser negativos.', side: 'left', align: 'start' } },
      { element: '[data-tour="paradas-cola"]', popover: { title: 'Cola vehicular', description: 'Ingresa la cantidad de vehículos en cola y observaciones adicionales. Esto mide la congestión en el punto de aforo.', side: 'left', align: 'start' } },
    ],
  },
};
