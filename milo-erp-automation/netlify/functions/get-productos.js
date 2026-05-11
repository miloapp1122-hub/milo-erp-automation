/**
 * API: GET /.netlify/functions/get-productos
 * Obtiene lista de productos del HGI
 * 
 * Parámetros opcionales en query string:
 * - codigo_producto: Código del producto o 0 para todos (default: 0)
 * - movil: 0/1/* para filtrar por disponibilidad móvil (default: 1)
 * - ecommerce: 0/1/* para filtrar por ecommerce (default: 1)
 * - estado: 0/1/* para filtrar por estado (default: 1)
 * - kardex: 0/1/* para filtrar por kardex (default: 1)
 * - incluir_foto: true/false para incluir fotos (default: false)
 */

const { fetchHGI } = require('./auth-hgi');

exports.handler = async (event, context) => {
  try {
    // Obtener parámetros de la query string
    const queryParams = event.queryStringParameters || {};
    
    const codigo_producto = queryParams.codigo_producto || '0';
    const movil = queryParams.movil || '1';
    const ecommerce = queryParams.ecommerce || '1';
    const estado = queryParams.estado || '1';
    const kardex = queryParams.kardex || '1';
    const incluir_foto = queryParams.incluir_foto || 'false';

    // Construir URL con parámetros
    const endpoint = `/ip_servicios_web/Api/Productos/ObtenerProductos?codigo_producto=${codigo_producto}&movil=${movil}&ecommerce=${ecommerce}&estado=${estado}&kardex=${kardex}&incluir_foto=${incluir_foto}`;

    console.log(`📥 Obteniendo productos: ${endpoint}`);

    const response = await fetchHGI(endpoint);

    if (!response.ok) {
      throw new Error(`Error HGI ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Productos obtenidos: ${Array.isArray(data) ? data.length : 'datos procesados'}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=600',
      },
      body: JSON.stringify({
        success: true,
        data: data,
        count: Array.isArray(data) ? data.length : 0,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en get-productos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
