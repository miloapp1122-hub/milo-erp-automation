/**
 * API: GET /.netlify/functions/get-vendedores
 * Obtiene lista de vendedores del HGI
 * 
 * Parámetros opcionales en query string:
 * - codigo_vendedor: Código del vendedor o * para todos (default: *)
 */

const { fetchHGI } = require('./auth-hgi');

exports.handler = async (event, context) => {
  try {
    // Obtener parámetros de la query string
    const queryParams = event.queryStringParameters || {};
    const codigo_vendedor = queryParams.codigo_vendedor || '*';

    // Construir URL con parámetros
    const endpoint = `/ip_servicios_web/Api/Vendedores/Obtener?codigo_vendedor=${codigo_vendedor}`;

    console.log(`📥 Obteniendo vendedores: ${endpoint}`);

    const response = await fetchHGI(endpoint);

    if (!response.ok) {
      throw new Error(`Error HGI ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Vendedores obtenidos: ${Array.isArray(data) ? data.length : 'datos procesados'}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300',
      },
      body: JSON.stringify({
        success: true,
        data: data,
        count: Array.isArray(data) ? data.length : 0,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en get-vendedores:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
