/**
 * API: GET /.netlify/functions/get-cartera
 * Obtiene cartera detallada de clientes del HGI
 * 
 * Parámetros opcionales en query string:
 * - anyo: Año de la cartera (default: año actual)
 * - periodo: Periodo de la cartera (default: período actual)
 * - codigo_tercero: Código del tercero o * para todos (default: *)
 * - codigo_vendedor: Código del vendedor o * para todos (default: *)
 */

const { fetchHGI } = require('./auth-hgi');

exports.handler = async (event, context) => {
  try {
    // Obtener parámetros de la query string
    const queryParams = event.queryStringParameters || {};
    
    const hoy = new Date();
    const anyo = queryParams.anyo || hoy.getFullYear();
    const periodo = queryParams.periodo || String(hoy.getMonth() + 1).padStart(2, '0');
    const codigo_tercero = queryParams.codigo_tercero || '*';
    const codigo_local = queryParams.codigo_local || '*';
    const tipo_cartera = queryParams.tipo_cartera || '*';
    const grupo = queryParams.grupo || '*';
    const codigo_clase = queryParams.codigo_clase || '*';
    const modo_cartera = queryParams.modo_cartera || '1'; // 1 = agrupada
    const codigo_vendedor = queryParams.codigo_vendedor || '*';

    // Construir URL con parámetros
    const endpoint = `/ip_servicios_web/Api/Cartera/ObtenerDetallada?anyo=${anyo}&periodo=${periodo}&codigo_tercero=${codigo_tercero}&codigo_local=${codigo_local}&tipo_cartera=${tipo_cartera}&grupo=${grupo}&codigo_clase=${codigo_clase}&modo_cartera=${modo_cartera}&codigo_vendedor=${codigo_vendedor}&doc_vendedor=false`;

    console.log(`📥 Obteniendo cartera: ${endpoint}`);

    const response = await fetchHGI(endpoint);

    if (!response.ok) {
      throw new Error(`Error HGI ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Cartera obtenida: ${Array.isArray(data) ? data.length : 'datos procesados'}`);

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
        anyo: anyo,
        periodo: periodo,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error en get-cartera:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
