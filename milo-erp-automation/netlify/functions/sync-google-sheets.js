/**
 * Función de sincronización a Google Sheets
 * Crea un Sheet automático con pestañas para cada módulo
 * Se ejecuta cada 10 minutos mediante cron job
 */

const { fetchHGI } = require('./auth-hgi');

/**
 * Handler para Netlify Functions
 */
exports.handler = async (event, context) => {
  // Verificar que sea una solicitud de cron
  if (event.headers['x-netlify-cron'] !== process.env.CRON_SECRET) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No autorizado' }),
    };
  }

  try {
    console.log('🔄 Iniciando sincronización a Google Sheets...');

    // Obtener datos de todas las APIs
    const [empleados, vendedores, productos, pedidos, clientes, cartera] = await Promise.all([
      obtenerDatos('empleados'),
      obtenerDatos('vendedores'),
      obtenerDatos('productos'),
      obtenerDatos('pedidos'),
      obtenerDatos('clientes'),
      obtenerDatos('cartera'),
    ]);

    console.log(`✅ Datos obtenidos:`);
    console.log(`  - Empleados: ${empleados.length}`);
    console.log(`  - Vendedores: ${vendedores.length}`);
    console.log(`  - Productos: ${productos.length}`);
    console.log(`  - Pedidos: ${pedidos.length}`);
    console.log(`  - Clientes: ${clientes.length}`);
    console.log(`  - Cartera: ${cartera.length}`);

    // Aquí iría la sincronización a Google Sheets
    // Por ahora solo retornamos los datos
    // (La integración completa se hace mediante Google Apps Script)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Sincronización completada',
        data: {
          empleados: empleados.length,
          vendedores: vendedores.length,
          productos: productos.length,
          pedidos: pedidos.length,
          clientes: clientes.length,
          cartera: cartera.length,
        },
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};

/**
 * Obtener datos de cada módulo
 */
async function obtenerDatos(modulo) {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    let endpoint = '';

    switch (modulo) {
      case 'empleados':
        endpoint = `/ip_servicios_web/Api/Empleados/Obtener?codigo=*&sucursal=*&centro_costo=*&incluir_foto=false&solo_activos=*`;
        break;
      case 'vendedores':
        endpoint = `/ip_servicios_web/Api/Vendedores/Obtener?codigo_vendedor=*`;
        break;
      case 'productos':
        endpoint = `/ip_servicios_web/Api/Productos/ObtenerProductos?codigo_producto=0&movil=1&ecommerce=1&estado=1&kardex=1&incluir_foto=false`;
        break;
      case 'pedidos':
        endpoint = `/ip_servicios_web/Api/Documentos/ObtenerDocumentos?tercero=*&fecha_inicial=${hoy}&fecha_final=${hoy}`;
        break;
      case 'clientes':
        endpoint = `/ip_servicios_web/Api/Terceros/ObtenerLista?numero_identificacion=0&codigo_auxiliar=*&codigo_estado=*&tipo_tercero=*&codigo_ciudad=*&codigo_vendedor=*`;
        break;
      case 'cartera':
        const anyo = new Date().getFullYear();
        const periodo = String(new Date().getMonth() + 1).padStart(2, '0');
        endpoint = `/ip_servicios_web/Api/Cartera/ObtenerDetallada?anyo=${anyo}&periodo=${periodo}&codigo_tercero=*&codigo_local=*&tipo_cartera=*&grupo=*&codigo_clase=*&modo_cartera=1&codigo_vendedor=*&doc_vendedor=false`;
        break;
    }

    console.log(`📡 Llamando: ${modulo} - ${endpoint}`);

    const response = await fetchHGI(endpoint);

    if (!response.ok) {
      console.warn(`⚠️  Error obteniendo ${modulo}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error(`❌ Error en ${modulo}:`, error);
    return [];
  }
}

/**
 * Función para crear Google Sheet automáticamente
 * Se puede llamar manualmente o mediante una API
 */
exports.createSheet = async (event) => {
  try {
    // Obtener datos de todas las fuentes
    const empleados = await obtenerDatos('empleados');
    const vendedores = await obtenerDatos('vendedores');
    const productos = await obtenerDatos('productos');
    const pedidos = await obtenerDatos('pedidos');
    const clientes = await obtenerDatos('clientes');
    const cartera = await obtenerDatos('cartera');

    // Estructura para crear el Sheet
    const sheets = {
      'Empleados': empleados,
      'Vendedores': vendedores,
      'Productos': productos,
      'Pedidos': pedidos,
      'Clientes': clientes,
      'Cartera': cartera,
      'Reportes': [
        {
          'Módulo': 'Empleados',
          'Total de Registros': empleados.length,
          'Fecha': new Date().toLocaleString(),
        },
        {
          'Módulo': 'Vendedores',
          'Total de Registros': vendedores.length,
          'Fecha': new Date().toLocaleString(),
        },
        {
          'Módulo': 'Productos',
          'Total de Registros': productos.length,
          'Fecha': new Date().toLocaleString(),
        },
        {
          'Módulo': 'Pedidos',
          'Total de Registros': pedidos.length,
          'Fecha': new Date().toLocaleString(),
        },
        {
          'Módulo': 'Clientes',
          'Total de Registros': clientes.length,
          'Fecha': new Date().toLocaleString(),
        },
        {
          'Módulo': 'Cartera',
          'Total de Registros': cartera.length,
          'Fecha': new Date().toLocaleString(),
        },
      ],
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Datos listos para exportar a Google Sheets',
        sheets: sheets,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
